// The YouTube sync pipeline: pulls one user's real subscriptions and recent
// videos and writes them to Subscription/Video/ChannelSnapshot. Call
// syncIfStale(userId) from server code — it only re-syncs if the user's
// data is older than ~24h (plan.md §7); call syncUserSubscriptions(userId)
// directly to force a sync regardless of staleness (e.g. for testing).
//
// Quota-safe call sequence per plan.md §6 / .claude/skill.md — never
// substitute search.list for any of these:
//   1. subscriptions.list (paginated, 1 unit/page)
//   2. channels.list (batched ≤50 ids, 1 unit/call)
//   3. playlistItems.list per channel (1 unit/call)
//   4. videos.list (batched ≤50 ids, 1 unit/call) for duration + views

import type { youtube_v3 } from "googleapis";
import { prisma } from "@/lib/prisma";
import { getYoutubeClientForUser } from "@/lib/youtube/client";
import { matchKeywordCategory } from "@/lib/youtube/categorize";
import { formatDuration, formatCount } from "@/lib/youtube/format";
import { categorizeChannelWithAI, type CategoryOption } from "@/lib/gemini/categorize-channel";
import { ensureBuiltInCategories } from "@/lib/categories/seed";

type YoutubeClient = Awaited<ReturnType<typeof getYoutubeClientForUser>>;
type YoutubeChannel = youtube_v3.Schema$Channel;

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const RECENT_VIDEOS_PER_CHANNEL = 10;
const DEFAULT_CATEGORY_SLUG = "trend";
// Gemini free tier: ~20 requests/day, shared with the on-demand summaries
// feature. This runs automatically during sync (not on-demand), so it needs
// its own cap — see smart-categorization.md's lesson from the summaries work.
const MAX_NEW_CHANNEL_CATEGORIZATIONS_PER_SYNC = 4;

export async function syncIfStale(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastSyncedAt: true },
  });

  const isStale =
    !user?.lastSyncedAt || Date.now() - user.lastSyncedAt.getTime() > STALE_AFTER_MS;

  if (isStale) {
    await syncUserSubscriptions(userId);
  }
}

export async function syncUserSubscriptions(userId: string): Promise<void> {
  const youtube = await getYoutubeClientForUser(userId);

  // Step 1: subscriptions.list, paginated 50/page.
  const channelIds: string[] = [];
  let pageToken: string | undefined;
  do {
    const res = await youtube.subscriptions.list({
      part: ["snippet"],
      mine: true,
      maxResults: 50,
      pageToken,
    });
    for (const item of res.data.items ?? []) {
      const channelId = item.snippet?.resourceId?.channelId;
      if (channelId) channelIds.push(channelId);
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  // Step 2: channels.list, batched up to 50 ids per call.
  await ensureBuiltInCategories(userId);
  const existingCategories = await prisma.category.findMany({ where: { userId } });
  const availableCategories: CategoryOption[] = existingCategories.map((c) => ({ slug: c.slug, name: c.name }));
  const categorizationBudget = { remaining: MAX_NEW_CHANNEL_CATEGORIZATIONS_PER_SYNC };

  const syncedVideoIds: string[] = [];
  for (const batch of chunk(channelIds, 50)) {
    const res = await youtube.channels.list({
      part: ["snippet", "statistics", "contentDetails"],
      id: batch,
      maxResults: 50,
    });

    for (const channel of res.data.items ?? []) {
      const videoIds = await syncOneChannel(youtube, userId, channel, availableCategories, categorizationBudget);
      syncedVideoIds.push(...videoIds);
    }
  }

  // Step 4: videos.list, batched up to 50 ids per call, for duration + views.
  for (const batch of chunk(syncedVideoIds, 50)) {
    const res = await youtube.videos.list({
      part: ["contentDetails", "statistics"],
      id: batch,
    });

    for (const video of res.data.items ?? []) {
      if (!video.id) continue;
      const durationLabel = video.contentDetails?.duration
        ? formatDuration(video.contentDetails.duration)
        : null;
      const viewsLabel = video.statistics?.viewCount
        ? formatCount(Number(video.statistics.viewCount))
        : null;

      await prisma.video.update({
        where: { youtubeVideoId: video.id },
        data: { durationLabel, viewsLabel },
      });
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { lastSyncedAt: new Date() },
  });
}

async function syncOneChannel(
  youtube: YoutubeClient,
  userId: string,
  channel: YoutubeChannel,
  availableCategories: CategoryOption[],
  categorizationBudget: { remaining: number },
): Promise<string[]> {
  const channelId = channel.id;
  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  if (!channelId || !uploadsPlaylistId) return [];

  const channelTitle = channel.snippet?.title ?? "Untitled channel";
  const thumbnailUrl = channel.snippet?.thumbnails?.default?.url ?? null;

  // Per plan.md's subscriber-count rule: hiddenSubscriberCount means never
  // display/guess a number, not "0", not a fallback.
  const subscriberCount = channel.statistics?.hiddenSubscriberCount
    ? null
    : channel.statistics?.subscriberCount
      ? Number(channel.statistics.subscriberCount)
      : null;

  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId_channelId: { userId, channelId } },
    select: { category: true, subcategory: true, categorizedAt: true },
  });

  // Decide once, ever — never re-decided on later syncs (this is what makes
  // "decide once, not every Gemini call" and manual "Move to..." choices
  // both work off a single field, per plan.md/smart-categorization.md).
  let category = existingSubscription?.category ?? DEFAULT_CATEGORY_SLUG;
  let subcategory: string | undefined = existingSubscription?.subcategory ?? undefined;
  let categorizedAt = existingSubscription?.categorizedAt ?? null;

  if (!categorizedAt) {
    const keywordMatch = matchKeywordCategory(channelTitle, channelTitle);
    if (keywordMatch) {
      category = keywordMatch.category;
      subcategory = keywordMatch.subcategory;
      categorizedAt = new Date();
    } else if (categorizationBudget.remaining > 0) {
      categorizationBudget.remaining -= 1;
      const aiSlug = await categorizeChannelWithAI(channelTitle, availableCategories);
      if (aiSlug) {
        category = aiSlug;
        subcategory = undefined;
        categorizedAt = new Date();
      }
      // else: leave categorizedAt null — retried on the next sync, same as
      // the summaries feature's failure handling.
    }
  }

  const subscription = await prisma.subscription.upsert({
    where: { userId_channelId: { userId, channelId } },
    update: {
      channelTitle,
      thumbnailUrl,
      uploadsPlaylistId,
      subscriberCount,
      lastSyncedAt: new Date(),
      category,
      subcategory,
      categorizedAt,
    },
    create: {
      userId,
      channelId,
      channelTitle,
      thumbnailUrl,
      uploadsPlaylistId,
      subscriberCount,
      category,
      subcategory,
      categorizedAt,
    },
  });

  // Append-only — one new row every sync run, never deduped/skipped.
  await prisma.channelSnapshot.create({
    data: { channelId, subscriberCount },
  });

  // Step 3: playlistItems.list on this channel's uploads playlist.
  const videosRes = await youtube.playlistItems.list({
    part: ["snippet", "contentDetails"],
    playlistId: uploadsPlaylistId,
    maxResults: RECENT_VIDEOS_PER_CHANNEL,
  });

  const syncedVideoIds: string[] = [];

  for (const item of videosRes.data.items ?? []) {
    const youtubeVideoId = item.contentDetails?.videoId;
    const title = item.snippet?.title;
    if (!youtubeVideoId || !title) continue;

    // A video always belongs to its channel's category — no per-video
    // guessing from the title. If the channel gets recategorized (manually,
    // or by Gemini on a later sync), every one of its videos should reflect
    // that here too, so this is set on every sync rather than "decided once."
    const videoCategory = { category, subcategory };

    // Summaries are NOT generated here — they're expensive (Gemini's free
    // tier caps at 20 requests/day) and most synced videos are never opened.
    // Generated on-demand instead, via summarizeVideo() (src/lib/gemini/
    // summarize-action.ts), triggered by a button in the video modal.

    const thumb = item.snippet?.thumbnails?.default?.url ?? null;
    const publishedAt = item.contentDetails?.videoPublishedAt
      ? new Date(item.contentDetails.videoPublishedAt)
      : new Date();

    await prisma.video.upsert({
      where: { youtubeVideoId },
      update: {
        title,
        thumbnailUrl: thumb,
        category: videoCategory.category,
        subcategory: videoCategory.subcategory,
      },
      create: {
        youtubeVideoId,
        channelId,
        subscriptionId: subscription.id,
        title,
        publishedAt,
        thumbnailUrl: thumb,
        category: videoCategory.category,
        subcategory: videoCategory.subcategory,
      },
    });

    syncedVideoIds.push(youtubeVideoId);
  }

  return syncedVideoIds;
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

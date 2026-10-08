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
import { isPodcastChannel } from "@/lib/youtube/podcast-detect";
import { matchTopicCategory, type CategoryOption } from "@/lib/youtube/topic-categorize";
import { formatDuration, formatCount } from "@/lib/youtube/format";
import { ensureBuiltInCategories, findOrCreateCategoryByName } from "@/lib/categories/seed";

type YoutubeClient = Awaited<ReturnType<typeof getYoutubeClientForUser>>;
type YoutubeChannel = youtube_v3.Schema$Channel;

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const RECENT_VIDEOS_PER_CHANNEL = 10;
const DEFAULT_CATEGORY_SLUG = "trend";

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

  // Step 2: channels.list, batched up to 50 ids per call. brandingSettings
  // and topicDetails cost nothing extra — same call, just a bigger
  // response — and feed Layers 1-3 of categorization below.
  await ensureBuiltInCategories(userId);
  const existingCategories = await prisma.category.findMany({ where: { userId } });
  const availableCategories: CategoryOption[] = existingCategories.map((c) => ({ slug: c.slug, name: c.name }));

  const syncedVideoIds: string[] = [];
  for (const batch of chunk(channelIds, 50)) {
    const res = await youtube.channels.list({
      part: ["snippet", "statistics", "contentDetails", "brandingSettings", "topicDetails"],
      id: batch,
      maxResults: 50,
    });

    for (const channel of res.data.items ?? []) {
      const videoIds = await syncOneChannel(youtube, userId, channel, availableCategories);
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
    const description = channel.snippet?.description ?? "";
    const brandingKeywords = channel.brandingSettings?.channel?.keywords ?? "";
    const topicUrls = channel.topicDetails?.topicCategories ?? [];

    if (isPodcastChannel(description, brandingKeywords)) {
      // Layer 1 — checked first, wins over everything else. YouTube has no
      // structured "podcast" signal, but the word reliably shows up in a
      // podcast channel's own description/keywords (podcast-detect.ts).
      category = "podcasts";
      subcategory = undefined;
      categorizedAt = new Date();
    } else {
      // Layer 2 — keyword rules against name + branding keywords (NOT the
      // free-text description — that's prose, and generic regex words can
      // coincidentally appear in an unrelated sentence, e.g. a real false
      // positive we hit live: Saregama's description says "radio
      // programming" — programming as in broadcast scheduling, not
      // software — which matched the "fullstack" tech rule. Branding
      // keywords are short, deliberate tags a channel owner wrote on
      // purpose, so they don't carry that same risk).
      const keywordMatch = matchKeywordCategory(`${channelTitle} ${brandingKeywords}`);
      if (keywordMatch) {
        category = keywordMatch.category;
        subcategory = keywordMatch.subcategory;
        categorizedAt = new Date();
      } else {
        // Layer 3 — YouTube's own topic data (topic-categorize.ts). Never
        // guesses: returns null when ambiguous, leaving the channel in
        // `trend` to retry on a later sync.
        const topicMatch = matchTopicCategory(topicUrls, availableCategories);
        if (topicMatch) {
          if (topicMatch.isNew && topicMatch.newCategoryName) {
            await findOrCreateCategoryByName(userId, topicMatch.newCategoryName, topicMatch.slug);
            // So a later channel in this same sync run that needs the same
            // new category reuses it instead of trying to create it again.
            availableCategories.push({ slug: topicMatch.slug, name: topicMatch.newCategoryName });
          }
          category = topicMatch.slug;
          subcategory = undefined;
          categorizedAt = new Date();
        }
        // else: leave categorizedAt null — retried on the next sync.
      }
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

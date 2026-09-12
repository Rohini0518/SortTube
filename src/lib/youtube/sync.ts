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
import { categorizeVideo } from "@/lib/youtube/categorize";
import { formatDuration, formatCount } from "@/lib/youtube/format";

type YoutubeClient = Awaited<ReturnType<typeof getYoutubeClientForUser>>;
type YoutubeChannel = youtube_v3.Schema$Channel;

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const RECENT_VIDEOS_PER_CHANNEL = 10;

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
  const syncedVideoIds: string[] = [];
  for (const batch of chunk(channelIds, 50)) {
    const res = await youtube.channels.list({
      part: ["snippet", "statistics", "contentDetails"],
      id: batch,
      maxResults: 50,
    });

    for (const channel of res.data.items ?? []) {
      const videoIds = await syncOneChannel(youtube, userId, channel);
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

  const { category, subcategory } = categorizeVideo(channelTitle, channelTitle);

  const subscription = await prisma.subscription.upsert({
    where: { userId_channelId: { userId, channelId } },
    update: {
      channelTitle,
      thumbnailUrl,
      uploadsPlaylistId,
      subscriberCount,
      lastSyncedAt: new Date(),
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

    const existing = await prisma.video.findUnique({
      where: { youtubeVideoId },
      select: { classifiedAt: true, category: true, subcategory: true },
    });

    // Never recompute a video's category once classified.
    const videoCategory = existing?.classifiedAt
      ? { category: existing.category, subcategory: existing.subcategory ?? undefined }
      : categorizeVideo(title, channelTitle);

    const thumb = item.snippet?.thumbnails?.default?.url ?? null;
    const publishedAt = item.contentDetails?.videoPublishedAt
      ? new Date(item.contentDetails.videoPublishedAt)
      : new Date();

    await prisma.video.upsert({
      where: { youtubeVideoId },
      update: { title, thumbnailUrl: thumb },
      create: {
        youtubeVideoId,
        channelId,
        subscriptionId: subscription.id,
        title,
        publishedAt,
        thumbnailUrl: thumb,
        category: videoCategory.category,
        subcategory: videoCategory.subcategory,
        classifiedAt: existing?.classifiedAt ?? new Date(),
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

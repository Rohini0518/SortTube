// Fills/refreshes the mock dashboard's data — same shape as the real sync
// pipeline (lib/youtube/sync.ts), but: uses a plain API key instead of
// OAuth (getYoutubePublicClient), and categories are hand-assigned per
// channel (seed-channels.ts) rather than decided by keyword/topic matching,
// since this is a fixed, curated list, not a real person's subscriptions.

import { prisma } from "@/lib/prisma";
import { getYoutubePublicClient } from "@/lib/youtube/client";
import { formatDuration, formatCount } from "@/lib/youtube/format";
import { ensureBuiltInCategories, backfillOrphanedCategories } from "@/lib/categories/seed";
import { MOCK_DASHBOARD_USER_ID, ensureMockDashboardUser } from "@/lib/mock-dashboard/user";
import { MOCK_SEED_CHANNELS } from "@/lib/mock-dashboard/seed-channels";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const RECENT_VIDEOS_PER_CHANNEL = 10;

export async function syncMockDashboardIfStale(): Promise<void> {
  await ensureMockDashboardUser();
  const user = await prisma.user.findUnique({
    where: { id: MOCK_DASHBOARD_USER_ID },
    select: { lastSyncedAt: true },
  });

  const isStale = !user?.lastSyncedAt || Date.now() - user.lastSyncedAt.getTime() > STALE_AFTER_MS;
  if (!isStale) return;

  // Every signed-out page load reaches this — a failure here (missing key,
  // YouTube outage, quota) must never take the whole app down with it. Log
  // and fall through to whatever's already in the database (empty on the
  // very first run, until YOUTUBE_API_KEY is configured).
  try {
    await syncMockDashboard();
  } catch (err) {
    console.error("Mock dashboard sync failed:", err);
  }
}

export async function syncMockDashboard(): Promise<void> {
  await ensureMockDashboardUser();
  await ensureBuiltInCategories(MOCK_DASHBOARD_USER_ID);

  console.log("[mock-sync] MOCK_SEED_CHANNELS raw list:", MOCK_SEED_CHANNELS.length, "entries");
  console.table(MOCK_SEED_CHANNELS.map((s) => ({ handle: s.handle, category: s.category })));

  const youtube = getYoutubePublicClient();

  // Existing subscriptions already know their real channel id — only newly
  // added handles (not yet in the database) need the one-by-one lookup
  // below, so a routine 24h refresh costs one batched call, same as a real
  // account's sync, not 25 individual ones.
  const existingByHandle = new Map(
    (await prisma.subscription.findMany({ where: { userId: MOCK_DASHBOARD_USER_ID } })).map((s) => [
      s.channelHandle,
      s,
    ]),
  );

  const channelIds: { channelId: string; category: string; handle: string }[] = [];
  for (const seed of MOCK_SEED_CHANNELS) {
    console.log(`[mock-sync] seed -> handle: "${seed.handle}", category: "${seed.category}"`);

    const existing = existingByHandle.get(seed.handle);
    if (existing) {
      console.log(
        `[mock-sync]   found existing subscription for ${seed.handle} -> channelId: ${existing.channelId} (using seed category "${seed.category}", db had "${existing.category}")`,
      );
      channelIds.push({ channelId: existing.channelId, category: seed.category, handle: seed.handle });
      continue;
    }

    const res = await youtube.channels.list({ part: ["id"], forHandle: seed.handle });
    const channelId = res.data.items?.[0]?.id;
    if (!channelId) {
      console.error(`Mock dashboard: could not resolve handle ${seed.handle} to a channel id`);
      continue;
    }
    console.log(`[mock-sync]   resolved ${seed.handle} via YouTube API -> channelId: ${channelId}`);
    channelIds.push({ channelId, category: seed.category, handle: seed.handle });
  }

  console.log("[mock-sync] final channelIds list (handle, category, channelId):");
  console.table(channelIds);

  const categoryByChannelId = new Map(channelIds.map((c) => [c.channelId, c.category]));
  const handleByChannelId = new Map(channelIds.map((c) => [c.channelId, c.handle]));

  const syncedVideoIds: string[] = [];

  for (const batch of chunk(
    channelIds.map((c) => c.channelId),
    50,
  )) {
    const res = await youtube.channels.list({
      part: ["snippet", "statistics", "contentDetails"],
      id: batch,
      maxResults: 50,
    });

    for (const channel of res.data.items ?? []) {
      const channelId = channel.id;
      const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
      if (!channelId || !uploadsPlaylistId) continue;

      const category = categoryByChannelId.get(channelId)!;
      const channelTitle = channel.snippet?.title ?? "Untitled channel";
      const thumbnailUrl = channel.snippet?.thumbnails?.default?.url ?? null;

      console.log(
        `[mock-sync] channels.list result -> channelId: ${channelId}, channelTitle: "${channelTitle}", handle: "${handleByChannelId.get(channelId)}", category: "${category}"`,
      );
      const subscriberCount = channel.statistics?.hiddenSubscriberCount
        ? null
        : channel.statistics?.subscriberCount
          ? Number(channel.statistics.subscriberCount)
          : null;

      const subscription = await prisma.subscription.upsert({
        where: { userId_channelId: { userId: MOCK_DASHBOARD_USER_ID, channelId } },
        update: { channelTitle, thumbnailUrl, uploadsPlaylistId, subscriberCount, lastSyncedAt: new Date() },
        create: {
          userId: MOCK_DASHBOARD_USER_ID,
          channelId,
          channelHandle: handleByChannelId.get(channelId)!,
          channelTitle,
          thumbnailUrl,
          uploadsPlaylistId,
          subscriberCount,
          category,
          categorizedAt: new Date(),
        },
      });

      console.log(
        `[mock-sync] upserted subscription id=${subscription.id} channelTitle="${subscription.channelTitle}" category="${subscription.category}"`,
      );

      const videosRes = await youtube.playlistItems.list({
        part: ["snippet", "contentDetails"],
        playlistId: uploadsPlaylistId,
        maxResults: RECENT_VIDEOS_PER_CHANNEL,
      });

      for (const item of videosRes.data.items ?? []) {
        const youtubeVideoId = item.contentDetails?.videoId;
        const title = item.snippet?.title;
        if (!youtubeVideoId || !title) continue;

        const thumb = item.snippet?.thumbnails?.default?.url ?? null;
        const publishedAt = item.contentDetails?.videoPublishedAt
          ? new Date(item.contentDetails.videoPublishedAt)
          : new Date();

        await prisma.video.upsert({
          where: { youtubeVideoId },
          update: { title, thumbnailUrl: thumb, category },
          create: {
            youtubeVideoId,
            channelId,
            subscriptionId: subscription.id,
            title,
            publishedAt,
            thumbnailUrl: thumb,
            category,
          },
        });

        syncedVideoIds.push(youtubeVideoId);
      }
    }
  }

  for (const batch of chunk(syncedVideoIds, 50)) {
    const res = await youtube.videos.list({ part: ["contentDetails", "statistics"], id: batch });
    for (const video of res.data.items ?? []) {
      if (!video.id) continue;
      const durationLabel = video.contentDetails?.duration ? formatDuration(video.contentDetails.duration) : null;
      const viewsLabel = video.statistics?.viewCount ? formatCount(Number(video.statistics.viewCount)) : null;
      await prisma.video.update({ where: { youtubeVideoId: video.id }, data: { durationLabel, viewsLabel } });
    }
  }

  await backfillOrphanedCategories(MOCK_DASHBOARD_USER_ID);

  const finalSubs = await prisma.subscription.findMany({
    where: { userId: MOCK_DASHBOARD_USER_ID },
    select: { channelTitle: true, category: true, channelHandle: true },
  });
  console.log("[mock-sync] FINAL subscriptions in DB after sync (channelTitle, category, handle):");
  console.table(finalSubs);

  await prisma.user.update({ where: { id: MOCK_DASHBOARD_USER_ID }, data: { lastSyncedAt: new Date() } });
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

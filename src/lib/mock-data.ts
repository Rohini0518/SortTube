// Real, Prisma-backed data layer for the app. Keeps the historical filename
// ("mock-data") and every exported function's signature unchanged so the
// page/component layer never had to change during the mock -> real cutover
// (plan.md §13, build-order.md Phase 3) — only what's inside each function
// changed, from static arrays to real database queries scoped to
// resolveTargetUserId() (plan.md §3: signed-in user, or the demo account).

import { prisma } from "@/lib/prisma";
import { resolveTargetUserId } from "@/lib/auth/target-user";
import { formatCount } from "@/lib/youtube/format";
import { DEFAULT_CATEGORIES } from "@/lib/categories/default-categories";
import type { Category, Creator, Video, Activity } from "./types";

export const CATEGORIES: Category[] = DEFAULT_CATEGORIES;

// --- Mapping helpers: DB rows -> the UI's existing Creator/Video shapes ---

type DbSubscription = {
  channelId: string;
  channelTitle: string;
  category: string;
  subcategory: string | null;
  subscriberCount: number | null;
};

function mapSubscriptionToCreator(sub: DbSubscription): Creator {
  return {
    id: sub.channelId,
    name: sub.channelTitle,
    monogram: getMonogram(sub.channelTitle),
    category: sub.category,
    subcategory: sub.subcategory ?? undefined,
    subscriberLabel: sub.subscriberCount != null ? formatCount(sub.subscriberCount) : "—",
  };
}

type DbVideo = {
  id: string;
  youtubeVideoId: string;
  channelId: string;
  title: string;
  publishedAt: Date;
  durationLabel: string | null;
  viewsLabel: string | null;
  category: string;
  subcategory: string | null;
  summary: string | null;
};

function mapVideoToUiVideo(video: DbVideo): Video {
  return {
    id: video.id,
    title: video.title,
    creatorId: video.channelId,
    category: video.category,
    subcategory: video.subcategory ?? undefined,
    publishedAt: video.publishedAt.toISOString().slice(0, 10),
    publishedAgo: formatTimeAgo(video.publishedAt),
    durationLabel: video.durationLabel ?? "—",
    viewsLabel: video.viewsLabel ?? "—",
    placeholderTone: "mid",
    youtubeId: video.youtubeVideoId,
    // AI-generated summary (plan.md §9.1), generalized from the old
    // featured-only "dek" field to appear on every video.
    dek: video.summary ?? undefined,
  };
}

function getMonogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Parses "1.1M" / "180K" / "540" back into a comparable number, for sorting only. */
function parseViews(label: string | null): number {
  if (!label) return 0;
  const n = parseFloat(label);
  if (label.includes("M")) return n * 1_000_000;
  if (label.includes("K")) return n * 1_000;
  return n;
}

function formatTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// --- The API-shaped data layer the page/component layer calls ---

/** The 9 built-in desks plus the target account's own custom ones (empty
 * for the demo account, which never has any — custom categories are
 * signed-in-only, see lib/categories/actions.ts). */
export async function getCategories(): Promise<Category[]> {
  const userId = await resolveTargetUserId();
  const customCategories = await prisma.category.findMany({ where: { userId } });
  return [
    ...CATEGORIES,
    ...customCategories.map((c) => ({ slug: c.slug, name: c.name, standfirst: c.standfirst })),
  ];
}

export async function getFeaturedVideo(): Promise<{ video: Video; creator: Creator }> {
  const userId = await resolveTargetUserId();

  const dbVideo = await prisma.video.findFirst({
    where: { subscription: { userId } },
    orderBy: { publishedAt: "desc" },
    include: { subscription: true },
  });

  if (!dbVideo) {
    throw new Error(`No synced videos found for user ${userId} — has a sync run yet?`);
  }

  return {
    video: { ...mapVideoToUiVideo(dbVideo), isFeatured: true },
    creator: mapSubscriptionToCreator(dbVideo.subscription),
  };
}

export interface FeedSection {
  category: Category;
  items: { video: Video; creator: Creator }[];
}

/** Builds the front-page digest: one section per category, latest few uploads each. */
export async function getFrontPageFeed(limitPerCategory = 3): Promise<FeedSection[]> {
  const userId = await resolveTargetUserId();

  const videos = await prisma.video.findMany({
    where: { subscription: { userId } },
    orderBy: { publishedAt: "desc" },
    include: { subscription: true },
  });

  // The single most recent video is shown as the featured hero story
  // elsewhere on the page — exclude it here so it isn't shown twice.
  const featuredId = videos[0]?.id;

  const categories = await getCategories();
  return categories.map((category) => {
    const items = videos
      .filter((v) => v.category === category.slug && v.id !== featuredId)
      .slice(0, limitPerCategory)
      .map((v) => ({ video: mapVideoToUiVideo(v), creator: mapSubscriptionToCreator(v.subscription) }));
    return { category, items };
  }).filter((section) => section.items.length > 0);
}

export async function getTrendingTicker(): Promise<{ video: Video; creator: Creator }[]> {
  const userId = await resolveTargetUserId();

  const videos = await prisma.video.findMany({
    where: { subscription: { userId } },
    include: { subscription: true },
  });

  return [...videos]
    .sort((a, b) => parseViews(b.viewsLabel) - parseViews(a.viewsLabel))
    .slice(0, 8)
    .map((v) => ({ video: mapVideoToUiVideo(v), creator: mapSubscriptionToCreator(v.subscription) }));
}

/** Activity feed — new uploads across your desks. Milestone/title-change types stay
 * off per plan.md §11 until there's real history to diff against. */
export async function getActivityFeed(): Promise<(Activity & { creator: Creator; video?: Video })[]> {
  const userId = await resolveTargetUserId();

  const videos = await prisma.video.findMany({
    where: { subscription: { userId } },
    orderBy: { publishedAt: "desc" },
    take: 10,
    include: { subscription: true },
  });

  return videos.map((v) => ({
    id: `act-${v.id}`,
    type: "new-video" as const,
    creatorId: v.channelId,
    timeAgo: formatTimeAgo(v.publishedAt),
    videoId: v.id,
    creator: mapSubscriptionToCreator(v.subscription),
    video: mapVideoToUiVideo(v),
  }));
}

/** The target account's real tracked subscriptions, for the Channels management page. */
export async function getTrackedCreators(): Promise<Creator[]> {
  const userId = await resolveTargetUserId();

  const subs = await prisma.subscription.findMany({ where: { userId } });
  return subs.map(mapSubscriptionToCreator);
}

export interface CreatorBlock {
  creator: Creator;
  videos: Video[];
}

/** The full desk for one category ("See full desk" destination): every
 * creator in this category, each with their most recent 4 videos, ordered
 * by whichever creator posted most recently. Returns null for an unknown
 * category slug so the page can 404. */
export async function getCategoryDesk(
  categorySlug: string,
): Promise<{ category: Category; creatorBlocks: CreatorBlock[] } | null> {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return null;

  const userId = await resolveTargetUserId();

  const videos = await prisma.video.findMany({
    where: { subscription: { userId }, category: categorySlug },
    orderBy: { publishedAt: "desc" },
    include: { subscription: true },
  });

  const byChannel = new Map<string, typeof videos>();
  for (const video of videos) {
    const existing = byChannel.get(video.channelId);
    if (existing) {
      existing.push(video);
    } else {
      byChannel.set(video.channelId, [video]);
    }
  }

  // Each channel's own list is already sorted newest-first (from the query
  // above); channels themselves are ordered by their most recent video,
  // since byChannel was built in that same newest-first pass.
  const creatorBlocks: CreatorBlock[] = [...byChannel.values()].map((channelVideos) => ({
    creator: mapSubscriptionToCreator(channelVideos[0].subscription),
    videos: channelVideos.slice(0, 4).map(mapVideoToUiVideo),
  }));

  return { category, creatorBlocks };
}

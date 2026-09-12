// Real, Prisma-backed data layer for the app. Keeps the historical filename
// ("mock-data") and every exported function's signature unchanged so the
// page/component layer never had to change during the mock -> real cutover
// (plan.md §13, build-order.md Phase 3) — only what's inside each function
// changed, from static arrays to real database queries scoped to
// resolveTargetUserId() (plan.md §3: signed-in user, or the demo account).

import { prisma } from "@/lib/prisma";
import { resolveTargetUserId } from "@/lib/auth/target-user";
import { formatCount } from "@/lib/youtube/format";
import type { Category, Creator, Video, Activity, CategorySlug } from "./types";

export const CATEGORIES: Category[] = [
  {
    slug: "news",
    name: "News",
    standfirst: "Verified, curated coverage — no algorithmic outrage bait.",
  },
  {
    slug: "tech",
    name: "Technology",
    standfirst: "Engineering, tooling, and the AI beat, sorted by discipline.",
    subcategories: [
      { slug: "ai", name: "AI" },
      { slug: "frontend", name: "Frontend" },
      { slug: "backend", name: "Backend" },
      { slug: "fullstack", name: "Full-stack" },
    ],
  },
  {
    slug: "sports",
    name: "Sports",
    standfirst: "Match analysis, transfer talk, and post-game breakdowns.",
  },
  {
    slug: "education",
    name: "Education",
    standfirst: "Lectures and explainers worth your attention span.",
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    standfirst: "Film, television, and music — by language and region.",
    subcategories: [
      { slug: "hindi", name: "Hindi Cinema" },
      { slug: "hollywood", name: "Hollywood" },
      { slug: "korean", name: "Korean" },
    ],
  },
  {
    slug: "fashion",
    name: "Fashion",
    standfirst: "Style breakdowns, hauls, and season previews.",
  },
  {
    slug: "vlogs",
    name: "Vlogs",
    standfirst: "Life, travel, and the everyday — from people worth following.",
  },
  {
    slug: "trend",
    name: "Trend Desk",
    standfirst: "What's moving today, tracked before it's everywhere.",
  },
  {
    slug: "fitness",
    name: "Fitness",
    standfirst: "Training, diet, and the discipline behind both.",
  },
];

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
    category: sub.category as CategorySlug,
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
    category: video.category as CategorySlug,
    subcategory: video.subcategory ?? undefined,
    publishedAt: video.publishedAt.toISOString().slice(0, 10),
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
  const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// --- The API-shaped data layer the page/component layer calls ---

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
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

  return CATEGORIES.map((category) => {
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

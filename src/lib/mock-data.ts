import type { Category, Creator, Video, Activity } from "./types";

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

export const CREATORS: Creator[] = [
  // News
  { id: "c-news-1", name: "The Daily Signal", monogram: "DS", category: "news", subscriberLabel: "4.2M" },
  { id: "c-news-2", name: "Groundwork News", monogram: "GN", category: "news", subscriberLabel: "1.8M" },
  { id: "c-news-3", name: "Long Form Report", monogram: "LR", category: "news", subscriberLabel: "980K" },

  // Tech — AI (real channel + real, currently-live upload — see youtubeId)
  { id: "c-tech-ai-bytemonk", name: "ByteMonk", monogram: "BM", category: "tech", subcategory: "ai", subscriberLabel: "303K" },
  // Tech — Frontend
  { id: "c-tech-fe-1", name: "Pixel & Rule", monogram: "PR", category: "tech", subcategory: "frontend", subscriberLabel: "340K" },
  { id: "c-tech-fe-2", name: "The Flexbox Hour", monogram: "FH", category: "tech", subcategory: "frontend", subscriberLabel: "289K" },
  { id: "c-tech-fe-rahul", name: "Frontend Master", monogram: "FM", category: "tech", subcategory: "frontend", subscriberLabel: "—" },
  // Tech — Backend
  { id: "c-tech-be-1", name: "Query Plan Weekly", monogram: "QP", category: "tech", subcategory: "backend", subscriberLabel: "201K" },
  // Tech — Full-stack
  { id: "c-tech-fs-1", name: "Ship It Studio", monogram: "SS", category: "tech", subcategory: "fullstack", subscriberLabel: "512K" },
  { id: "c-tech-fs-tapas", name: "Tapas Adhikary", monogram: "TA", category: "tech", subcategory: "fullstack", subscriberLabel: "37K" },
  // Tech — general (real channels, no subcategory)
  { id: "c-tech-ibm", name: "IBM Technology", monogram: "IT", category: "tech", subscriberLabel: "1.8M" },
  { id: "c-tech-ishan", name: "Ishan Sharma", monogram: "IS", category: "tech", subscriberLabel: "2.1M" },

  // Sports
  { id: "c-sports-1", name: "Full Time Whistle", monogram: "FW", category: "sports", subscriberLabel: "2.3M" },
  { id: "c-sports-2", name: "The Pavilion End", monogram: "PE", category: "sports", subscriberLabel: "1.1M" },
  { id: "c-sports-3", name: "Overtime Desk", monogram: "OD", category: "sports", subscriberLabel: "875K" },

  // Education
  { id: "c-edu-1", name: "The Lecture Hall", monogram: "LH", category: "education", subscriberLabel: "3.1M" },
  { id: "c-edu-2", name: "First Principles", monogram: "FP", category: "education", subscriberLabel: "1.4M" },
  { id: "c-edu-akshay", name: "Akshay Saini", monogram: "AS", category: "education", subscriberLabel: "2.1M" },
  { id: "c-edu-venkatesh", name: "Venkatesh Mogili", monogram: "VM", category: "education", subscriberLabel: "—" },

  // Entertainment
  { id: "c-ent-hi-1", name: "Reel Talkies", monogram: "RT", category: "entertainment", subcategory: "hindi", subscriberLabel: "2.9M" },
  { id: "c-ent-ho-1", name: "Marquee Cut", monogram: "MC", category: "entertainment", subcategory: "hollywood", subscriberLabel: "1.6M" },
  { id: "c-ent-ko-1", name: "Hallyu Weekly", monogram: "HW", category: "entertainment", subcategory: "korean", subscriberLabel: "1.2M" },

  // Fashion
  { id: "c-fash-1", name: "Selvedge & Seam", monogram: "SS", category: "fashion", subscriberLabel: "780K" },
  { id: "c-fash-2", name: "The Fitting Room", monogram: "FR", category: "fashion", subscriberLabel: "540K" },

  // Vlogs
  { id: "c-vlog-1", name: "Slow Roads", monogram: "SR", category: "vlogs", subscriberLabel: "1.9M" },
  { id: "c-vlog-2", name: "Ordinary Days", monogram: "OD", category: "vlogs", subscriberLabel: "690K" },

  // Trend
  { id: "c-trend-1", name: "Zeitgeist Desk", monogram: "ZD", category: "trend", subscriberLabel: "1.1M" },
  { id: "c-trend-2", name: "What's Moving", monogram: "WM", category: "trend", subscriberLabel: "430K" },

  // Fitness
  { id: "c-fit-pandat", name: "Fit Panda - Vishwa Bharath", monogram: "FP", category: "fitness", subscriberLabel: "—" },
  { id: "c-fit-fittuber", name: "FitTuber", monogram: "FT", category: "fitness", subscriberLabel: "8.2M" },
];

const creatorsById = Object.fromEntries(CREATORS.map((c) => [c.id, c]));

export const VIDEOS: Video[] = [
  // Real channels and real, oEmbed-verified uploads (titles/channels/video IDs are genuine —
  // publish dates are shifted to this week and duration/view figures are illustrative,
  // until this is wired to the real YouTube Data API).
  {
    id: "v-featured",
    title: "Namaste AI - Launch QnA | Chit-Chat 🔥",
    creatorId: "c-edu-akshay",
    category: "education",
    publishedAt: "2026-08-20",
    durationLabel: "34:20",
    viewsLabel: "18K",
    placeholderTone: "dark",
    youtubeId: "4caW_jpJ_-I",
    dek: "Akshay Saini opens the floor after launching Namaste AI, taking questions on where the course picks up from his JavaScript work and what's next.",
    isFeatured: true,
  },
  {
    id: "v-ai-bytemonk",
    title: "Level Up with Bytemonk! Exciting times ahead",
    creatorId: "c-tech-ai-bytemonk",
    category: "tech",
    subcategory: "ai",
    publishedAt: "2026-09-07",
    durationLabel: "2:45",
    viewsLabel: "14K",
    placeholderTone: "mid",
    youtubeId: "pYnX5pgZ5tU",
  },
  {
    id: "v-tech-ibm",
    title: "AI vs Machine Learning",
    creatorId: "c-tech-ibm",
    category: "tech",
    publishedAt: "2026-09-05",
    durationLabel: "9:48",
    viewsLabel: "310K",
    placeholderTone: "light",
    youtubeId: "4RixMPF4xis",
  },
  {
    id: "v-tech-ishan",
    title: "He QUIT OpenAI & Built a $3 BILLION Startup in 2 YEARS - Perplexity CEO",
    creatorId: "c-tech-ishan",
    category: "tech",
    publishedAt: "2026-09-06",
    durationLabel: "24:15",
    viewsLabel: "620K",
    placeholderTone: "dark",
    youtubeId: "LwzGyFM28SI",
  },
  {
    id: "v-tech-fe-rahul",
    title: "The Subtle Art of Clearing JavaScript Interviews",
    creatorId: "c-tech-fe-rahul",
    category: "tech",
    subcategory: "frontend",
    publishedAt: "2026-09-04",
    durationLabel: "16:30",
    viewsLabel: "42K",
    placeholderTone: "mid",
    youtubeId: "vAYHh1ATBIo",
  },
  {
    id: "v-tech-fs-tapas",
    title: "Day 01: Introduction to JavaScript & Setting Up Environments",
    creatorId: "c-tech-fs-tapas",
    category: "tech",
    subcategory: "fullstack",
    publishedAt: "2026-09-02",
    durationLabel: "12:40",
    viewsLabel: "6.1K",
    placeholderTone: "light",
    youtubeId: "t8QXF85YovE",
  },
  {
    id: "v-edu-venkatesh",
    title: "Git Crash Course in Telugu for Beginners in 25 minutes",
    creatorId: "c-edu-venkatesh",
    category: "education",
    publishedAt: "2026-09-03",
    durationLabel: "25:00",
    viewsLabel: "56K",
    placeholderTone: "mid",
    youtubeId: "g1afBoOof68",
  },
  {
    id: "v-fit-pandat",
    title: "Diet Plan for Lean Muscle & Bulk Muscle",
    creatorId: "c-fit-pandat",
    category: "fitness",
    publishedAt: "2026-09-06",
    durationLabel: "11:20",
    viewsLabel: "89K",
    placeholderTone: "dark",
    youtubeId: "fg0fbrBZ6S8",
  },
  {
    id: "v-fit-fittuber",
    title: "Who is FitTuber? | Personal Life, Qualifications, Marital Status etc. | Q&A",
    creatorId: "c-fit-fittuber",
    category: "fitness",
    publishedAt: "2026-09-07",
    durationLabel: "19:05",
    viewsLabel: "410K",
    placeholderTone: "light",
    youtubeId: "EExc6X58BTU",
  },

  // News
  { id: "v-news-1", title: "What the new export controls actually change", creatorId: "c-news-1", category: "news", publishedAt: "2026-09-06", durationLabel: "9:14", viewsLabel: "180K", placeholderTone: "mid" },
  { id: "v-news-2", title: "Inside the negotiation nobody covered", creatorId: "c-news-2", category: "news", publishedAt: "2026-09-05", durationLabel: "14:02", viewsLabel: "94K", placeholderTone: "light" },
  { id: "v-news-3", title: "A ground report from the flood recovery zone", creatorId: "c-news-3", category: "news", publishedAt: "2026-09-04", durationLabel: "22:31", viewsLabel: "61K", placeholderTone: "dark" },

  // Tech
  { id: "v-tech-2", title: "Container queries finally killed my media query file", creatorId: "c-tech-fe-1", category: "tech", subcategory: "frontend", publishedAt: "2026-09-04", durationLabel: "10:55", viewsLabel: "145K", placeholderTone: "light" },
  { id: "v-tech-3", title: "Building a design system nobody hates", creatorId: "c-tech-fe-2", category: "tech", subcategory: "frontend", publishedAt: "2026-09-03", durationLabel: "16:20", viewsLabel: "98K", placeholderTone: "dark" },
  { id: "v-tech-4", title: "The query plan that took down our checkout page", creatorId: "c-tech-be-1", category: "tech", subcategory: "backend", publishedAt: "2026-09-02", durationLabel: "19:47", viewsLabel: "72K", placeholderTone: "mid" },
  { id: "v-tech-5", title: "Shipping a full app in a weekend, start to finish", creatorId: "c-tech-fs-1", category: "tech", subcategory: "fullstack", publishedAt: "2026-09-01", durationLabel: "27:10", viewsLabel: "310K", placeholderTone: "light" },

  // Sports
  { id: "v-sports-1", title: "Breaking down the tactical shift nobody noticed", creatorId: "c-sports-1", category: "sports", publishedAt: "2026-09-06", durationLabel: "11:36", viewsLabel: "540K", placeholderTone: "dark" },
  { id: "v-sports-2", title: "The transfer window's quietest, biggest move", creatorId: "c-sports-2", category: "sports", publishedAt: "2026-09-05", durationLabel: "8:52", viewsLabel: "220K", placeholderTone: "mid" },
  { id: "v-sports-3", title: "Post-match: what the numbers actually say", creatorId: "c-sports-3", category: "sports", publishedAt: "2026-09-04", durationLabel: "13:19", viewsLabel: "165K", placeholderTone: "light" },

  // Education
  { id: "v-edu-1", title: "Why entropy is the most misunderstood idea in physics", creatorId: "c-edu-1", category: "education", publishedAt: "2026-09-05", durationLabel: "24:03", viewsLabel: "890K", placeholderTone: "mid" },
  { id: "v-edu-2", title: "A history of the idea of zero", creatorId: "c-edu-2", category: "education", publishedAt: "2026-09-03", durationLabel: "17:45", viewsLabel: "410K", placeholderTone: "dark" },

  // Entertainment
  { id: "v-ent-1", title: "Every award-season contender, ranked and argued about", creatorId: "c-ent-hi-1", category: "entertainment", subcategory: "hindi", publishedAt: "2026-09-06", durationLabel: "20:11", viewsLabel: "1.1M", placeholderTone: "light" },
  { id: "v-ent-2", title: "The trailer breakdown everyone's arguing about", creatorId: "c-ent-ho-1", category: "entertainment", subcategory: "hollywood", publishedAt: "2026-09-05", durationLabel: "9:30", viewsLabel: "670K", placeholderTone: "dark" },
  { id: "v-ent-3", title: "This season's quiet standout, explained", creatorId: "c-ent-ko-1", category: "entertainment", subcategory: "korean", publishedAt: "2026-09-04", durationLabel: "15:02", viewsLabel: "380K", placeholderTone: "mid" },

  // Fashion
  { id: "v-fash-1", title: "Reading a season's runway for what actually sells", creatorId: "c-fash-1", category: "fashion", publishedAt: "2026-09-05", durationLabel: "13:40", viewsLabel: "142K", placeholderTone: "dark" },
  { id: "v-fash-2", title: "Five pieces, twelve outfits — a capsule wardrobe test", creatorId: "c-fash-2", category: "fashion", publishedAt: "2026-09-03", durationLabel: "11:05", viewsLabel: "205K", placeholderTone: "light" },

  // Vlogs
  { id: "v-vlog-1", title: "Three weeks, one bag, no plan", creatorId: "c-vlog-1", category: "vlogs", publishedAt: "2026-09-06", durationLabel: "21:18", viewsLabel: "560K", placeholderTone: "mid" },
  { id: "v-vlog-2", title: "A normal Tuesday, filmed anyway", creatorId: "c-vlog-2", category: "vlogs", publishedAt: "2026-09-04", durationLabel: "14:52", viewsLabel: "128K", placeholderTone: "light" },

  // Trend
  { id: "v-trend-1", title: "The audio trend that quietly took over every feed", creatorId: "c-trend-1", category: "trend", publishedAt: "2026-09-06", durationLabel: "6:40", viewsLabel: "890K", placeholderTone: "dark" },
  { id: "v-trend-2", title: "Why everyone's phone camera looks like this now", creatorId: "c-trend-2", category: "trend", publishedAt: "2026-09-05", durationLabel: "8:15", viewsLabel: "410K", placeholderTone: "mid" },
];

/**
 * Below: an async, API-shaped data layer. Every function returns a Promise so
 * that swapping this module for real YouTube Data API calls later is a
 * drop-in change — nothing in the component layer needs to know the
 * difference.
 */

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

export async function getFeaturedVideo(): Promise<{ video: Video; creator: Creator }> {
  const video = VIDEOS.find((v) => v.isFeatured) ?? VIDEOS[0];
  return { video, creator: creatorsById[video.creatorId] };
}

export interface FeedSection {
  category: Category;
  items: { video: Video; creator: Creator }[];
}

/** Builds the front-page digest: one section per category, latest few uploads each. */
export async function getFrontPageFeed(limitPerCategory = 3): Promise<FeedSection[]> {
  return CATEGORIES.map((category) => {
    const items = VIDEOS.filter((v) => v.category === category.slug && !v.isFeatured)
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
      .slice(0, limitPerCategory)
      .map((video) => ({ video, creator: creatorsById[video.creatorId] }));
    return { category, items };
  }).filter((section) => section.items.length > 0);
}

export async function getTrendingTicker(): Promise<{ video: Video; creator: Creator }[]> {
  return [...VIDEOS]
    .sort((a, b) => parseViews(b.viewsLabel) - parseViews(a.viewsLabel))
    .slice(0, 8)
    .map((video) => ({ video, creator: creatorsById[video.creatorId] }));
}

function parseViews(label: string): number {
  const n = parseFloat(label);
  if (label.includes("M")) return n * 1_000_000;
  if (label.includes("K")) return n * 1_000;
  return n;
}

/** Activity feed — new uploads, subscriber milestones, and title changes across your desks. */
export const ACTIVITIES: Activity[] = [
  { id: "act-1", type: "new-video", creatorId: "c-edu-akshay", timeAgo: "17h ago", videoId: "v-featured" },
  { id: "act-2", type: "milestone", creatorId: "c-tech-ishan", timeAgo: "1d ago", subscriberCount: "2.1M", previousCount: "2.08M", delta: "+20,000" },
  { id: "act-3", type: "new-video", creatorId: "c-tech-ai-bytemonk", timeAgo: "1d ago", videoId: "v-ai-bytemonk" },
  {
    id: "act-4",
    type: "title-change",
    creatorId: "c-tech-ibm",
    timeAgo: "2d ago",
    videoTitle: "AI vs Machine Learning",
    titleVariants: [
      "AI vs Machine Learning",
      "AI vs ML: What's Actually the Difference?",
      "Machine Learning Explained (For Real This Time)",
    ],
  },
  { id: "act-5", type: "milestone", creatorId: "c-sports-1", timeAgo: "2d ago", subscriberCount: "2.3M", previousCount: "2.28M", delta: "+20,000" },
  { id: "act-6", type: "new-video", creatorId: "c-sports-1", timeAgo: "2d ago", videoId: "v-sports-1" },
  { id: "act-7", type: "new-video", creatorId: "c-edu-1", timeAgo: "3d ago", videoId: "v-edu-1" },
  {
    id: "act-8",
    type: "title-change",
    creatorId: "c-vlog-1",
    timeAgo: "4d ago",
    videoTitle: "Three weeks, one bag, no plan",
    titleVariants: ["Three weeks, one bag, no plan", "I Packed One Bag for Three Weeks", "No Plan, One Bag, Three Weeks"],
  },
  { id: "act-9", type: "new-video", creatorId: "c-news-1", timeAgo: "5d ago", videoId: "v-news-1" },
];

export async function getActivityFeed(): Promise<
  (Activity & { creator: Creator; video?: Video })[]
> {
  return ACTIVITIES.map((activity) => ({
    ...activity,
    creator: creatorsById[activity.creatorId],
    video: activity.videoId ? VIDEOS.find((v) => v.id === activity.videoId) : undefined,
  }));
}

/** A representative starting set of "tracked" channels for the Channels management page. */
export async function getTrackedCreators(): Promise<Creator[]> {
  const ids = [
    "c-edu-akshay",
    "c-tech-ai-bytemonk",
    "c-sports-1",
    "c-edu-1",
    "c-ent-hi-1",
    "c-vlog-1",
  ];
  return ids.map((id) => creatorsById[id]);
}

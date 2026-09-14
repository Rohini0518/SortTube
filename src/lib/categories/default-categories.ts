// The 9 built-in desks. Shared by mock-data.ts (for display, merged with a
// user's custom categories) and the sync pipeline (for Gemini's channel-
// categorization prompt) — pulled into its own file specifically so those
// two don't end up in a circular import (sync.ts -> mock-data.ts ->
// target-user.ts -> sync.ts).

import type { Category } from "@/lib/types";

export const DEFAULT_CATEGORIES: Category[] = [
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

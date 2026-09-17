// The 7 built-in desks — seed data only (see seed.ts). Every category,
// built-in or not, lives as a row in the Category table now; this array is
// just the template used to create a user's 7 rows the first time they're
// needed. See topic-based-categorization.md for the full design.

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
    standfirst: "Engineering, tooling, and the gadget beat.",
  },
  {
    slug: "ai",
    name: "AI",
    standfirst: "Models, tools, and the people building with them.",
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
  },
  {
    slug: "fitness",
    name: "Fitness",
    standfirst: "Training, diet, and the discipline behind both.",
  },
  {
    slug: "podcasts",
    name: "Podcasts",
    standfirst: "Long-form conversations, however far they wander.",
  },
];

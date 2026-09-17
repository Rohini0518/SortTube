// Every value categorize.ts's keyword rules can produce. Not the same thing
// as "built-in" anymore — only news/tech/ai/education/entertainment/
// fitness/podcasts are guaranteed to exist for every user (see
// default-categories.ts); sports/fashion/vlogs/trend are still valid
// keyword-rule outputs, they just get auto-created on demand the first time
// a real channel actually needs one (topic-based-categorization.md).
export type CategorySlug =
  | "news"
  | "tech"
  | "ai"
  | "sports"
  | "education"
  | "entertainment"
  | "fashion"
  | "vlogs"
  | "trend"
  | "fitness"
  | "podcasts";

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  // A plain string, not CategorySlug — a user's custom categories (see
  // src/lib/categories/actions.ts) have slugs CategorySlug can't express.
  // CategorySlug itself stays around only for categorize.ts's built-in
  // keyword rules.
  slug: string;
  name: string;
  /** One-line editorial description of what this desk curates. */
  standfirst: string;
}

export interface Creator {
  id: string;
  name: string;
  /** Two-letter monogram used for the bordered avatar placeholder. */
  monogram: string;
  category: string;
  subcategory?: string;
  subscriberLabel: string;
}

export interface Video {
  id: string;
  title: string;
  creatorId: string;
  category: string;
  subcategory?: string;
  publishedAt: string; // ISO date
  /** Relative label computed at read time, e.g. "30m ago" / "2h ago" / "3d ago". */
  publishedAgo: string;
  durationLabel: string;
  viewsLabel: string;
  /** Deterministic tone used to vary the halftone placeholder per-video (when no real thumbnail exists). */
  placeholderTone: "light" | "mid" | "dark";
  /** Real YouTube video ID — when present, a real thumbnail is fetched instead of the halftone placeholder. */
  youtubeId?: string;
  dek?: string; // short editorial summary, used for the featured story only
  isFeatured?: boolean;
}

export type ActivityType = "new-video" | "milestone" | "title-change";

export interface Activity {
  id: string;
  type: ActivityType;
  creatorId: string;
  timeAgo: string;
  /** new-video */
  videoId?: string;
  /** milestone */
  subscriberCount?: string;
  previousCount?: string;
  delta?: string;
  /** title-change */
  videoTitle?: string;
  titleVariants?: string[];
}

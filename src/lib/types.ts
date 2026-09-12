export type CategorySlug =
  | "news"
  | "tech"
  | "sports"
  | "education"
  | "entertainment"
  | "fashion"
  | "vlogs"
  | "trend"
  | "fitness";

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  /** One-line editorial description of what this desk curates. */
  standfirst: string;
  subcategories?: Subcategory[];
}

export interface Creator {
  id: string;
  name: string;
  /** Two-letter monogram used for the bordered avatar placeholder. */
  monogram: string;
  category: CategorySlug;
  subcategory?: string;
  subscriberLabel: string;
}

export interface Video {
  id: string;
  title: string;
  creatorId: string;
  category: CategorySlug;
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

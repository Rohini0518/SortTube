// Layer 3 of channel categorization (topic-based-categorization.md) — only
// reached when keyword matching (categorize.ts) and the podcast check
// (podcast-detect.ts) both find nothing. Uses YouTube's own topicCategories
// data (real signal, zero AI, zero extra API cost) instead of guessing.

import { slugify } from "@/lib/categories/slugify";

export interface CategoryOption {
  slug: string;
  name: string;
}

// A few of YouTube's topic labels are really the same real-world thing
// wearing different names — collapse them to one canonical concept first,
// so multiple music-genre topics never create separate near-duplicate
// categories.
const TOPIC_ALIASES: Record<string, string> = {
  Pop_music: "Music",
  Independent_music: "Music",
  Rock_music: "Music",
  Soul_music: "Music",
  Music_of_Asia: "Music",
};

// Confident, direct equivalences only — checked before anything gets
// auto-created. Deliberately short: everything else becomes its own new
// category the first time a real channel needs it, rather than being
// force-mapped to something approximate.
const DIRECT_EQUIVALENCE: Record<string, string> = {
  Technology: "tech",
  Health: "fitness",
  Politics: "news",
  Tourism: "vlogs",
  Film: "entertainment",
};

function canonicalizeTopic(topicUrl: string): string {
  const raw = decodeURIComponent(topicUrl.split("/").pop() ?? topicUrl);
  if (TOPIC_ALIASES[raw]) return TOPIC_ALIASES[raw];
  return raw.replace(/_\(.*\)$/, "").replace(/_/g, " ");
}

export interface TopicMatchResult {
  slug: string;
  isNew: boolean;
  newCategoryName?: string;
}

/** Returns null whenever the result would be ambiguous — never guesses.
 * The caller leaves the channel in `trend` to retry on a later sync, same
 * as every other "couldn't confidently decide" case in this pipeline.
 * YouTube's topic order isn't stable between calls (confirmed by testing
 * the same real channel twice), so this never relies on array position —
 * only on how many distinct concepts are present. */
export function matchTopicCategory(
  topicUrls: string[],
  existingCategories: CategoryOption[],
): TopicMatchResult | null {
  if (topicUrls.length === 0) return null;

  const canonicalNames = [...new Set(topicUrls.map(canonicalizeTopic))];

  // 1. Direct equivalence table — only counts if exactly one canonical
  // topic maps to a category the user actually has.
  const directSlugs = new Set(
    canonicalNames
      .map((name) => DIRECT_EQUIVALENCE[name])
      .filter((slug): slug is string => Boolean(slug) && existingCategories.some((c) => c.slug === slug)),
  );
  if (directSlugs.size === 1) return { slug: [...directSlugs][0], isNew: false };
  if (directSlugs.size > 1) return null;

  // 2. Does a canonical topic already match one of the user's own existing
  // categories by name (e.g. they already have "Music" from another
  // channel this run, or a past one)? Anything left over is a candidate
  // for step 3.
  const existingByName = new Map(existingCategories.map((c) => [c.name.toLowerCase(), c.slug]));
  const resolvedSlugs = new Set<string>();
  const unresolved: string[] = [];
  for (const name of canonicalNames) {
    const slug = existingByName.get(name.toLowerCase());
    if (slug) resolvedSlugs.add(slug);
    else unresolved.push(name);
  }
  if (resolvedSlugs.size === 1 && unresolved.length === 0) {
    return { slug: [...resolvedSlugs][0], isNew: false };
  }
  if (resolvedSlugs.size > 0) return null; // mixed known + unknown — ambiguous

  // 3. Nothing matches anything existing — auto-create, but only when
  // there's exactly one confident, unambiguous concept left over.
  const uniqueUnresolved = [...new Set(unresolved)];
  if (uniqueUnresolved.length === 1) {
    const name = uniqueUnresolved[0];
    return { slug: slugify(name), isNew: true, newCategoryName: name };
  }
  return null;
}

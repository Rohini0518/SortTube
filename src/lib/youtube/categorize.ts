// Keyword/regex categorization, per plan.md §8: matches a video's title +
// channel name against simple rules to bucket it into a CategorySlug. Runs
// once per video at sync time (see sync.ts) — v1 only, no LLM involved.
// Unmatched videos fall into "trend" as the default bucket rather than being
// dropped, per plan.md §8.

import type { CategorySlug } from "@/lib/types";

interface Rule {
  category: CategorySlug;
  subcategory?: string;
  pattern: RegExp;
}

const RULES: Rule[] = [
  { category: "tech", subcategory: "ai", pattern: /\b(ai|artificial intelligence|llm|gpt|chatgpt|gemini|claude|machine learning)\b/i },
  { category: "tech", subcategory: "frontend", pattern: /\b(react|css|frontend|tailwind|javascript|typescript|next\.?js|vue|html)\b/i },
  { category: "tech", subcategory: "backend", pattern: /\b(backend|database|sql|api|server|node\.?js|postgres|docker)\b/i },
  { category: "tech", subcategory: "fullstack", pattern: /\b(full[- ]?stack|web dev(eloper)?|coding|programming)\b/i },
  { category: "tech", pattern: /\b(tech|technology|gadget|software|startup)\b/i },

  { category: "sports", pattern: /\b(football|cricket|match|tournament|nba|fifa|goal|highlights|sports?)\b/i },

  { category: "education", pattern: /\b(lecture|course|tutorial|learn|explained|physics|maths?|science|education)\b/i },

  { category: "entertainment", subcategory: "hindi", pattern: /\b(bollywood|hindi film|hindi movie)\b/i },
  { category: "entertainment", subcategory: "hollywood", pattern: /\b(hollywood|marvel|movie trailer|movie review)\b/i },
  { category: "entertainment", subcategory: "korean", pattern: /\b(k-?drama|k-?pop|korean drama)\b/i },
  { category: "entertainment", pattern: /\b(movie|film|series|entertainment|celebrity)\b/i },

  { category: "fashion", pattern: /\b(fashion|outfit|style|haul|wardrobe)\b/i },

  { category: "vlogs", pattern: /\b(vlog|day in my life|travel diary)\b/i },

  { category: "fitness", pattern: /\b(workout|gym|fitness|diet plan|exercise|bodybuilding)\b/i },

  { category: "news", pattern: /\b(news|breaking|headlines)\b/i },
];

/** Returns null when nothing matches, instead of defaulting — lets a caller
 * (the channel-categorization path in sync.ts) distinguish "keyword rules
 * genuinely found nothing" from "confidently matched," so it knows when to
 * try the Gemini fallback rather than just silently landing on `trend`. */
export function matchKeywordCategory(
  title: string,
  channelTitle: string,
): { category: CategorySlug; subcategory?: string } | null {
  const haystack = `${title} ${channelTitle}`;
  for (const rule of RULES) {
    if (rule.pattern.test(haystack)) {
      return { category: rule.category, subcategory: rule.subcategory };
    }
  }
  return null;
}

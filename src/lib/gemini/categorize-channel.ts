// Asks an AI to pick the best category for a channel — only called from
// sync.ts when keyword rules (categorize.ts) find no match at all. Given
// the channel's name plus every available category (the 9 built-ins + the
// signed-in user's own custom ones), returns one of those exact slugs, or
// null if nothing usable comes back (caller falls back to the default
// "trend" bucket in that case, same as the keyword path).
//
// Text generation itself (Gemini, with a Groq fallback) lives in
// lib/ai/generate-text.ts, shared with video summaries.

import { generateText } from "@/lib/ai/generate-text";

export interface CategoryOption {
  slug: string;
  name: string;
}

export async function categorizeChannelWithAI(
  channelTitle: string,
  availableCategories: CategoryOption[],
): Promise<string | null> {
  const optionsList = availableCategories.map((c) => `${c.slug}: ${c.name}`).join("\n");

  const prompt = `A YouTube channel named "${channelTitle}" needs to be sorted into exactly one of the categories below. Reply with ONLY that category's slug (the part before the colon) — no punctuation, no explanation, nothing else.

${optionsList}`;

  const text = await generateText(prompt);
  const slug = text?.trim().toLowerCase() ?? null;

  const validSlugs = new Set(availableCategories.map((c) => c.slug));
  return slug && validSlugs.has(slug) ? slug : null;
}

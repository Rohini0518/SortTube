// Asks Gemini to pick the best category for a channel — only called from
// sync.ts when keyword rules (categorize.ts) find no match at all. Given
// the channel's name plus every available category (the 9 built-ins + the
// signed-in user's own custom ones), returns one of those exact slugs, or
// null if Gemini's answer doesn't cleanly match any of them (caller falls
// back to the default "trend" bucket in that case, same as the keyword path).

const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface CategoryOption {
  slug: string;
  name: string;
}

export async function categorizeChannelWithGemini(
  channelTitle: string,
  availableCategories: CategoryOption[],
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const optionsList = availableCategories.map((c) => `${c.slug}: ${c.name}`).join("\n");

  const prompt = `A YouTube channel named "${channelTitle}" needs to be sorted into exactly one of the categories below. Reply with ONLY that category's slug (the part before the colon) — no punctuation, no explanation, nothing else.

${optionsList}`;

  try {
    const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!res.ok) {
      console.error("Gemini channel-categorization request failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const slug = typeof text === "string" ? text.trim().toLowerCase() : null;

    const validSlugs = new Set(availableCategories.map((c) => c.slug));
    return slug && validSlugs.has(slug) ? slug : null;
  } catch (err) {
    console.error("Gemini channel-categorization request threw:", err);
    return null;
  }
}

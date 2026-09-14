// Shared "ask an AI" helper used by both channel categorization
// (gemini/categorize-channel.ts) and video summaries (gemini/summarize.ts).
// Tries Gemini first; if Gemini fails for ANY reason — missing key, daily
// quota exhausted (429), or the free tier being temporarily overloaded
// (503 "high demand", which we've hit live during testing) — falls back to
// Groq, a separate company with its own independent quota, so one
// provider's outage/quota doesn't take out both AI features at once.

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Groq's own "compound" meta-model — routes internally to whichever
// underlying model is available, so it doesn't need a version pin the way
// a single named model would.
const GROQ_MODEL = "groq/compound-mini";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

async function generateWithGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!res.ok) {
      console.error("Gemini request failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" ? text.trim() : null;
  } catch (err) {
    console.error("Gemini request threw:", err);
    return null;
  }
}

async function generateWithGroq(prompt: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error("Groq request failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" ? text.trim() : null;
  } catch (err) {
    console.error("Groq request threw:", err);
    return null;
  }
}

/** Tries Gemini, then Groq if Gemini fails. Returns null only if both do. */
export async function generateText(prompt: string): Promise<string | null> {
  const geminiResult = await generateWithGemini(prompt);
  if (geminiResult) return geminiResult;

  console.warn("Gemini unavailable — falling back to Groq.");
  return generateWithGroq(prompt);
}

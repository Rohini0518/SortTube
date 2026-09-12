// Generates a short, honest per-video summary from title + description via
// Gemini's REST API directly (no SDK — a plain fetch to a tested-working
// endpoint avoids depending on a specific package/version). Called once per
// video at sync time (see sync.ts); the caller is responsible for caching
// the result forever via Video.summarizedAt.
//
// v1 source is title + description only — this is a "smart blurb," not a
// transcript-grounded summary (plan.md §9.1). The prompt is explicit about
// that distinction so the model never implies it watched the video.

// "-latest" alias instead of a pinned version, so this doesn't silently
// break the next time Google retires an old model (as gemini-2.5-flash was
// mid-build here).
const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const MAX_DESCRIPTION_CHARS = 1000;

export async function generateVideoSummary(
  title: string,
  description: string,
  channelTitle: string,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are writing a short, honest blurb for a YouTube video based only on its title and description below — you have not watched the video itself, so never state details not implied by this text.

Write exactly 4 short lines (not full paragraphs). Don't mention that you haven't watched it or that this is based on limited information; just write the blurb naturally, like an editorial summary.

Channel: ${channelTitle}
Title: ${title}
Description: ${description.slice(0, MAX_DESCRIPTION_CHARS) || "(no description provided)"}`;

  try {
    const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!res.ok) {
      console.error("Gemini summary request failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" ? text.trim() : null;
  } catch (err) {
    console.error("Gemini summary request threw:", err);
    return null;
  }
}

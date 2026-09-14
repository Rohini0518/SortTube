// Generates a short, honest per-video summary from title + description.
// Called once per video at sync time (see sync.ts); the caller is
// responsible for caching the result forever via Video.summarizedAt.
//
// v1 source is title + description only — this is a "smart blurb," not a
// transcript-grounded summary (plan.md §9.1). The prompt is explicit about
// that distinction so the model never implies it watched the video.
//
// Text generation itself (Gemini, with a Groq fallback) lives in
// lib/ai/generate-text.ts, shared with channel categorization.

import { generateText } from "@/lib/ai/generate-text";

const MAX_DESCRIPTION_CHARS = 1000;

export async function generateVideoSummary(
  title: string,
  description: string,
  channelTitle: string,
): Promise<string | null> {
  const prompt = `You are writing a short, honest blurb for a YouTube video based only on its title and description below — you have not watched the video itself, so never state details not implied by this text.

Write exactly 4 short lines (not full paragraphs). Don't mention that you haven't watched it or that this is based on limited information; just write the blurb naturally, like an editorial summary.

Channel: ${channelTitle}
Title: ${title}
Description: ${description.slice(0, MAX_DESCRIPTION_CHARS) || "(no description provided)"}`;

  return generateText(prompt);
}

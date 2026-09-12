// The summary area inside the video modal: shows the cached AI summary if
// one exists, otherwise a "Summarize" button that generates one on demand
// (via the summarizeVideo server action). Kept separate from the AI call
// itself, since generation is deliberately NOT automatic at sync time —
// see summarize-action.ts for why.

"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { summarizeVideo } from "@/lib/gemini/summarize-action";

export function VideoSummarySection({
  videoId,
  initialSummary,
}: {
  videoId?: string;
  initialSummary?: string;
}) {
  const [summary, setSummary] = useState(initialSummary ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (summary) {
    return (
      <div className="border-t-2 border-foreground bg-card px-5 py-4">
        <p className="mb-1.5 font-heading text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          AI summary
        </p>
        <p className="font-body text-sm leading-relaxed text-foreground">{summary}</p>
      </div>
    );
  }

  // No internal video id (shouldn't normally happen) means we can't call
  // the action at all — quietly show nothing rather than a dead button.
  if (!videoId) return null;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await summarizeVideo(videoId!);
      if (result.ok && result.summary) {
        setSummary(result.summary);
      } else {
        setError(result.message ?? "Something went wrong — try again later.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-foreground bg-card px-5 py-4">
      <p className="font-body text-sm text-muted-foreground">
        {error ?? "No summary yet — generate a quick AI blurb from this video's title and description."}
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-foreground bg-tertiary px-4 py-2 font-heading text-xs font-bold text-foreground pop-shadow disabled:opacity-50"
      >
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
        {isPending ? "Summarizing…" : "Summarize"}
      </button>
    </div>
  );
}

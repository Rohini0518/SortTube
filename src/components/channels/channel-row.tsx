"use client";

import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import type { Creator } from "@/lib/types";

const AVATAR_TONES = ["bg-accent", "bg-secondary", "bg-tertiary", "bg-quaternary"];
function toneForId(id: string) {
  const sum = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
}

export function ChannelRow({
  creator,
  paused,
  onTogglePause,
  onRemove,
}: {
  creator: Creator;
  paused: boolean;
  onTogglePause: () => void;
  onRemove: () => void;
}) {
  const tone = toneForId(creator.id);
  const isLight = tone === "bg-tertiary" || tone === "bg-quaternary";

  return (
    <Card shadow="slate" hover={false} className="flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-foreground font-heading text-sm font-bold ${tone} ${isLight ? "text-foreground" : "text-white"}`}
        >
          {creator.monogram}
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-extrabold text-foreground">{creator.name}</p>
          <p className="font-body text-sm text-muted-foreground">
            @{creator.name.toLowerCase().replace(/[^a-z0-9]+/g, "")} · {creator.subscriberLabel} subscribers
          </p>
          <Pill tone={paused ? "cream" : "mint"} className="mt-1.5">
            {paused ? "Paused" : "Tracking active"}
          </Pill>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onTogglePause}
          className="rounded-full border-2 border-foreground bg-card px-4 py-2 font-heading text-sm font-bold text-foreground hover:bg-tertiary"
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="font-heading text-sm font-bold text-muted-foreground hover:text-secondary"
        >
          Remove
        </button>
      </div>
    </Card>
  );
}

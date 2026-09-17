"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { recategorizeChannel } from "@/lib/categories/actions";
import type { Category, Creator } from "@/lib/types";

const AVATAR_TONES = ["bg-accent", "bg-secondary", "bg-tertiary", "bg-quaternary"];
function toneForId(id: string) {
  const sum = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
}

export function ChannelRow({
  creator,
  categories,
  paused,
  onTogglePause,
  onRemove,
  onRecategorized,
}: {
  creator: Creator;
  categories: Category[];
  paused: boolean;
  onTogglePause: () => void;
  onRemove: () => void;
  onRecategorized: (newCategory: string) => void;
}) {
  const tone = toneForId(creator.id);
  const isLight = tone === "bg-tertiary" || tone === "bg-quaternary";
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const currentCategory = categories.find((c) => c.slug === creator.category);

  function handleMoveTo(newSlug: string) {
    if (newSlug === creator.category) return;
    setError(null);

    // Signed out: nothing to persist (this is the shared mock dashboard),
    // so just update local state, same as Pause/Remove already do — no
    // server call at all.
    if (!isSignedIn) {
      onRecategorized(newSlug);
      return;
    }

    startTransition(async () => {
      const result = await recategorizeChannel(creator.id, newSlug);
      if (result.ok) {
        onRecategorized(newSlug);
      } else {
        setError(result.message);
      }
    });
  }

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
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Pill tone={paused ? "cream" : "mint"}>{paused ? "Paused" : "Tracking active"}</Pill>
            <Pill tone="violet">{currentCategory?.name ?? creator.category}</Pill>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-3">
          <select
            aria-label={`Move ${creator.name} to a different category`}
            value={creator.category}
            disabled={isPending}
            onChange={(e) => handleMoveTo(e.target.value)}
            className="rounded-full border-2 border-foreground bg-card px-4 py-2 font-heading text-sm font-bold text-foreground disabled:opacity-40"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
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
        {error && <span className="font-body text-xs text-secondary">{error}</span>}
      </div>
    </Card>
  );
}

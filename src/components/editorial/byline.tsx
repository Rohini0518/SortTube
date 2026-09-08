import { cn } from "@/lib/utils";
import type { Creator } from "@/lib/types";

const AVATAR_TONES = ["bg-accent", "bg-secondary", "bg-tertiary", "bg-quaternary"];

function toneForId(id: string) {
  const sum = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
}

export function Byline({
  creator,
  showSubs = false,
  className,
}: {
  creator: Creator;
  showSubs?: boolean;
  className?: string;
}) {
  const tone = toneForId(creator.id);
  const isLight = tone === "bg-tertiary" || tone === "bg-quaternary";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground font-heading text-xs font-bold",
          tone,
          isLight ? "text-foreground" : "text-white",
        )}
      >
        {creator.monogram}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-heading text-sm font-bold text-foreground">{creator.name}</span>
        {showSubs && (
          <span className="block font-body text-xs font-medium text-muted-foreground">
            {creator.subscriberLabel} subscribers
          </span>
        )}
      </span>
    </div>
  );
}

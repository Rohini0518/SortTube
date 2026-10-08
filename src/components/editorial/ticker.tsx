import { Flame } from "lucide-react";
import type { Creator, Video } from "@/lib/types";

function TickerItems({ items }: { items: { video: Video; creator: Creator }[] }) {
  return (
    <>
      {items.map(({ video, creator }, i) => (
        <span key={`${video.id}-${i}`} className="flex shrink-0 items-center gap-2 pr-10">
          <span className="font-heading text-sm font-bold text-background">{video.title}</span>
          <span className="font-body text-xs text-background/60">— {creator.name}</span>
        </span>
      ))}
    </>
  );
}

export function Ticker({ items }: { items: { video: Video; creator: Creator }[] }) {
  return (
    <div className="mx-auto mb-10 mt-6 max-w-screen-xl px-4 sm:px-6">
      <div className="flex items-stretch overflow-hidden rounded-2xl border-2 border-foreground bg-foreground">
        <span className="flex shrink-0 items-center gap-1.5 bg-secondary px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-wide text-white">
          <Flame className="h-3.5 w-3.5" strokeWidth={2.5} />
          Trending
        </span>
        <div className="flex flex-1 overflow-hidden py-2.5" role="marquee" aria-label="Trending videos">
          <div className="ticker-track flex w-max shrink-0">
            <TickerItems items={items} />
            <span aria-hidden="true" className="contents">
              <TickerItems items={items} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

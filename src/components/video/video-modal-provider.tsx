"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import { VideoSummarySection } from "@/components/video/video-summary-section";

interface WatchTarget {
  youtubeId: string;
  title: string;
  /** The video's internal DB id — needed to call the on-demand summarize
   * action. Undefined only if a caller genuinely has no DB row for it. */
  videoId?: string;
  /** Cached AI summary from title+description (plan.md §9.1) — never a
   * claim the video was actually watched, just a "smart blurb." */
  summary?: string;
}

interface VideoModalContextValue {
  open: (video: WatchTarget) => void;
}

const VideoModalContext = createContext<VideoModalContextValue | null>(null);

export function useVideoModal() {
  const ctx = useContext(VideoModalContext);
  if (!ctx) throw new Error("useVideoModal must be used within VideoModalProvider");
  return ctx;
}

export function VideoModalProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<WatchTarget | null>(null);

  const open = useCallback((video: WatchTarget) => setActive(video), []);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close]);

  return (
    <VideoModalContext.Provider value={{ open }}>
      {children}

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4 pop-in"
          onClick={close}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_#1E293B]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-foreground bg-tertiary px-5 py-3">
              <h3 className="truncate font-heading text-sm font-bold text-foreground">{active.title}</h3>
              <button
                type="button"
                aria-label="Close video"
                onClick={close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-card hover:bg-secondary"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                key={active.youtubeId}
                src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <VideoSummarySection
              key={active.videoId ?? active.youtubeId}
              videoId={active.videoId}
              initialSummary={active.summary}
            />
          </div>
        </div>
      )}
    </VideoModalContext.Provider>
  );
}

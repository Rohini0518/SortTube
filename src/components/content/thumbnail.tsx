"use client";

import { Play } from "lucide-react";
import {
  Newspaper,
  Cpu,
  Trophy,
  GraduationCap,
  Clapperboard,
  Shirt,
  Camera,
  TrendingUp,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideoModal } from "@/components/video/video-modal-provider";
import type { CategorySlug, Video } from "@/lib/types";

const TONE_STYLES: Record<Video["placeholderTone"], string> = {
  light: "bg-quaternary/20",
  mid: "bg-secondary/15",
  dark: "bg-accent/15",
};

const CATEGORY_ICON: Record<CategorySlug, typeof Newspaper> = {
  news: Newspaper,
  tech: Cpu,
  sports: Trophy,
  education: GraduationCap,
  entertainment: Clapperboard,
  fashion: Shirt,
  vlogs: Camera,
  trend: TrendingUp,
  fitness: Dumbbell,
};

/** "Blob" radius — rounded on three corners, sharp on one, per the design system's varied-radii rule. */
const BLOB_RADIUS = "rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md";

export function Thumbnail({
  video,
  aspect = "aspect-video",
  className,
  priority = false,
}: {
  video: Video;
  aspect?: string;
  className?: string;
  priority?: boolean;
}) {
  const Icon = CATEGORY_ICON[video.category];
  const { open } = useVideoModal();
  const canPlay = Boolean(video.youtubeId);

  return (
    <button
      type="button"
      disabled={!canPlay}
      onClick={() => canPlay && open({ youtubeId: video.youtubeId!, title: video.title })}
      aria-label={canPlay ? `Play ${video.title}` : video.title}
      className={cn(
        "group/thumb relative block w-full overflow-hidden border-2 border-foreground text-left",
        BLOB_RADIUS,
        aspect,
        canPlay ? "cursor-pointer" : "cursor-default",
        className,
      )}
    >
      {video.youtubeId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
        />
      ) : (
        <div className={cn("flex h-full w-full items-center justify-center", TONE_STYLES[video.placeholderTone])}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-card">
            <Icon className="h-5 w-5 text-foreground" strokeWidth={2.5} aria-hidden="true" />
          </span>
        </div>
      )}

      {canPlay && (
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors duration-200 group-hover/thumb:bg-foreground/25">
          <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full border-2 border-foreground bg-accent text-white opacity-0 shadow-[3px_3px_0px_0px_#1E293B] transition-all duration-200 group-hover/thumb:scale-100 group-hover/thumb:opacity-100">
            <Play className="ml-0.5 h-5 w-5 fill-current" strokeWidth={0} />
          </span>
        </span>
      )}

      <span className="absolute bottom-2 right-2 rounded-full border-2 border-foreground bg-card px-2 py-0.5 font-heading text-[11px] font-bold leading-none text-foreground">
        {video.durationLabel}
      </span>
    </button>
  );
}

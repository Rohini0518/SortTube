"use client";

import { Play } from "lucide-react";
import { Byline } from "@/components/editorial/byline";
import { Thumbnail } from "@/components/content/thumbnail";
import { Card } from "@/components/ui/card";
import { useVideoModal } from "@/components/video/video-modal-provider";
import type { Creator, Video } from "@/lib/types";

const TAG_TONE = {
  accent: "bg-accent text-white",
  secondary: "bg-secondary text-white",
  tertiary: "bg-tertiary text-foreground",
  quaternary: "bg-quaternary text-foreground",
} as const;

type Tone = keyof typeof TAG_TONE;

function SubcategoryTag({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`mb-2 inline-block rounded-full border-2 border-foreground px-2.5 py-0.5 font-heading text-[11px] font-bold uppercase tracking-wide ${TAG_TONE[tone]}`}>
      {label}
    </span>
  );
}

function PlayableTitle({
  video,
  className,
}: {
  video: Video;
  className: string;
}) {
  const { open } = useVideoModal();
  if (!video.youtubeId) {
    return <h3 className={className}>{video.title}</h3>;
  }
  return (
    <button
      type="button"
      onClick={() =>
        open({ youtubeId: video.youtubeId!, title: video.title, videoId: video.id, summary: video.dek })
      }
      className={`${className} text-left`}
    >
      {video.title}
    </button>
  );
}

export function VideoCardLead({
  video,
  creator,
  subcategoryLabel,
  tone = "accent",
}: {
  video: Video;
  creator: Creator;
  subcategoryLabel?: string;
  tone?: Tone;
}) {
  return (
    <Card shadow={tone === "accent" ? "violet" : tone === "secondary" ? "pink" : tone === "tertiary" ? "yellow" : "mint"} className="p-4">
      <Thumbnail video={video} className="mb-3" priority />
      {subcategoryLabel && <SubcategoryTag label={subcategoryLabel} tone={tone} />}
      <PlayableTitle video={video} className="font-heading text-xl font-extrabold leading-tight text-foreground hover:text-accent" />
      <div className="mt-3 flex items-center justify-between gap-4">
        <Byline creator={creator} />
        <span className="shrink-0 font-body text-xs font-medium text-muted-foreground">{video.viewsLabel} views</span>
      </div>
    </Card>
  );
}

export function VideoBrief({
  video,
  creator,
  subcategoryLabel,
  tone = "accent",
}: {
  video: Video;
  creator: Creator;
  subcategoryLabel?: string;
  tone?: Tone;
}) {
  const { open } = useVideoModal();
  return (
    <div className="group flex items-start gap-4 border-b-2 border-dashed border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
      <Thumbnail video={video} aspect="aspect-[4/3]" className="w-28 shrink-0 sm:w-36" />
      <div className="min-w-0 flex-1">
        {subcategoryLabel && <SubcategoryTag label={subcategoryLabel} tone={tone} />}
        <PlayableTitle
          video={video}
          className="font-heading text-base font-extrabold leading-snug text-foreground hover:text-accent sm:text-lg"
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Byline creator={creator} className="shrink-0" />
          <span className="font-body text-xs font-medium text-muted-foreground">{video.viewsLabel} views</span>
          {video.youtubeId && (
            <button
              type="button"
              onClick={() =>
                open({ youtubeId: video.youtubeId!, title: video.title, videoId: video.id, summary: video.dek })
              }
              className="ml-auto flex items-center gap-1 rounded-full border-2 border-foreground bg-card px-2.5 py-1 font-heading text-[11px] font-bold text-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-tertiary"
            >
              <Play className="h-3 w-3 fill-current" strokeWidth={0} />
              Play
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

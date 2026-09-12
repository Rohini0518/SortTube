"use client";

import { Play } from "lucide-react";
import { Byline } from "@/components/editorial/byline";
import { Thumbnail } from "@/components/content/thumbnail";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { useVideoModal } from "@/components/video/video-modal-provider";
import type { Creator, Video } from "@/lib/types";

export function FeaturedStory({ video, creator }: { video: Video; creator: Creator }) {
  const { open } = useVideoModal();

  return (
    <section className="relative overflow-hidden pb-14 pt-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-16 h-80 w-80 rounded-full bg-tertiary/40 sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-32 h-40 w-40 rounded-full bg-quaternary/30"
      />

      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <Pill tone="violet">🔥 Lead story</Pill>
          <h1 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] text-foreground sm:text-5xl">
            {video.title}
          </h1>
          {video.dek && <p className="mt-5 font-body text-base leading-relaxed text-muted-foreground">{video.dek}</p>}

          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border-2 border-foreground bg-card px-4 py-3">
            <Byline creator={creator} showSubs />
            <span className="shrink-0 font-body text-xs font-medium text-muted-foreground">
              {video.viewsLabel} views · {video.publishedAgo}
            </span>
          </div>

          {video.youtubeId && (
            <Button
              variant="primary"
              className="mt-6 w-full sm:w-auto"
              onClick={() =>
                open({ youtubeId: video.youtubeId!, title: video.title, videoId: video.id, summary: video.dek })
              }
            >
              <Play className="h-4 w-4 fill-current" strokeWidth={0} />
              Watch here
            </Button>
          )}
        </div>
        <div className="order-1 lg:order-2 lg:col-span-7">
          <Thumbnail video={video} className="pop-shadow" priority />
        </div>
      </div>
    </section>
  );
}

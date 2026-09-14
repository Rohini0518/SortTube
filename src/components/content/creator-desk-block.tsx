// One creator's block on a category's full-desk page (/[category]): their
// most recent video as a big lead card, up to 3 more as small cards beside
// it. Multiple creators' blocks stack down the page — see app/[category]/page.tsx.

import { VideoCardLead, VideoBrief } from "@/components/content/video-card";
import { Byline } from "@/components/editorial/byline";
import type { CreatorBlock } from "@/lib/mock-data";

const TONES = ["accent", "secondary", "tertiary", "quaternary"] as const;

export function CreatorDeskBlock({ block, index }: { block: CreatorBlock; index: number }) {
  const [lead, ...rest] = block.videos;
  if (!lead) return null;
  const tone = TONES[index % TONES.length];

  return (
    <section className="py-8 first:pt-0">
      <div className="mb-5">
        <Byline creator={block.creator} showSubs />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <VideoCardLead video={lead} creator={block.creator} tone={tone} />
        </div>
        {rest.length > 0 && (
          <div className="rounded-2xl border-2 border-foreground bg-card p-5 lg:col-span-7">
            {rest.map((video) => (
              <VideoBrief key={video.id} video={video} creator={block.creator} tone={tone} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

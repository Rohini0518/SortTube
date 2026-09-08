import { SectionHeader } from "@/components/editorial/section-header";
import { VideoCardLead, VideoBrief } from "@/components/content/video-card";
import type { FeedSection } from "@/lib/mock-data";

const TONES = ["accent", "secondary", "tertiary", "quaternary"] as const;

export function CategorySection({ section, index }: { section: FeedSection; index: number }) {
  const [lead, ...rest] = section.items;
  if (!lead) return null;
  const tone = TONES[index % TONES.length];

  const subLabel = (subcategory?: string) =>
    subcategory ? section.category.subcategories?.find((s) => s.slug === subcategory)?.name : undefined;

  return (
    <section id={section.category.slug} className="scroll-mt-28 py-10">
      <SectionHeader
        name={section.category.name}
        standfirst={section.category.standfirst}
        anchorId={`${section.category.slug}-heading`}
        categorySlug={section.category.slug}
        tone={tone}
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <VideoCardLead
            video={lead.video}
            creator={lead.creator}
            subcategoryLabel={subLabel(lead.video.subcategory)}
            tone={tone}
          />
        </div>
        {rest.length > 0 && (
          <div className="rounded-2xl border-2 border-foreground bg-card p-5 lg:col-span-7">
            {rest.map((item) => (
              <VideoBrief
                key={item.video.id}
                video={item.video}
                creator={item.creator}
                subcategoryLabel={subLabel(item.video.subcategory)}
                tone={tone}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

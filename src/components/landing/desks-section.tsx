// Showcases the built-in desks — landing page (app/page.tsx). Uses the
// static built-in list (not a per-visitor database query) since this is
// explaining the product concept, not showing anyone's real data — a
// visitor's actual desks (including any auto-created ones like "Music")
// only exist once they're browsing Guest Mode or signed in.

import { Newspaper, Cpu, Bot, GraduationCap, Clapperboard, Dumbbell, Mic2 } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";
import { DEFAULT_CATEGORIES } from "@/lib/categories/default-categories";

const DESK_ICONS: Record<string, typeof Newspaper> = {
  news: Newspaper,
  tech: Cpu,
  ai: Bot,
  education: GraduationCap,
  entertainment: Clapperboard,
  fitness: Dumbbell,
  podcasts: Mic2,
};

const TONES = ["accent", "secondary", "tertiary", "quaternary"] as const;

export function DesksSection() {
  return (
    <section id="desks" className="scroll-mt-20 border-y-2 border-foreground bg-muted/60 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-heading text-3xl font-extrabold text-foreground lg:text-4xl">
          Built-in desks — and more, as needed
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center font-body text-sm text-muted-foreground">
          Every account starts with these. When a channel doesn&apos;t fit any of them — a music label, a sports
          network — a new desk gets created the first time it&apos;s actually needed, not guessed in advance.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {DEFAULT_CATEGORIES.map((category, index) => (
            <div
              key={category.slug}
              className="sticker-card rounded-2xl border-2 border-foreground bg-card p-5 shadow-[6px_6px_0px_0px_var(--foreground)]"
            >
              <IconCircle icon={DESK_ICONS[category.slug] ?? Newspaper} tone={TONES[index % TONES.length]} />
              <p className="mt-3 font-heading text-base font-extrabold text-foreground">{category.name}</p>
              <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">{category.standfirst}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

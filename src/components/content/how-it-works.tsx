import { Rss, LayoutGrid, Newspaper } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";

const STEPS = [
  {
    icon: Rss,
    tone: "accent" as const,
    title: "You subscribe, same as always",
    body: "Nothing changes about how you follow channels. This just reads the list you already have.",
  },
  {
    icon: LayoutGrid,
    tone: "secondary" as const,
    title: "We sort it into desks",
    body: "Every channel is filed under a category — and a subcategory where it matters, like AI vs. frontend.",
  },
  {
    icon: Newspaper,
    tone: "tertiary" as const,
    title: "You get an edition, not a feed",
    body: "Open to a front page organized like a paper, not a shuffled stream chasing watch time.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y-2 border-foreground bg-muted/60 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-heading text-3xl font-extrabold text-foreground lg:text-4xl">
          How the sorting works
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="sticker-card rounded-2xl border-2 border-foreground bg-card p-6 text-center shadow-[6px_6px_0px_0px_#1E293B]"
            >
              <div className="flex justify-center">
                <IconCircle icon={step.icon} tone={step.tone} size="lg" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-extrabold text-foreground">{step.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

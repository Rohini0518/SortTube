import { Rss, LayoutGrid, Newspaper } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";
import { HOW_IT_WORKS_STEPS } from "@/lib/landing/content";

const ICONS = [Rss, LayoutGrid, Newspaper];
const TONES = ["accent", "secondary", "tertiary"] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y-2 border-foreground bg-muted/60 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-heading text-3xl font-extrabold text-foreground lg:text-4xl">
          How the sorting works
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="sticker-card rounded-2xl border-2 border-foreground bg-card p-6 text-center shadow-[6px_6px_0px_0px_var(--foreground)]"
            >
              <div className="flex justify-center">
                <IconCircle icon={ICONS[index]} tone={TONES[index]} size="lg" />
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

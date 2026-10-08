// "What SortTube actually does" — landing page (app/page.tsx). Content
// lives in lib/landing/content.ts, kept separate so it's unit-testable.

import { Sparkles, LayoutGrid, Move, ShieldCheck } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";
import { Card } from "@/components/ui/card";
import { FEATURES, type Feature } from "@/lib/landing/content";

const ICONS: Record<Feature["icon"], typeof Sparkles> = {
  sparkles: Sparkles,
  "layout-grid": LayoutGrid,
  move: Move,
  "shield-check": ShieldCheck,
};

const TONES = ["accent", "secondary", "tertiary", "quaternary"] as const;

export function FeaturesSection() {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-heading text-3xl font-extrabold text-foreground lg:text-4xl">
          What it actually does
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <Card key={feature.title} shadow="slate" className="p-6">
              <IconCircle icon={ICONS[feature.icon]} tone={TONES[index % TONES.length]} size="lg" />
              <h3 className="mt-4 font-heading text-lg font-extrabold text-foreground">{feature.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

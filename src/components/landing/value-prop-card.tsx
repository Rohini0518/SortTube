// The core pitch in one glance, right below the hero (app/page.tsx) —
// three short, scannable benefits, not another paragraph to read.

import { Timer, Target, Trophy } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";
import { Card } from "@/components/ui/card";
import { VALUE_PROPS, type ValueProp } from "@/lib/landing/content";

const ICONS: Record<ValueProp["icon"], typeof Timer> = {
  timer: Timer,
  target: Target,
  trophy: Trophy,
};

const TONES = ["accent", "secondary", "tertiary"] as const;

export function ValuePropCard() {
  return (
    <section className="px-4 py-4 sm:px-6">
      <Card shadow="violet" hover={false} className="mx-auto max-w-5xl p-8 sm:p-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {VALUE_PROPS.map((prop, index) => (
            <div key={prop.title} className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
              <IconCircle icon={ICONS[prop.icon]} tone={TONES[index]} size="lg" />
              <div>
                <p className="font-heading text-lg font-extrabold text-foreground">{prop.title}</p>
                <p className="mt-1 font-body text-sm leading-relaxed text-muted-foreground">{prop.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

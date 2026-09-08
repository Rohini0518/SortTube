import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TONE_STYLES = {
  cream: "bg-tertiary/25 text-foreground",
  mint: "bg-quaternary/30 text-foreground",
  pink: "bg-secondary/25 text-foreground",
  violet: "bg-accent/15 text-accent",
  dark: "bg-foreground text-background",
} as const;

/** Small rounded chip used for timestamps, stat deltas, and status labels. */
export function Pill({
  icon: Icon,
  tone = "cream",
  className,
  children,
}: {
  icon?: LucideIcon;
  tone?: keyof typeof TONE_STYLES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-heading text-xs font-bold",
        TONE_STYLES[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
      {children}
    </span>
  );
}

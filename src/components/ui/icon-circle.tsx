import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TONE_STYLES = {
  accent: "bg-accent text-white",
  secondary: "bg-secondary text-white",
  tertiary: "bg-tertiary text-foreground",
  quaternary: "bg-quaternary text-foreground",
  dark: "bg-foreground text-background",
} as const;

const SIZE_STYLES = {
  sm: "h-8 w-8",
  md: "h-11 w-11",
  lg: "h-14 w-14",
} as const;

/** A colored circle with a centered icon — icons never float alone in this design system. */
export function IconCircle({
  icon: Icon,
  tone = "accent",
  size = "md",
  className,
  wiggle = false,
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONE_STYLES;
  size?: keyof typeof SIZE_STYLES;
  className?: string;
  wiggle?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-foreground",
        TONE_STYLES[tone],
        SIZE_STYLES[size],
        wiggle && "wiggle-on-hover",
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"} strokeWidth={2.5} />
    </span>
  );
}

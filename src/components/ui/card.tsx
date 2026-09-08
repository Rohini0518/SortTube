import { cn } from "@/lib/utils";

const SHADOW_TONE = {
  slate: "shadow-[8px_8px_0px_0px_#E2E8F0]",
  pink: "shadow-[8px_8px_0px_0px_#F472B6]",
  violet: "shadow-[8px_8px_0px_0px_#8B5CF6]",
  yellow: "shadow-[8px_8px_0px_0px_#FBBF24]",
  mint: "shadow-[8px_8px_0px_0px_#34D399]",
} as const;

/** The "Sticker" card: white surface, chunky dark border, hard offset shadow. */
export function Card({
  shadow = "slate",
  hover = true,
  className,
  children,
}: {
  shadow?: keyof typeof SHADOW_TONE;
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-foreground bg-card",
        SHADOW_TONE[shadow],
        hover && "sticker-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

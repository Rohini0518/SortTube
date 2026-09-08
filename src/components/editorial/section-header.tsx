import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const UNDERLINE_TONE: Record<string, string> = {
  accent: "stroke-accent",
  secondary: "stroke-secondary",
  tertiary: "stroke-tertiary",
  quaternary: "stroke-quaternary",
};

function Squiggle({ tone }: { tone: string }) {
  return (
    <svg
      viewBox="0 0 160 14"
      className={cn("mt-1 h-3 w-32", UNDERLINE_TONE[tone])}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 10c10-10 20-10 30 0s20 10 30 0 20-10 30 0 20 10 30 0 20-10 30 0"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SectionHeader({
  name,
  standfirst,
  anchorId,
  categorySlug,
  tone = "accent",
}: {
  name: string;
  standfirst: string;
  anchorId: string;
  categorySlug: string;
  tone?: "accent" | "secondary" | "tertiary" | "quaternary";
}) {
  return (
    <div className="mb-7">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div>
          <h2 id={anchorId} className="scroll-mt-28 font-heading text-3xl font-extrabold leading-none text-foreground lg:text-4xl">
            {name}
          </h2>
          <Squiggle tone={tone} />
        </div>
        <Link
          href={`/${categorySlug}`}
          className="mt-1 inline-flex items-center gap-1.5 font-heading text-sm font-bold text-foreground hover:text-accent"
        >
          See full desk
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>
      <p className="mt-2 max-w-prose font-body text-sm text-muted-foreground">{standfirst}</p>
    </div>
  );
}

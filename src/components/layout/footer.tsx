import Link from "next/link";
import { Rss, Mail, Globe } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Category } from "@/lib/types";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="border-t-2 border-foreground bg-muted/60">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-heading text-2xl font-extrabold text-foreground">SortTube</p>
          <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-muted-foreground">
            Your YouTube subscriptions, filed by desk instead of shuffled by algorithm.
          </p>
          <div className="mt-5 flex gap-3">
            <IconCircle icon={Rss} tone="accent" size="sm" />
            <IconCircle icon={Mail} tone="secondary" size="sm" />
            <IconCircle icon={Globe} tone="tertiary" size="sm" />
          </div>
        </div>

        <div className="lg:col-span-8">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-muted-foreground">Desks</p>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            {categories.map((c) => (
              <a key={c.slug} href={`/#${c.slug}`} className="font-body text-sm font-medium text-foreground hover:text-accent">
                {c.name}
              </a>
            ))}
          </div>
          <p className="mt-6 font-heading text-xs font-bold uppercase tracking-wide text-muted-foreground">Product</p>
          <div className="mt-3 flex gap-6">
            <Link href="/feed" className="font-body text-sm font-medium text-foreground hover:text-accent">
              Feed
            </Link>
            <Link href="/channels" className="font-body text-sm font-medium text-foreground hover:text-accent">
              Channels
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-foreground px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-6xl font-body text-xs font-medium text-muted-foreground">
          Built from your subscriptions, not YouTube&apos;s algorithm 👀
        </p>
      </div>
    </footer>
  );
}

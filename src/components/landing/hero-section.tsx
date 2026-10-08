// The landing page's opening pitch (app/page.tsx) — what SortTube is, in
// one sentence, plus the two real ways in: browse Guest Mode immediately,
// or sign in for your own subscriptions.

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-tertiary/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-quaternary/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 right-12 h-20 w-20 rounded-full bg-secondary/25"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="font-body text-sm font-semibold italic text-secondary">
          Built from your subscriptions, not YouTube&apos;s algorithm 👀
        </p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
          Your YouTube subscriptions, sorted into categories.
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
          SortTube reads the channels you already follow and sorts every upload into a category — News, Tech,
          Fitness, and more — like a front page, not an algorithmic feed.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="primary" showArrow>
              Browse as guest — no sign-in needed
            </Button>
          </Link>
          <Link href="/signin">
            <Button variant="secondary">Sign in with Google</Button>
          </Link>
        </div>
        <p className="mt-4 font-body text-xs text-muted-foreground">
          Guest Mode shows real, curated channels across every category — sign in any time for your own.
        </p>
      </div>
    </section>
  );
}

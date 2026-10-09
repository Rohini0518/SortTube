// Header for the marketing landing page (app/page.tsx) only — the app
// pages (dashboard/feed/channels) use Masthead instead. Deliberately
// simpler: no category subnav, no "Manage subscriptions" button, just the
// logo, a couple of anchors to this page's own sections, and the two real
// entry points into the product.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function LandingHeader() {
  return (
    <header className="border-b-2 border-foreground bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-4 py-5 sm:px-6">
        <span className="whitespace-nowrap font-heading text-xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Sort Tube <span className="not-italic">👀</span>
        </span>

        <nav aria-label="Main" className="hidden items-center gap-7 sm:flex">
          <a href="#how-it-works" className="font-heading text-sm font-bold text-foreground hover:text-accent">
            How it works
          </a>
          <a href="#desks" className="font-heading text-sm font-bold text-foreground hover:text-accent">
            Desks
          </a>
          <a href="#faq" className="font-heading text-sm font-bold text-foreground hover:text-accent">
            FAQ
          </a>
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link href="/dashboard">
            <Button variant="secondary" className="min-h-10 px-3 text-xs sm:min-h-[48px] sm:px-6 sm:text-sm">
              Browse as guest
            </Button>
          </Link>
          <Link href="/signin">
            <Button variant="primary" className="min-h-10 px-3 text-xs sm:min-h-[48px] sm:px-6 sm:text-sm">
              Sign in
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

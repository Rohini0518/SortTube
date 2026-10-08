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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
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

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary">Browse as guest</Button>
          </Link>
          <Link href="/signin">
            <Button variant="primary">Sign in</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

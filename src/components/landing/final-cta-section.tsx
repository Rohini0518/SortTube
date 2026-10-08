// Closing call-to-action, landing page (app/page.tsx) — the same two real
// entry points as the hero, repeated at the bottom for anyone who scrolled
// the whole way down before deciding.

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-3xl border-2 border-foreground bg-accent/10 p-10 text-center">
        <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
          See it sorted, not shuffled.
        </h2>
        <p className="mt-3 font-body text-sm text-muted-foreground">
          Jump in with Guest Mode, or sign in for your own subscriptions — either way, no credit card, no setup.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="primary" showArrow>
              Browse as guest
            </Button>
          </Link>
          <Link href="/signin">
            <Button variant="secondary">Sign in with Google</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Custom sign-in page, replacing Auth.js's plain default one (wired up via
// authOptions.pages.signIn in src/lib/auth/options.ts). Branded to match the
// rest of the app instead of an unstyled generic page.

import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export const metadata: Metadata = {
  title: "Sign in — SortTube",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-tertiary/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-quaternary/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-10 h-24 w-24 rounded-full bg-secondary/25"
      />

      <Card shadow="violet" hover={false} className="relative z-10 w-full max-w-sm px-8 py-10 text-center">
        <Link href="/" className="group inline-block">
          <span className="block font-body text-sm font-semibold italic text-secondary">
            sorted, not shuffled <span className="not-italic">📺</span>
          </span>
          <span className="block font-heading text-3xl font-extrabold tracking-tight text-foreground">
            SortTube
          </span>
        </Link>

        <p className="mt-5 font-body text-sm text-muted-foreground">
          Sign in with Google to see your own subscriptions sorted into
          desks. First time here? Signing in creates your account
          automatically — there's no separate signup.
        </p>

        <div className="mt-8">
          <GoogleSignInButton callbackUrl={callbackUrl} />
        </div>

        <p className="mt-6 font-body text-xs text-muted-foreground">
          We only ever request read-only access to your YouTube
          subscriptions.
        </p>
      </Card>
    </main>
  );
}

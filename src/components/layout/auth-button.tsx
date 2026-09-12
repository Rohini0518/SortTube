// Sign in/out control shown in the top nav (see Masthead). Client component
// because it reads live session state via useSession() — signed out shows a
// "Sign in" button linking to the Auth.js sign-in page; signed in shows the
// user's name and a sign-out action instead.

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="h-9 w-9 rounded-full border-2 border-foreground object-cover"
          />
        ) : null}
        <span className="font-heading text-sm font-bold text-foreground">
          {session.user.name ?? session.user.email}
        </span>
        <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden font-body text-xs text-muted-foreground lg:block">
      Viewing the demo
      </span>
      <Link href="/signin">
        <Button variant="secondary">Sign in/Up</Button>
      </Link>
    </div>
  );
}

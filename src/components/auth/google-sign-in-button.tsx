// The actual "Continue with Google" action button on the sign-in page
// (app/signin/page.tsx). Client component because triggering the OAuth flow
// (signIn from next-auth/react) requires a browser event handler.

"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.3-1.68 3.8-5.5 3.8-3.31 0-6.02-2.74-6.02-6.1s2.71-6.1 6.02-6.1c1.89 0 3.15.8 3.87 1.5l2.64-2.55C16.82 3.02 14.6 2 12 2 6.98 2 2.9 6.06 2.9 11s4.08 9 9.1 9c5.25 0 8.73-3.69 8.73-8.89 0-.6-.07-1.05-.15-1.5H12Z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <Button
      type="button"
      variant="primary"
      className="w-full"
      onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/" })}
    >
      <GoogleMark />
      Continue with Google
    </Button>
  );
}

// Thin client-component wrapper around next-auth's SessionProvider. Needed
// because it uses React context/hooks internally, which only works inside a
// "use client" boundary — the root layout (a server component) can't call it
// directly. Wrap the app with this once, in app/layout.tsx; any client
// component anywhere below it can then call useSession().

"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

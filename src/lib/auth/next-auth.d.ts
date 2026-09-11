// Extends next-auth's built-in Session type with the `id` field we attach
// in the session callback (src/lib/auth/options.ts). Type-only — no runtime
// code. Without this, `session.user.id` is a TypeScript error everywhere
// it's read (e.g. the targetUserId resolution in plan.md §3).

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Auth.js route handler. Next.js's App Router requires an actual route file
// (unlike older Pages Router setups) — this one just wires our config
// (src/lib/auth/options.ts) into GET/POST handlers for every auth-related
// URL: /api/auth/signin, /api/auth/callback/google, /api/auth/signout, etc.

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";

const handler = NextAuth(authOptions);

// Every auth request is per-user and stateful (cookies, DB lookups) — this
// route must never be statically analyzed/cached. Without this, Next.js's
// dev-mode static-path analysis for this catch-all route crashes the
// compiler worker ("Jest worker encountered ... exceeding retry limit").
export const dynamic = "force-dynamic";

export { handler as GET, handler as POST };

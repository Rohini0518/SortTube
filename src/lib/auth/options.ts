// Auth.js (next-auth v4) configuration: Google OAuth provider + Prisma
// adapter. Imported by the route handler at
// app/api/auth/[...nextauth]/route.ts, and by any server code that needs
// getServerSession(authOptions) to read the current user.
//
// Per plan.md §4: youtube.readonly scope only, access_type=offline +
// prompt=consent so Google issues a refresh_token (not just a short-lived
// access token) — without this, YouTube access silently expires after ~1hr.

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: {
    // Required when using a database adapter: sessions are looked up by
    // sessionToken in the Session table, not encoded as a self-contained JWT.
    strategy: "database",
  },
  pages: {
    // Custom branded page (app/signin/page.tsx) instead of Auth.js's plain
    // default sign-in page.
    signIn: "/signin",
  },
  callbacks: {
    // Expose the database user id on the session object so the rest of the
    // app can resolve targetUserId = session?.user.id ?? DEMO_USER_ID
    // (see plan.md §3) without a separate lookup.
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

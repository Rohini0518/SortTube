// Resolves which account's data to show: the signed-in user's own, or the
// demo account's when nobody is signed in (plan.md §3), and makes sure that
// account's data is fresh before anything reads it (plan.md §7).
//
// Wrapped in React's cache() so that a single page render calling multiple
// mock-data.ts functions (each of which calls this) shares one session
// lookup and one staleness check, instead of duplicating the sync pipeline
// once per function call on the same request.

import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { syncIfStale } from "@/lib/youtube/sync";

/** Resolves the target account's id without triggering any sync — used by
 * the manual refresh action, which applies its own cooldown logic instead. */
export async function getTargetUserIdOnly(): Promise<string> {
  const session = await getServerSession(authOptions);
  const demoUserId = process.env.DEMO_USER_ID;
  const userId = session?.user?.id ?? demoUserId;

  if (!userId) {
    throw new Error("No signed-in user and DEMO_USER_ID is not configured");
  }

  return userId;
}

export const resolveTargetUserId = cache(async (): Promise<string> => {
  const userId = await getTargetUserIdOnly();
  await syncIfStale(userId);
  return userId;
});

/** Used by mutations (recategorize, create custom category, ...) that must
 * NEVER apply to the shared demo account — unlike resolveTargetUserId /
 * getTargetUserIdOnly, this has no demo-account fallback: it throws if
 * nobody is actually signed in. */
export async function getSignedInUserIdOrThrow(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("This action requires a signed-in user.");
  }
  return session.user.id;
}

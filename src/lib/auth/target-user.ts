// Resolves which account's data to show: the signed-in user's own real
// synced data, or the shared mock dashboard's data (lib/mock-dashboard/)
// when nobody is signed in. There is no "demo account" concept anymore —
// signed out never resolves to any real person's data, only to the fixed,
// hand-curated mock dataset.
//
// Wrapped in React's cache() so that a single page render calling multiple
// mock-data.ts functions (each of which calls this) shares one session
// lookup and one staleness check, instead of duplicating the sync pipeline
// once per function call on the same request.

import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { syncIfStale } from "@/lib/youtube/sync";
import { syncMockDashboardIfStale } from "@/lib/mock-dashboard/sync";
import { MOCK_DASHBOARD_USER_ID } from "@/lib/mock-dashboard/user";

/** Resolves the target account's id without triggering any sync — used by
 * the manual refresh action, which applies its own cooldown logic instead. */
export async function getTargetUserIdOnly(): Promise<string> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? MOCK_DASHBOARD_USER_ID;
}

export const resolveTargetUserId = cache(async (): Promise<string> => {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    await syncIfStale(session.user.id);
    return session.user.id;
  }

  await syncMockDashboardIfStale();
  return MOCK_DASHBOARD_USER_ID;
});

/** Used by mutations (recategorize, create custom category, ...) that must
 * NEVER apply to the shared mock dashboard: it throws if nobody is actually
 * signed in, unlike resolveTargetUserId / getTargetUserIdOnly. */
export async function getSignedInUserIdOrThrow(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("This action requires a signed-in user.");
  }
  return session.user.id;
}

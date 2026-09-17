// The reserved database row that holds the mock dashboard's data
// (Subscription/Video/Category rows) — see plan discussion in
// topic-based-categorization.md's follow-up. This is NOT a real account:
// no Account/Session rows, no OAuth, never reachable through sign-in. It
// exists purely so the mock dashboard can reuse the exact same schema and
// query functions (getCategories, getFrontPageFeed, ...) that real accounts
// use, instead of a parallel data model.

import { prisma } from "@/lib/prisma";

// A fixed, hand-chosen id (not a generated cuid) so it's stable across
// deploys without needing an env var — this row isn't a secret, it's just a
// shared data container every visitor's signed-out view reads from.
export const MOCK_DASHBOARD_USER_ID = "mock-dashboard-0000000000001";

export async function ensureMockDashboardUser(): Promise<void> {
  await prisma.user.upsert({
    where: { id: MOCK_DASHBOARD_USER_ID },
    create: {
      id: MOCK_DASHBOARD_USER_ID,
      name: "SortTube Sample Dashboard",
      email: null,
    },
    update: {},
  });
}

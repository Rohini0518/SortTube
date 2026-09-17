// Server action behind the "Refresh now" button (channels page). Lets a
// user force a sync immediately instead of waiting for the automatic ~24h
// staleness check in target-user.ts. Guarded by a cooldown since quota is
// shared project-wide and the mock dashboard could otherwise be triggered
// repeatedly by many independent anonymous visitors. Dual-mode: refreshes
// the signed-in user's real account via OAuth, or the shared mock dashboard
// via its own non-OAuth pipeline, depending on who's asking.

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTargetUserIdOnly } from "@/lib/auth/target-user";
import { syncUserSubscriptions } from "@/lib/youtube/sync";
import { syncMockDashboard } from "@/lib/mock-dashboard/sync";
import { MOCK_DASHBOARD_USER_ID } from "@/lib/mock-dashboard/user";

const COOLDOWN_MS = 5 * 60 * 1000;

export async function refreshNow(): Promise<{ ok: boolean; message: string }> {
  const userId = await getTargetUserIdOnly();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastSyncedAt: true },
  });

  const msSinceLastSync = user?.lastSyncedAt ? Date.now() - user.lastSyncedAt.getTime() : Infinity;

  if (msSinceLastSync < COOLDOWN_MS) {
    const waitSeconds = Math.ceil((COOLDOWN_MS - msSinceLastSync) / 1000);
    return { ok: false, message: `Just refreshed — try again in ${waitSeconds}s.` };
  }

  try {
    if (userId === MOCK_DASHBOARD_USER_ID) {
      await syncMockDashboard();
    } else {
      await syncUserSubscriptions(userId);
    }
  } catch (err) {
    console.error("Refresh failed:", err);
    return { ok: false, message: "Couldn't refresh right now — try again later." };
  }

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/channels");

  return { ok: true, message: "Refreshed with the latest videos." };
}

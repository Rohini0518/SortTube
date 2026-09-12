// Builds an authenticated YouTube Data API client for one user, using the
// Google access/refresh tokens stored on their Account row (Phase 1). The
// underlying OAuth2 client auto-refreshes an expired access token using the
// refresh_token, and the "tokens" listener persists the new access_token
// back to the database so the next call reuses it instead of refreshing again.

import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function getYoutubeClientForUser(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.refresh_token) {
    throw new Error(`No linked Google account with a refresh token for user ${userId}`);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: account.access_token ?? undefined,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  oauth2Client.on("tokens", async (tokens) => {
    if (!tokens.access_token) return;
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: tokens.access_token,
        expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : undefined,
      },
    });
  });

  return google.youtube({ version: "v3", auth: oauth2Client });
}

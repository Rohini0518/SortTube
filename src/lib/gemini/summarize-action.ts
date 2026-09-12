// On-demand AI summary generation, triggered by the "Summarize" button in
// the video modal (only shown when a video has no summary yet). Deliberately
// NOT run automatically at sync time — Gemini's free tier caps at 20
// requests/day, and most synced videos are never opened, so eager
// generation would waste nearly all of that budget on videos nobody reads.
//
// The description isn't stored on the Video row (sync.ts never persists
// it), so this fetches it fresh with a single videos.list call at click
// time — cheap against YouTube's quota, which isn't the constrained
// resource here.

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTargetUserIdOnly } from "@/lib/auth/target-user";
import { getYoutubeClientForUser } from "@/lib/youtube/client";
import { generateVideoSummary } from "@/lib/gemini/summarize";

export async function summarizeVideo(
  videoId: string,
): Promise<{ ok: boolean; summary?: string; message?: string }> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { subscription: true },
  });

  if (!video) {
    return { ok: false, message: "Video not found." };
  }

  if (video.summary && video.summarizedAt) {
    return { ok: true, summary: video.summary };
  }

  const userId = await getTargetUserIdOnly();
  const youtube = await getYoutubeClientForUser(userId);

  const res = await youtube.videos.list({ part: ["snippet"], id: [video.youtubeVideoId] });
  const description = res.data.items?.[0]?.snippet?.description ?? "";

  const summary = await generateVideoSummary(video.title, description, video.subscription.channelTitle);
  if (!summary) {
    return { ok: false, message: "Couldn't generate a summary right now — try again later." };
  }

  await prisma.video.update({
    where: { id: videoId },
    data: { summary, summarizedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/feed");

  return { ok: true, summary };
}

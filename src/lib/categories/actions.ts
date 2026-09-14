// Signed-in-user-only mutations for manual channel recategorization and
// custom categories (smart-categorization.md sections B/C/D). Every export
// here uses getSignedInUserIdOrThrow() — never resolveTargetUserId() — so
// there is no path by which the shared demo account's data can be changed.

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSignedInUserIdOrThrow } from "@/lib/auth/target-user";
import { DEFAULT_CATEGORIES } from "@/lib/categories/default-categories";
import { slugify } from "@/lib/categories/slugify";

type CategorySummary = { slug: string; name: string; standfirst: string };

type RecategorizeResult = { ok: true } | { ok: false; message: string };

/** Moves a channel to a different category, and cascades that change to
 * every video already synced from it. Future syncs keep following along on
 * their own — sync.ts always copies a video's category from its channel's
 * current category, so nothing further needs to happen here for videos
 * that haven't been fetched yet. */
export async function recategorizeChannel(
  channelId: string,
  category: string,
  subcategory?: string,
): Promise<RecategorizeResult> {
  const userId = await getSignedInUserIdOrThrow();

  const subscription = await prisma.subscription.findUnique({
    where: { userId_channelId: { userId, channelId } },
  });
  if (!subscription) {
    return { ok: false, message: "That channel isn't in your subscriptions." };
  }

  const customCategories = await prisma.category.findMany({ where: { userId } });
  const validSlugs = new Set([
    ...DEFAULT_CATEGORIES.map((c) => c.slug),
    ...customCategories.map((c) => c.slug),
  ]);
  if (!validSlugs.has(category)) {
    return { ok: false, message: "That's not a category that exists." };
  }

  const previousCategory = subscription.category;

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { category, subcategory: subcategory ?? null, categorizedAt: new Date() },
    }),
    prisma.video.updateMany({
      where: { subscriptionId: subscription.id },
      data: { category, subcategory: subcategory ?? null },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/feed");
  revalidatePath("/channels");
  revalidatePath(`/${category}`);
  if (previousCategory !== category) revalidatePath(`/${previousCategory}`);

  return { ok: true };
}

type CreateCategoryResult =
  | { ok: true; category: CategorySummary }
  | { ok: false; reason: "collision"; existingCategory: CategorySummary }
  | { ok: false; reason: "invalid"; message: string };

/** Creates a user's own custom category. If the name collides with a
 * built-in or one of the user's existing categories (by slug), returns
 * that existing category instead of failing outright — the caller (the
 * "+ New category" form) is expected to offer "use the existing one?"
 * rather than just showing an error. */
export async function createCustomCategory(
  name: string,
  standfirst: string,
): Promise<CreateCategoryResult> {
  const userId = await getSignedInUserIdOrThrow();

  const trimmedName = name.trim();
  const trimmedStandfirst = standfirst.trim();
  if (!trimmedName || !trimmedStandfirst) {
    return { ok: false, reason: "invalid", message: "Name and tagline are both required." };
  }

  const slug = slugify(trimmedName);
  if (!slug) {
    return { ok: false, reason: "invalid", message: "Use a name with at least one letter or number." };
  }

  const builtIn = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
  if (builtIn) {
    return { ok: false, reason: "collision", existingCategory: builtIn };
  }

  const existing = await prisma.category.findUnique({
    where: { userId_slug: { userId, slug } },
  });
  if (existing) {
    return { ok: false, reason: "collision", existingCategory: existing };
  }

  const category = await prisma.category.create({
    data: { userId, slug, name: trimmedName, standfirst: trimmedStandfirst },
  });

  revalidatePath("/");
  revalidatePath("/channels");

  return { ok: true, category };
}

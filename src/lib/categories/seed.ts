// Makes sure a user has all 7 built-in category rows. Every category —
// built-in or not — is a plain row in the Category table now (see
// topic-based-categorization.md); this is the one-time-per-user seed step
// that used to be "just import a hardcoded array." Cheap and idempotent —
// safe to call on every request, since it only inserts whatever's missing.

import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/categories/default-categories";

export async function ensureBuiltInCategories(userId: string): Promise<void> {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({
      userId,
      slug: c.slug,
      name: c.name,
      standfirst: c.standfirst,
    })),
    skipDuplicates: true,
  });
}

/** Covers subscriptions whose category isn't one of the 7 built-ins and was
 * never explicitly created either — e.g. an account synced before the
 * built-in list shrank, so it has subscriptions still sitting at a slug
 * like "vlogs" that no longer has a matching Category row. Without this,
 * those channels' videos would be orphaned from the nav/homepage even
 * though the underlying data is fine. Idempotent, safe to call every time. */
export async function backfillOrphanedCategories(userId: string): Promise<void> {
  const usedSlugs = await prisma.subscription.findMany({
    where: { userId },
    distinct: ["category"],
    select: { category: true },
  });

  const existing = await prisma.category.findMany({ where: { userId }, select: { slug: true } });
  const existingSlugs = new Set(existing.map((c) => c.slug));

  const missing = usedSlugs.map((s) => s.category).filter((slug) => !existingSlugs.has(slug));
  if (missing.length === 0) return;

  await prisma.category.createMany({
    data: missing.map((slug) => ({
      userId,
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      standfirst: `Videos about ${slug}.`,
    })),
    skipDuplicates: true,
  });
}

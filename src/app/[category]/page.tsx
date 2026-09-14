// A category's full desk — the "See full desk" destination from the
// homepage (section-header.tsx). Unlike the homepage's lightweight teaser
// (top few videos mixed across creators), this shows every creator in the
// category, each with their own recent-4 block, most recently active
// creator first. See getCategoryDesk (mock-data.ts) and CreatorDeskBlock.

import { notFound } from "next/navigation";
import { Masthead } from "@/components/layout/masthead";
import { Footer } from "@/components/layout/footer";
import { CreatorDeskBlock } from "@/components/content/creator-desk-block";
import { getCategories, getCategoryDesk } from "@/lib/mock-data";

export default async function CategoryDeskPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;

  const [categories, desk] = await Promise.all([getCategories(), getCategoryDesk(categorySlug)]);

  if (!desk) notFound();

  return (
    <div className="min-h-screen bg-background">
      <Masthead categories={categories} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="font-body text-sm font-semibold italic text-secondary">the full desk 🗂️</p>
        <h1 className="mt-1 font-heading text-4xl font-extrabold text-foreground sm:text-5xl">
          {desk.category.name}
        </h1>
        <p className="mt-3 max-w-xl font-body text-base text-muted-foreground">{desk.category.standfirst}</p>

        <div className="mt-6 divide-y-2 divide-dashed divide-border">
          {desk.creatorBlocks.map((block, index) => (
            <CreatorDeskBlock key={block.creator.id} block={block} index={index} />
          ))}
          {desk.creatorBlocks.length === 0 && (
            <p className="rounded-2xl border-2 border-dashed border-border p-8 text-center font-body text-sm text-muted-foreground">
              No videos in this desk yet.
            </p>
          )}
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}

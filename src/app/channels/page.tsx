import { Masthead } from "@/components/layout/masthead";
import { Footer } from "@/components/layout/footer";
import { ChannelsManager } from "@/components/channels/channels-manager";
import { RefreshButton } from "@/components/channels/refresh-button";
import { getCategories, getTrackedCreators } from "@/lib/mock-data";

export default async function ChannelsPage() {
  const [categories, tracked] = await Promise.all([getCategories(), getTrackedCreators()]);

  return (
    <div className="min-h-screen bg-background">
      <Masthead categories={categories} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-body text-sm font-semibold italic text-secondary">who you&apos;re keeping tabs on 🔭</p>
            <h1 className="mt-1 font-heading text-4xl font-extrabold text-foreground sm:text-5xl">Channels</h1>
          </div>
          <RefreshButton />
        </div>

        <div className="mt-8">
          <ChannelsManager initial={tracked} categories={categories} />
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}

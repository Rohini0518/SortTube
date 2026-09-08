import { Masthead } from "@/components/layout/masthead";
import { Footer } from "@/components/layout/footer";
import { QuickAddCard } from "@/components/feed/quick-add-card";
import { FiltersCard } from "@/components/feed/filters-card";
import { ActivityCard } from "@/components/feed/activity-card";
import { getCategories, getActivityFeed, getTrackedCreators } from "@/lib/mock-data";

export default async function FeedPage() {
  const [categories, activity, tracked] = await Promise.all([
    getCategories(),
    getActivityFeed(),
    getTrackedCreators(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Masthead categories={categories} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="font-body text-sm font-semibold italic text-secondary">the daily sub 👀</p>
        <h1 className="mt-1 font-heading text-4xl font-extrabold text-foreground sm:text-5xl">Feed</h1>
        <p className="mt-3 max-w-xl font-body text-base text-muted-foreground">
          New videos, subscriber milestones, and title or thumbnail changes across the channels you follow.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="space-y-6 lg:col-span-4">
            <QuickAddCard used={tracked.length} capacity={10} />
            <FiltersCard />
          </aside>

          <div className="space-y-6 lg:col-span-8">
            {activity.map((item) => (
              <ActivityCard key={item.id} activity={item} />
            ))}
          </div>
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}

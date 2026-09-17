import { Masthead } from "@/components/layout/masthead";
import { Footer } from "@/components/layout/footer";
import { Ticker } from "@/components/editorial/ticker";
import { FeaturedStory } from "@/components/content/featured-story";
import { HowItWorks } from "@/components/content/how-it-works";
import { CategorySection } from "@/components/content/category-section";
import { getCategories, getFeaturedVideo, getFrontPageFeed, getTrendingTicker } from "@/lib/mock-data";

export default async function Home() {
  const [categories, featured, feed, ticker] = await Promise.all([
    getCategories(),
    getFeaturedVideo(),
    getFrontPageFeed(),
    getTrendingTicker(),
  ]);

  return (
    <div className="min-h-screen bg-paper">
      <Masthead categories={categories} />
      <Ticker items={ticker} />

      <main className="mx-auto max-w-screen-xl px-4 sm:px-6">
        {featured && <FeaturedStory video={featured.video} creator={featured.creator} />}

        {feed.length === 0 && !featured && (
          <p className="py-16 text-center font-body text-sm text-muted-foreground">
            No videos synced yet — check back shortly.
          </p>
        )}

        <div>
          {feed.map((section, index) => (
            <CategorySection key={section.category.slug} section={section} index={index} />
          ))}
        </div>
      </main>

      <HowItWorks />
      <Footer categories={categories} />
    </div>
  );
}

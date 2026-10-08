// Marketing/explainer landing page — what SortTube is and how it works.
// The actual product lives at /dashboard now (moved from here so this path
// could be a proper front door instead of requiring an account first).
// Metadata comes from the root layout's defaults, which already describe
// the product accurately.

import { Footer } from "@/components/layout/footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { ValuePropCard } from "@/components/landing/value-prop-card";
import { FeaturesSection } from "@/components/landing/features-section";
import { DesksSection } from "@/components/landing/desks-section";
import { HowItWorks } from "@/components/content/how-it-works";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { getCategories } from "@/lib/mock-data";

export default async function LandingPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection />
      <ValuePropCard />
      <FeaturesSection />
      <DesksSection />
      <HowItWorks />
      <FaqSection />
      <FinalCtaSection />
      <Footer categories={categories} />
    </div>
  );
}

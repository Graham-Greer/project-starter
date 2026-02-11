import {
  FAQCompact,
  FeatureComparisonCompact,
  FeatureSplitMediaRight,
  FooterColumns,
  FooterCtaCentered,
  HeroCentered,
  Pricing3Tier,
  StatsRow,
  TestimonialGridSection,
} from "@/components/sections";
import { HOME_PAGE, SITE_FOOTER } from "@/lib/content";

export const metadata = {
  title: "Starter | Home",
  description: "Reusable website starter built from composable section variants.",
};

export default function Home() {
  return (
    <>
      <HeroCentered id="top" {...HOME_PAGE.hero} />
      <StatsRow id="stats" {...HOME_PAGE.stats} />
      <FeatureSplitMediaRight id="features" {...HOME_PAGE.feature} />
      <FeatureComparisonCompact id="comparison" {...HOME_PAGE.comparison} />
      <Pricing3Tier id="pricing" {...HOME_PAGE.pricing} />
      <TestimonialGridSection id="testimonials" {...HOME_PAGE.testimonials} />
      <FAQCompact id="faq" {...HOME_PAGE.faq} />
      <FooterCtaCentered id="cta" {...HOME_PAGE.footerCta} />
      <FooterColumns {...SITE_FOOTER} />
    </>
  );
}

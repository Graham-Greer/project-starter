import {
  FAQCompact,
  FeatureComparisonDetailed,
  FooterColumns,
  FooterCtaCentered,
  HeroCentered,
  Pricing3Tier,
  PricingEnterprise,
} from "@/components/sections";
import { PRICING_PAGE, SITE_FOOTER } from "@/lib/content";

export const metadata = {
  title: "Starter | Pricing",
  description: "Plan tiers and enterprise options for reusable website delivery.",
};

export default function PricingPage() {
  return (
    <>
      <HeroCentered id="top" {...PRICING_PAGE.hero} />
      <Pricing3Tier id="plans" {...PRICING_PAGE.tiers} />
      <PricingEnterprise id="enterprise" {...PRICING_PAGE.enterprise} />
      <FeatureComparisonDetailed id="comparison" {...PRICING_PAGE.comparison} />
      <FAQCompact id="faq" {...PRICING_PAGE.faq} />
      <FooterCtaCentered id="cta" {...PRICING_PAGE.footerCta} />
      <FooterColumns {...SITE_FOOTER} />
    </>
  );
}

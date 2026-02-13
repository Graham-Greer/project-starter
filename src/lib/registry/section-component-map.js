import * as Sections from "@/components/sections";
import { FALLBACK_COMPONENT_KEY } from "./section-resolver";

export const SECTION_COMPONENT_MAP = {
  HeroCentered: Sections.HeroCentered,
  HeroSplit: Sections.HeroSplit,
  FooterSimple: Sections.FooterSimple,
  FooterColumns: Sections.FooterColumns,
  Pricing3Tier: Sections.Pricing3Tier,
  PricingEnterprise: Sections.PricingEnterprise,
  TestimonialGridSection: Sections.TestimonialGridSection,
  TestimonialSpotlight: Sections.TestimonialSpotlight,
  FAQCompact: Sections.FAQCompact,
  FAQDetailed: Sections.FAQDetailed,
  FeatureSplitMediaLeft: Sections.FeatureSplitMediaLeft,
  FeatureSplitMediaRight: Sections.FeatureSplitMediaRight,
  CTASectionCentered: Sections.CTASectionCentered,
  CTASectionSplit: Sections.CTASectionSplit,
  TeamGrid: Sections.TeamGrid,
  TeamWithLead: Sections.TeamWithLead,
  StatsRow: Sections.StatsRow,
  StatsCards: Sections.StatsCards,
  FeatureComparisonCompact: Sections.FeatureComparisonCompact,
  FeatureComparisonDetailed: Sections.FeatureComparisonDetailed,
  FooterCtaCentered: Sections.FooterCtaCentered,
  FooterCtaSplit: Sections.FooterCtaSplit,
  [FALLBACK_COMPONENT_KEY]: Sections.SectionRenderFallback,
};

export function getSectionComponent(componentKey) {
  return SECTION_COMPONENT_MAP[componentKey] || null;
}

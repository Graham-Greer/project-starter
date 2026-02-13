export const SECTIONS_REGISTRY = {
  hero: {
    label: "Hero",
    variants: {
      centered: { componentKey: "HeroCentered", propsSchema: "hero.centered.v1", tags: ["top-of-page", "conversion"] },
      split: { componentKey: "HeroSplit", propsSchema: "hero.split.v1", tags: ["top-of-page", "media"] },
    },
  },
  footer: {
    label: "Footer",
    variants: {
      simple: { componentKey: "FooterSimple", propsSchema: "footer.simple.v1", tags: ["site-nav"] },
      columns: { componentKey: "FooterColumns", propsSchema: "footer.columns.v1", tags: ["site-nav"] },
    },
  },
  pricing: {
    label: "Pricing",
    variants: {
      "3-tier": { componentKey: "Pricing3Tier", propsSchema: "pricing.3-tier.v1", tags: ["conversion"] },
      enterprise: { componentKey: "PricingEnterprise", propsSchema: "pricing.enterprise.v1", tags: ["sales-led"] },
    },
  },
  testimonials: {
    label: "Testimonials",
    variants: {
      grid: { componentKey: "TestimonialGridSection", propsSchema: "testimonials.grid.v1", tags: ["social-proof"] },
      spotlight: { componentKey: "TestimonialSpotlight", propsSchema: "testimonials.spotlight.v1", tags: ["social-proof"] },
    },
  },
  faq: {
    label: "FAQ",
    variants: {
      compact: { componentKey: "FAQCompact", propsSchema: "faq.compact.v1", tags: ["support"] },
      detailed: { componentKey: "FAQDetailed", propsSchema: "faq.detailed.v1", tags: ["support"] },
    },
  },
  featureSplit: {
    label: "Feature Split",
    variants: {
      mediaLeft: { componentKey: "FeatureSplitMediaLeft", propsSchema: "featureSplit.media-left.v1", tags: ["feature"] },
      mediaRight: { componentKey: "FeatureSplitMediaRight", propsSchema: "featureSplit.media-right.v1", tags: ["feature"] },
    },
  },
  cta: {
    label: "CTA",
    variants: {
      centered: { componentKey: "CTASectionCentered", propsSchema: "cta.centered.v1", tags: ["conversion"] },
      split: { componentKey: "CTASectionSplit", propsSchema: "cta.split.v1", tags: ["conversion"] },
    },
  },
  team: {
    label: "Team",
    variants: {
      grid: { componentKey: "TeamGrid", propsSchema: "team.grid.v1", tags: ["about"] },
      lead: { componentKey: "TeamWithLead", propsSchema: "team.lead.v1", tags: ["about"] },
    },
  },
  stats: {
    label: "Stats",
    variants: {
      row: { componentKey: "StatsRow", propsSchema: "stats.row.v1", tags: ["trust"] },
      cards: { componentKey: "StatsCards", propsSchema: "stats.cards.v1", tags: ["trust"] },
    },
  },
  featureComparison: {
    label: "Feature Comparison",
    variants: {
      compact: { componentKey: "FeatureComparisonCompact", propsSchema: "featureComparison.compact.v1", tags: ["pricing"] },
      detailed: { componentKey: "FeatureComparisonDetailed", propsSchema: "featureComparison.detailed.v1", tags: ["pricing"] },
    },
  },
  footerCta: {
    label: "Footer CTA",
    variants: {
      centered: { componentKey: "FooterCtaCentered", propsSchema: "footerCta.centered.v1", tags: ["conversion"] },
      split: { componentKey: "FooterCtaSplit", propsSchema: "footerCta.split.v1", tags: ["conversion"] },
    },
  },
};

export function getSectionDefinition(sectionType, variant) {
  const section = SECTIONS_REGISTRY[sectionType];
  if (!section) return null;
  return section.variants?.[variant] || null;
}

export function listSectionTypes() {
  return Object.keys(SECTIONS_REGISTRY);
}

export const SECTIONS_REGISTRY = {
  hero: {
    label: "Hero",
    description: "Top-of-page intro sections for positioning and conversion.",
    thumbnailText: "Hero",
    variants: {
      centered: {
        componentKey: "HeroCentered",
        propsSchema: "hero.centered.v1",
        tags: ["top-of-page", "conversion"],
        description: "Centered hero with concise messaging and CTAs.",
        thumbnailText: "Centered",
      },
      split: {
        componentKey: "HeroSplit",
        propsSchema: "hero.split.v1",
        tags: ["top-of-page", "media"],
        description: "Split hero with content plus supporting visual.",
        thumbnailText: "Split",
      },
    },
  },
  footer: {
    label: "Footer",
    description: "Site-level footer structures and legal/navigation anchors.",
    thumbnailText: "Footer",
    variants: {
      simple: {
        componentKey: "FooterSimple",
        propsSchema: "footer.simple.v1",
        tags: ["site-nav"],
        description: "Minimal footer with compact links.",
        thumbnailText: "Simple",
      },
      columns: {
        componentKey: "FooterColumns",
        propsSchema: "footer.columns.v1",
        tags: ["site-nav"],
        description: "Multi-column footer for structured links.",
        thumbnailText: "Columns",
      },
    },
  },
  pricing: {
    label: "Pricing",
    description: "Pricing layouts for self-serve and sales-led offers.",
    thumbnailText: "Pricing",
    variants: {
      "3-tier": {
        componentKey: "Pricing3Tier",
        propsSchema: "pricing.3-tier.v1",
        tags: ["conversion"],
        description: "Three-tier pricing comparison with CTAs.",
        thumbnailText: "3-tier",
      },
      enterprise: {
        componentKey: "PricingEnterprise",
        propsSchema: "pricing.enterprise.v1",
        tags: ["sales-led"],
        description: "Enterprise pricing with custom engagement flow.",
        thumbnailText: "Enterprise",
      },
    },
  },
  testimonials: {
    label: "Testimonials",
    description: "Social proof sections for trust and conversion lift.",
    thumbnailText: "Reviews",
    variants: {
      grid: {
        componentKey: "TestimonialGridSection",
        propsSchema: "testimonials.grid.v1",
        tags: ["social-proof"],
        description: "Card grid of customer testimonials.",
        thumbnailText: "Grid",
      },
      spotlight: {
        componentKey: "TestimonialSpotlight",
        propsSchema: "testimonials.spotlight.v1",
        tags: ["social-proof"],
        description: "Single highlighted testimonial with supporting quote.",
        thumbnailText: "Spotlight",
      },
    },
  },
  faq: {
    label: "FAQ",
    description: "Common-question layouts for objection handling and support.",
    thumbnailText: "FAQ",
    variants: {
      compact: {
        componentKey: "FAQCompact",
        propsSchema: "faq.compact.v1",
        tags: ["support"],
        description: "Compact FAQ accordion for quick scanning.",
        thumbnailText: "Compact",
      },
      detailed: {
        componentKey: "FAQDetailed",
        propsSchema: "faq.detailed.v1",
        tags: ["support"],
        description: "Detailed FAQ with richer answer formatting.",
        thumbnailText: "Detailed",
      },
    },
  },
  featureSplit: {
    label: "Feature Split",
    description: "Feature callouts with media and conversion actions.",
    thumbnailText: "Features",
    variants: {
      mediaLeft: {
        componentKey: "FeatureSplitMediaLeft",
        propsSchema: "featureSplit.media-left.v1",
        tags: ["feature"],
        description: "Media on left, supporting copy on right.",
        thumbnailText: "Media left",
      },
      mediaRight: {
        componentKey: "FeatureSplitMediaRight",
        propsSchema: "featureSplit.media-right.v1",
        tags: ["feature"],
        description: "Media on right, supporting copy on left.",
        thumbnailText: "Media right",
      },
    },
  },
  cta: {
    label: "CTA",
    description: "Conversion-focused call-to-action sections.",
    thumbnailText: "CTA",
    variants: {
      centered: {
        componentKey: "CTASectionCentered",
        propsSchema: "cta.centered.v1",
        tags: ["conversion"],
        description: "Centered CTA for clear primary action.",
        thumbnailText: "Centered",
      },
      split: {
        componentKey: "CTASectionSplit",
        propsSchema: "cta.split.v1",
        tags: ["conversion"],
        description: "Split CTA balancing message and action.",
        thumbnailText: "Split",
      },
    },
  },
  team: {
    label: "Team",
    description: "Team and leadership showcases for credibility.",
    thumbnailText: "Team",
    variants: {
      grid: {
        componentKey: "TeamGrid",
        propsSchema: "team.grid.v1",
        tags: ["about"],
        description: "Grid of team members and roles.",
        thumbnailText: "Grid",
      },
      lead: {
        componentKey: "TeamWithLead",
        propsSchema: "team.lead.v1",
        tags: ["about"],
        description: "Lead profile with supporting team content.",
        thumbnailText: "Lead",
      },
    },
  },
  stats: {
    label: "Stats",
    description: "Performance and trust metrics in digestible layouts.",
    thumbnailText: "Stats",
    variants: {
      row: {
        componentKey: "StatsRow",
        propsSchema: "stats.row.v1",
        tags: ["trust"],
        description: "Single-row metrics for quick impact.",
        thumbnailText: "Row",
      },
      cards: {
        componentKey: "StatsCards",
        propsSchema: "stats.cards.v1",
        tags: ["trust"],
        description: "Card-based metrics with stronger hierarchy.",
        thumbnailText: "Cards",
      },
    },
  },
  featureComparison: {
    label: "Feature Comparison",
    description: "Compare plans and capability sets side by side.",
    thumbnailText: "Compare",
    variants: {
      compact: {
        componentKey: "FeatureComparisonCompact",
        propsSchema: "featureComparison.compact.v1",
        tags: ["pricing"],
        description: "Compact comparison for concise decision support.",
        thumbnailText: "Compact",
      },
      detailed: {
        componentKey: "FeatureComparisonDetailed",
        propsSchema: "featureComparison.detailed.v1",
        tags: ["pricing"],
        description: "Detailed matrix with richer feature rows.",
        thumbnailText: "Detailed",
      },
    },
  },
  footerCta: {
    label: "Footer CTA",
    description: "Bottom-of-page conversion prompts before footer exit.",
    thumbnailText: "Footer CTA",
    variants: {
      centered: {
        componentKey: "FooterCtaCentered",
        propsSchema: "footerCta.centered.v1",
        tags: ["conversion"],
        description: "Centered closing CTA above footer navigation.",
        thumbnailText: "Centered",
      },
      split: {
        componentKey: "FooterCtaSplit",
        propsSchema: "footerCta.split.v1",
        tags: ["conversion"],
        description: "Split closing CTA with supporting copy.",
        thumbnailText: "Split",
      },
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

export function getSectionMetadata(sectionType) {
  const section = SECTIONS_REGISTRY[sectionType];
  if (!section) return null;
  return {
    sectionType,
    label: section.label,
    description: section.description || "",
    thumbnailText: section.thumbnailText || section.label,
    variantCount: Object.keys(section.variants || {}).length,
  };
}

export function getVariantMetadata(sectionType, variant) {
  const section = SECTIONS_REGISTRY[sectionType];
  const definition = section?.variants?.[variant];
  if (!section || !definition) return null;
  return {
    sectionType,
    variant,
    sectionLabel: section.label,
    label: definition.label || variant,
    description: definition.description || "",
    thumbnailText: definition.thumbnailText || variant,
    tags: definition.tags || [],
  };
}

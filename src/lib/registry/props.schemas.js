const URL_MAX_LENGTH = 4096;

const ACTION_RULE = {
  type: "object",
  required: ["label", "href"],
  fields: {
    label: { type: "string", maxLength: 80 },
    href: { type: "string", maxLength: URL_MAX_LENGTH },
  },
};

const IMAGE_RULE = {
  type: "object",
  required: ["src"],
  fields: {
    src: { type: "string", maxLength: URL_MAX_LENGTH },
    alt: { type: "string", maxLength: 160 },
  },
};

const HERO_MEDIA_RULE = {
  type: "object",
  fields: {
    kind: { type: "string", options: ["image", "video"], maxLength: 16 },
    src: { type: "string", maxLength: URL_MAX_LENGTH },
    videoSrc: { type: "string", maxLength: URL_MAX_LENGTH },
    mimeType: { type: "string", maxLength: 80 },
    poster: { type: "string", maxLength: URL_MAX_LENGTH },
    alt: { type: "string", maxLength: 160 },
  },
};

const PLAN_RULE = {
  type: "object",
  required: ["name", "price", "features", "cta"],
  fields: {
    id: { type: "string", maxLength: 80 },
    name: { type: "string", maxLength: 80 },
    badge: { type: "string", maxLength: 80 },
    featured: { type: "boolean" },
    price: { type: "string", maxLength: 40 },
    interval: { type: "string", maxLength: 80 },
    description: { type: "string", maxLength: 240 },
    features: { type: "array", item: { type: "string", maxLength: 120 } },
    cta: ACTION_RULE,
  },
};

const TESTIMONIAL_RULE = {
  type: "object",
  required: ["quote", "author", "role"],
  fields: {
    id: { type: "string", maxLength: 80 },
    quote: { type: "string", maxLength: 400 },
    author: { type: "string", maxLength: 80 },
    role: { type: "string", maxLength: 120 },
    avatar: IMAGE_RULE,
  },
};

const FAQ_ITEM_RULE = {
  type: "object",
  required: ["title", "content"],
  fields: {
    id: { type: "string", maxLength: 80 },
    title: { type: "string", maxLength: 160 },
    content: { type: "string", maxLength: 500 },
  },
};

const TEAM_MEMBER_RULE = {
  type: "object",
  required: ["name", "role"],
  fields: {
    id: { type: "string", maxLength: 80 },
    name: { type: "string", maxLength: 80 },
    role: { type: "string", maxLength: 120 },
    bio: { type: "string", maxLength: 320 },
    photo: IMAGE_RULE,
  },
};

const STATS_ITEM_RULE = {
  type: "object",
  required: ["value", "label"],
  fields: {
    id: { type: "string", maxLength: 80 },
    value: { type: "string", maxLength: 40 },
    label: { type: "string", maxLength: 120 },
    note: { type: "string", maxLength: 220 },
  },
};

const FOOTER_COLUMN_RULE = {
  type: "object",
  required: ["title", "links"],
  fields: {
    id: { type: "string", maxLength: 80 },
    label: { type: "string", maxLength: 120 },
    title: { type: "string", maxLength: 120 },
    links: {
      type: "array",
      item: {
        type: "object",
        fields: {
          label: { type: "string", maxLength: 120 },
          href: { type: "string", maxLength: URL_MAX_LENGTH },
        },
      },
    },
  },
};

const COMPARISON_ROW_RULE = {
  type: "object",
  required: ["label", "values"],
  fields: {
    id: { type: "string", maxLength: 80 },
    label: { type: "string", maxLength: 120 },
    values: { type: "object", additionalProperties: { type: "string", maxLength: 120 } },
  },
};

export const PROPS_SCHEMAS = {
  "hero.centered.v1": {
    required: ["title", "description"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 320 },
      primaryAction: ACTION_RULE,
      secondaryAction: ACTION_RULE,
      media: HERO_MEDIA_RULE,
    },
  },
  "hero.split.v1": {
    required: ["title", "description", "media"],
    fields: {
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 320 },
      reverse: { type: "boolean" },
      primaryAction: ACTION_RULE,
      secondaryAction: ACTION_RULE,
      media: IMAGE_RULE,
    },
  },
  "pricing.3-tier.v1": {
    required: ["title", "plans"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 240 },
      plans: { type: "array", minLength: 1, item: PLAN_RULE },
    },
  },
  "pricing.enterprise.v1": {
    required: ["title", "plans"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 240 },
      plans: { type: "array", minLength: 1, item: PLAN_RULE },
      enterpriseNote: { type: "string", maxLength: 240 },
    },
  },
  "testimonials.grid.v1": {
    required: ["title", "items"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 240 },
      items: { type: "array", minLength: 1, item: TESTIMONIAL_RULE },
    },
  },
  "testimonials.spotlight.v1": {
    required: ["title", "items"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 240 },
      items: { type: "array", minLength: 1, item: TESTIMONIAL_RULE },
      highlight: {
        type: "object",
        fields: {
          quote: { type: "string", maxLength: 320 },
          author: { type: "string", maxLength: 80 },
          role: { type: "string", maxLength: 120 },
        },
      },
    },
  },
  "faq.compact.v1": {
    required: ["title", "items"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 240 },
      items: { type: "array", minLength: 1, item: FAQ_ITEM_RULE },
    },
  },
  "faq.detailed.v1": {
    required: ["title", "items"],
    fields: {
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 240 },
      helperText: { type: "string", maxLength: 240 },
      items: { type: "array", minLength: 1, item: FAQ_ITEM_RULE },
    },
  },
  "featureSplit.media-left.v1": {
    required: ["title", "description", "media"],
    fields: {
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 280 },
      primaryAction: ACTION_RULE,
      secondaryAction: ACTION_RULE,
      media: IMAGE_RULE,
    },
  },
  "featureSplit.media-right.v1": {
    required: ["title", "description", "media"],
    fields: {
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 280 },
      primaryAction: ACTION_RULE,
      secondaryAction: ACTION_RULE,
      media: IMAGE_RULE,
    },
  },
  "cta.centered.v1": {
    required: ["title", "primaryAction"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      primaryAction: ACTION_RULE,
      secondaryAction: ACTION_RULE,
    },
  },
  "cta.split.v1": {
    required: ["title", "primaryAction"],
    fields: {
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      primaryAction: ACTION_RULE,
      secondaryAction: ACTION_RULE,
    },
  },
  "team.grid.v1": {
    required: ["title", "members"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      members: { type: "array", minLength: 1, item: TEAM_MEMBER_RULE },
    },
  },
  "team.lead.v1": {
    required: ["title", "lead", "members"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      lead: {
        type: "object",
        required: ["name", "role"],
        fields: {
          name: { type: "string", maxLength: 80 },
          role: { type: "string", maxLength: 120 },
          bio: { type: "string", maxLength: 320 },
          photo: IMAGE_RULE,
        },
      },
      members: { type: "array", minLength: 1, item: TEAM_MEMBER_RULE },
    },
  },
  "stats.row.v1": {
    required: ["title", "items"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      items: { type: "array", minLength: 1, item: STATS_ITEM_RULE },
    },
  },
  "stats.cards.v1": {
    required: ["title", "items"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      items: { type: "array", minLength: 1, item: STATS_ITEM_RULE },
    },
  },
  "featureComparison.compact.v1": {
    required: ["title", "columns", "rows"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      columns: {
        type: "array",
        minLength: 1,
        item: {
          type: "object",
          required: ["label"],
          fields: {
            id: { type: "string", maxLength: 80 },
            label: { type: "string", maxLength: 120 },
          },
        },
      },
      rows: { type: "array", minLength: 1, item: COMPARISON_ROW_RULE },
    },
  },
  "featureComparison.detailed.v1": {
    required: ["title", "columns", "rows"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      columns: {
        type: "array",
        minLength: 1,
        item: {
          type: "object",
          required: ["label"],
          fields: {
            id: { type: "string", maxLength: 80 },
            label: { type: "string", maxLength: 120 },
          },
        },
      },
      rows: { type: "array", minLength: 1, item: COMPARISON_ROW_RULE },
    },
  },
  "footer.simple.v1": {
    required: ["links"],
    fields: {
      copyright: { type: "string", maxLength: 120 },
      links: { type: "array", minLength: 1, item: ACTION_RULE },
    },
  },
  "footer.columns.v1": {
    required: ["brand", "columns"],
    fields: {
      brand: { type: "string", maxLength: 80 },
      description: { type: "string", maxLength: 220 },
      columns: { type: "array", minLength: 1, item: FOOTER_COLUMN_RULE },
      legal: { type: "array", item: ACTION_RULE },
    },
  },
  "footerCta.centered.v1": {
    required: ["title", "primaryAction"],
    fields: {
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      primaryAction: ACTION_RULE,
      secondaryAction: ACTION_RULE,
    },
  },
  "footerCta.split.v1": {
    required: ["title", "primaryAction"],
    fields: {
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 220 },
      primaryAction: ACTION_RULE,
      secondaryAction: ACTION_RULE,
    },
  },
};

export function getPropsSchema(schemaId) {
  return PROPS_SCHEMAS[schemaId] || null;
}

export const SITE_FOOTER = {
  brand: "Starter",
  description: "Reusable website sections for teams shipping fast without one-off page code.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Pricing", href: "/pricing" },
        { label: "FAQ", href: "/faq" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Pricing",
      links: [
        { label: "Core Tiers", href: "/pricing#plans" },
        { label: "Enterprise", href: "/pricing#enterprise" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
};

const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    interval: "per month",
    description: "Landing pages and brand sites for solo operators and early teams.",
    features: ["3 active projects", "Section variant library", "Email support"],
    cta: { label: "Choose Starter", href: "/contact" },
  },
  {
    id: "growth",
    name: "Growth",
    badge: "Most Popular",
    featured: true,
    price: "$79",
    interval: "per month",
    description: "Scale faster with richer content and collaboration workflows.",
    features: ["10 active projects", "Advanced section variants", "Priority support"],
    cta: { label: "Choose Growth", href: "/contact" },
  },
  {
    id: "scale",
    name: "Scale",
    price: "$159",
    interval: "per month",
    description: "For product teams operating multiple site experiences in parallel.",
    features: ["Unlimited projects", "Shared content model", "Dedicated onboarding"],
    cta: { label: "Choose Scale", href: "/contact" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    interval: "annual contract",
    description: "Security, compliance, and migration support for larger organizations.",
    features: ["Custom architecture support", "SLA-backed response times", "Security review support"],
    cta: { label: "Talk to Sales", href: "/contact" },
  },
];

const COMPARISON_COLUMNS = [
  { id: "starter", label: "Starter" },
  { id: "growth", label: "Growth" },
  { id: "scale", label: "Scale" },
];

const COMPARISON_ROWS = [
  {
    id: "projects",
    label: "Active projects",
    values: { starter: "3", growth: "10", scale: "Unlimited" },
  },
  {
    id: "theming",
    label: "Theme support",
    values: { starter: "Light/Dark", growth: "Light/Dark", scale: "Custom themes" },
  },
  {
    id: "support",
    label: "Support window",
    values: { starter: "48 hours", growth: "24 hours", scale: "SLA" },
  },
  {
    id: "roles",
    label: "Team roles",
    values: { starter: "2", growth: "10", scale: "Unlimited" },
  },
];

const FAQ_ITEMS = [
  {
    id: "customize",
    title: "Can we customize section variants?",
    content: "Yes. Every section is data-driven and designed for variant composition.",
  },
  {
    id: "performance",
    title: "Will this work for performance-sensitive sites?",
    content: "Yes. The architecture favors reusable components and light route-level logic.",
  },
  {
    id: "migration",
    title: "Can we migrate existing marketing pages?",
    content: "Yes. Existing page blocks can be mapped to section variants incrementally.",
  },
  {
    id: "data",
    title: "Can this connect to a CMS or database later?",
    content: "Yes. The component system is prepared for repository/service-based data access.",
  },
];

const STOCK_IMAGES = {
  homeHero: "https://picsum.photos/seed/starter-home-hero/1920/1080",
  homeFeature: "https://picsum.photos/seed/starter-home-feature/1400/1050",
  aboutHero: "https://picsum.photos/seed/starter-about-hero/1920/1080",
  servicesHero: "https://picsum.photos/seed/starter-services-hero/1920/1080",
  servicesArchitecture: "https://picsum.photos/seed/starter-services-architecture/1400/1050",
  servicesMigration: "https://picsum.photos/seed/starter-services-migration/1400/1050",
  pricingHero: "https://picsum.photos/seed/starter-pricing-hero/1920/1080",
  contactHero: "https://picsum.photos/seed/starter-contact-hero/1920/1080",
  faqHero: "https://picsum.photos/seed/starter-faq-hero/1920/1080",
  privacyHero: "https://picsum.photos/seed/starter-privacy-hero/1920/1080",
  termsHero: "https://picsum.photos/seed/starter-terms-hero/1920/1080",
  teamLead: "https://picsum.photos/seed/starter-team-lead/720/600",
  teamMemberOne: "https://picsum.photos/seed/starter-team-member-1/600/480",
  teamMemberTwo: "https://picsum.photos/seed/starter-team-member-2/600/480",
  teamMemberThree: "https://picsum.photos/seed/starter-team-member-3/600/480",
  testimonialOne: "https://picsum.photos/seed/starter-testimonial-1/160/160",
  testimonialTwo: "https://picsum.photos/seed/starter-testimonial-2/160/160",
  testimonialThree: "https://picsum.photos/seed/starter-testimonial-3/160/160",
};

const STOCK_VIDEOS = {
  heroAmbientTwo: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
};

export const HOME_PAGE = {
  hero: {
    eyebrow: "Starter Template",
    title: "Launch consistent marketing pages with reusable section variants",
    description:
      "Compose pages from primitives to sections and keep route files focused on content assembly.",
    primaryAction: { label: "View Services", href: "/services" },
    secondaryAction: { label: "See Pricing", href: "/pricing" },
    media: {
      src: STOCK_IMAGES.homeHero,
      alt: "Team collaborating around product planning boards",
      width: 1920,
      height: 1080,
      aspectRatio: "16 / 9",
    },
  },
  stats: {
    eyebrow: "Platform",
    title: "Built for repeatable delivery",
    description: "Use a stable component contract across every route.",
    items: [
      { id: "sections", value: "22", label: "Core section variants" },
      { id: "pages", value: "8", label: "Default starter routes" },
      { id: "themes", value: "2", label: "Semantic theme modes" },
      { id: "reuse", value: "100%", label: "Token-driven styling" },
    ],
  },
  feature: {
    title: "Assemble pages without ad hoc UI",
    description:
      "Keep visual consistency by composing existing patterns and sections. Add new variants only when they provide reusable value.",
    primaryAction: { label: "Read About", href: "/about" },
    secondaryAction: { label: "Contact Team", href: "/contact" },
    media: {
      src: STOCK_IMAGES.homeFeature,
      alt: "Laptop and notes representing structured page assembly work",
      width: 1400,
      height: 1050,
      aspectRatio: "16 / 9",
    },
  },
  comparison: {
    eyebrow: "Plan Comparison",
    title: "Scale structure as your site grows",
    description: "The same components support simple and advanced teams.",
    columns: COMPARISON_COLUMNS,
    rows: COMPARISON_ROWS,
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Simple tiers for common delivery needs",
    description: "Choose the plan that matches your publishing cadence.",
    plans: PRICING_PLANS,
  },
  testimonials: {
    eyebrow: "Customer Stories",
    title: "Teams ship faster with a shared component language",
    description: "A single system across routes keeps quality predictable.",
    items: [
      {
        id: "t1",
        quote: "We replaced five one-off landing page templates with one reusable stack.",
        author: "Riley Hart",
        role: "Head of Marketing, Northline",
        avatar: { src: STOCK_IMAGES.testimonialOne, alt: "Portrait of Riley Hart" },
      },
      {
        id: "t2",
        quote: "Handoff quality improved because every route followed the same contracts.",
        author: "Avery Kim",
        role: "Product Designer, Beacon",
        avatar: { src: STOCK_IMAGES.testimonialTwo, alt: "Portrait of Avery Kim" },
      },
      {
        id: "t3",
        quote: "Updates now happen in section components, not scattered page files.",
        author: "Jordan Bell",
        role: "Engineering Lead, Fieldwork",
        avatar: { src: STOCK_IMAGES.testimonialThree, alt: "Portrait of Jordan Bell" },
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Common questions",
    description: "Answers for teams adopting the starter structure.",
    items: FAQ_ITEMS,
  },
  footerCta: {
    title: "Need a custom rollout plan?",
    description: "We can map your existing pages into reusable section variants.",
    primaryAction: { label: "Book Intro Call", href: "/contact" },
    secondaryAction: { label: "Browse FAQ", href: "/faq" },
  },
};

export const ABOUT_PAGE = {
  hero: {
    title: "A component-first team focused on maintainable delivery",
    description:
      "We design systems that stay usable as content, contributors, and requirements grow.",
    primaryAction: { label: "See Services", href: "/services" },
    secondaryAction: { label: "Contact", href: "/contact" },
    media: {
      src: STOCK_IMAGES.aboutHero,
      alt: "People planning and reviewing website strategy together",
      width: 1920,
      height: 1080,
      aspectRatio: "16 / 9",
    },
  },
  stats: {
    eyebrow: "Outcomes",
    title: "How we measure delivery quality",
    description: "We optimize for consistency, speed, and long-term maintainability.",
    items: [
      { id: "audit", value: "0", label: "One-off route styles" },
      { id: "velocity", value: "2x", label: "Faster page assembly" },
      { id: "handoff", value: "1", label: "Shared design language" },
    ],
  },
  team: {
    eyebrow: "Team",
    title: "People behind the system",
    description: "Cross-functional execution across strategy, design, and engineering.",
    lead: {
      name: "Morgan Lee",
      role: "Product Lead",
      bio: "Guides roadmap and reusable architecture decisions for the starter system.",
      photo: { src: STOCK_IMAGES.teamLead, alt: "Portrait of Morgan Lee" },
    },
    members: [
      {
        id: "m1",
        name: "Sam Rivera",
        role: "Design Systems Engineer",
        bio: "Builds reusable UI and section variants.",
        photo: { src: STOCK_IMAGES.teamMemberOne, alt: "Portrait of Sam Rivera" },
      },
      {
        id: "m2",
        name: "Casey Patel",
        role: "Frontend Engineer",
        bio: "Maintains routing and composition workflows.",
        photo: { src: STOCK_IMAGES.teamMemberTwo, alt: "Portrait of Casey Patel" },
      },
      {
        id: "m3",
        name: "Taylor Brooks",
        role: "Product Designer",
        bio: "Defines visual contracts and accessibility defaults.",
        photo: { src: STOCK_IMAGES.teamMemberThree, alt: "Portrait of Taylor Brooks" },
      },
    ],
  },
  testimonials: {
    eyebrow: "Partner Feedback",
    title: "Trusted by product and marketing teams",
    description: "Reusable contracts reduce regressions and rework.",
    highlight: {
      quote: "This structure made page launches predictable for every campaign.",
      author: "Drew Collins",
      role: "VP Marketing, Arcton",
    },
    items: [
      {
        id: "about-t1",
        quote: "Our team now speaks in sections and variants, not page hacks.",
        author: "Kai Mercer",
        role: "Engineering Manager",
        avatar: { src: STOCK_IMAGES.testimonialOne, alt: "Portrait of Kai Mercer" },
      },
      {
        id: "about-t2",
        quote: "Accessibility checks became easier once we reused interaction patterns.",
        author: "Harper James",
        role: "Design Lead",
        avatar: { src: STOCK_IMAGES.testimonialTwo, alt: "Portrait of Harper James" },
      },
    ],
  },
};

export const SERVICES_PAGE = {
  hero: {
    title: "Services designed for reusable site systems",
    description: "From setup to migration, we implement component contracts that scale.",
    primaryAction: { label: "Request Scope", href: "/contact" },
    secondaryAction: { label: "View Pricing", href: "/pricing" },
    media: {
      src: STOCK_IMAGES.servicesHero,
      alt: "Creative and engineering teams reviewing a delivery plan",
      width: 1920,
      height: 1080,
      aspectRatio: "16 / 9",
    },
  },
  offerings: [
    {
      id: "system",
      title: "Component system architecture",
      description:
        "Define tokens, primitives, UI, patterns, and sections with clear ownership and contracts.",
      primaryAction: { label: "Talk Architecture", href: "/contact" },
      secondaryAction: { label: "See About", href: "/about" },
      media: {
        src: STOCK_IMAGES.servicesArchitecture,
        alt: "Diagram notes and laptop showing component architecture planning",
        width: 1400,
        height: 1050,
        aspectRatio: "16 / 9",
      },
    },
    {
      id: "migration",
      title: "Route migration and page assembly",
      description:
        "Move existing pages into reusable section variants while preserving content and brand voice.",
      primaryAction: { label: "Plan Migration", href: "/contact" },
      secondaryAction: { label: "Open FAQ", href: "/faq" },
      media: {
        src: STOCK_IMAGES.servicesMigration,
        alt: "Person working through migration checklists on a laptop",
        width: 1400,
        height: 1050,
        aspectRatio: "16 / 9",
      },
    },
  ],
  cta: {
    title: "Need help selecting the right engagement?",
    description: "Share your current site structure and we will propose the smallest implementation plan.",
    primaryAction: { label: "Contact Team", href: "/contact" },
    secondaryAction: { label: "See Pricing", href: "/pricing" },
  },
};

export const PRICING_PAGE = {
  hero: {
    eyebrow: "Pricing",
    title: "Transparent plans for teams adopting reusable page assembly",
    description: "Start with core sections and expand as your route set grows.",
    primaryAction: { label: "Contact Sales", href: "/contact" },
    secondaryAction: { label: "Read FAQ", href: "/faq" },
    media: {
      src: STOCK_IMAGES.pricingHero,
      alt: "Team evaluating roadmap options and pricing scenarios",
      width: 1920,
      height: 1080,
      aspectRatio: "16 / 9",
    },
  },
  tiers: {
    eyebrow: "Plans",
    title: "Core package tiers",
    description: "Most teams begin here.",
    plans: PRICING_PLANS,
  },
  enterprise: {
    eyebrow: "Enterprise",
    title: "Support for larger rollouts",
    description: "For cross-brand systems and compliance-heavy environments.",
    plans: [PRICING_PLANS[1], PRICING_PLANS[2], PRICING_PLANS[3]],
    enterpriseNote: "Includes architecture advisory and migration playbooks.",
  },
  comparison: {
    eyebrow: "Feature Matrix",
    title: "Choose a plan with confidence",
    description: "Compare capabilities across core tiers.",
    columns: COMPARISON_COLUMNS,
    rows: COMPARISON_ROWS,
  },
  faq: {
    title: "Pricing questions",
    description: "Details on plans, billing, and upgrades.",
    items: FAQ_ITEMS,
  },
  footerCta: {
    title: "Want a custom quote?",
    description: "We can tailor scope for your route count and content model.",
    primaryAction: { label: "Get Quote", href: "/contact" },
    secondaryAction: { label: "View Services", href: "/services" },
  },
};

export const CONTACT_PAGE = {
  hero: {
    eyebrow: "Contact",
    title: "Talk with us about your next build",
    description:
      "Share your timeline, page set, and current constraints. We respond with a practical implementation path.",
    primaryAction: { label: "Request Proposal", href: "mailto:hello@example.com" },
    secondaryAction: { label: "Call +1 (555) 123-4567", href: "tel:+15551234567" },
    media: {
      videoSrc: STOCK_VIDEOS.heroAmbientTwo,
      poster: STOCK_IMAGES.contactHero,
      alt: "Consultation meeting in progress",
      width: 1920,
      height: 1080,
      aspectRatio: "16 / 9",
    },
  },
  process: {
    title: "What to include in your message",
    description: "The more context you share, the faster we can map a realistic scope.",
    helperText: "Prefer email? Send details to hello@example.com and include links to current pages.",
    items: [
      {
        id: "timeline",
        title: "Timeline",
        content: "When do you need the first batch of routes live?",
      },
      {
        id: "pages",
        title: "Page inventory",
        content: "List pages that should be built in this phase and what can be deferred.",
      },
      {
        id: "integration",
        title: "Integrations",
        content: "Mention analytics, forms, CMS, or auth constraints we should account for.",
      },
    ],
  },
  cta: {
    title: "Prefer to explore first?",
    description: "Review services and pricing before reaching out.",
    primaryAction: { label: "View Services", href: "/services" },
    secondaryAction: { label: "See Pricing", href: "/pricing" },
  },
};

export const FAQ_PAGE = {
  hero: {
    eyebrow: "Help Center",
    title: "Frequently asked questions",
    description: "Everything teams ask before adopting this starter template.",
    primaryAction: { label: "Contact Support", href: "/contact" },
    secondaryAction: { label: "View Services", href: "/services" },
    media: {
      src: STOCK_IMAGES.faqHero,
      alt: "Support specialist helping answer customer questions",
      width: 1920,
      height: 1080,
      aspectRatio: "16 / 9",
    },
  },
  faq: {
    title: "General questions",
    description: "Common details on setup, customization, and future scaling.",
    helperText: "Need a specific answer? Contact us and we will help you map it to the component system.",
    items: FAQ_ITEMS,
  },
  cta: {
    title: "Still deciding?",
    description: "Compare plans or book an intro call.",
    primaryAction: { label: "See Pricing", href: "/pricing" },
    secondaryAction: { label: "Contact", href: "/contact" },
  },
};

export const PRIVACY_PAGE = {
  hero: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    description: "How we collect, use, and protect information.",
    media: {
      src: STOCK_IMAGES.privacyHero,
      alt: "Device screen with privacy and security controls",
      width: 1920,
      height: 1080,
      aspectRatio: "16 / 9",
    },
  },
  document: {
    sections: [
      {
        id: "data-collection",
        title: "1. Information we collect",
        paragraphs: [
          "We collect contact details you provide directly, such as name, email, and company details submitted through inquiry forms.",
          "We may collect usage analytics to understand site performance and improve content quality.",
        ],
      },
      {
        id: "data-use",
        title: "2. How we use information",
        paragraphs: [
          "Information is used to respond to requests, deliver services, and communicate relevant updates.",
          "We do not sell personal information to third parties.",
        ],
      },
      {
        id: "retention",
        title: "3. Data retention and rights",
        paragraphs: [
          "We retain information only as long as needed for business and legal purposes.",
          "You can request access, correction, or deletion by contacting hello@example.com.",
        ],
      },
    ],
  },
};

export const TERMS_PAGE = {
  hero: {
    eyebrow: "Legal",
    title: "Terms of Service",
    description: "The terms that govern use of this website and related services.",
    media: {
      src: STOCK_IMAGES.termsHero,
      alt: "Document review workspace with policy paperwork",
      width: 1920,
      height: 1080,
      aspectRatio: "16 / 9",
    },
  },
  document: {
    sections: [
      {
        id: "acceptance",
        title: "1. Acceptance of terms",
        paragraphs: [
          "By using this website, you agree to these terms and all applicable laws.",
          "If you do not agree, please discontinue use of this website.",
        ],
      },
      {
        id: "service-scope",
        title: "2. Service scope",
        paragraphs: [
          "Project scope, timelines, and deliverables are defined in signed proposals or agreements.",
          "Any additional work outside agreed scope may require a separate written change request.",
        ],
      },
      {
        id: "limitations",
        title: "3. Limitations",
        paragraphs: [
          "This website content is provided for general information and may change without notice.",
        ],
        items: [
          "No guarantee of uninterrupted availability.",
          "No liability for indirect or consequential damages to the maximum extent permitted by law.",
        ],
      },
    ],
  },
};

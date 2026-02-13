const STOCK = {
  hero: "https://picsum.photos/seed/cms-seed-hero/1600/1000",
  feature: "https://picsum.photos/seed/cms-seed-feature/1400/900",
  teamA: "https://picsum.photos/seed/cms-seed-team-a/900/600",
  teamB: "https://picsum.photos/seed/cms-seed-team-b/900/600",
  teamC: "https://picsum.photos/seed/cms-seed-team-c/900/600",
  teamD: "https://picsum.photos/seed/cms-seed-team-d/900/600",
  avatarA: "https://picsum.photos/seed/cms-seed-avatar-a/200/200",
  avatarB: "https://picsum.photos/seed/cms-seed-avatar-b/200/200",
  avatarC: "https://picsum.photos/seed/cms-seed-avatar-c/200/200",
};

const PREVIEW_SEEDS = {
  hero: {
    centered: {
      eyebrow: "Preview",
      title: "Build modern pages quickly with reusable sections",
      description: "This hero variant supports rich heading, actions, and optional background media.",
      primaryAction: { label: "Get started", href: "/contact" },
      secondaryAction: { label: "View pricing", href: "/pricing" },
      media: {
        kind: "image",
        src: STOCK.hero,
        alt: "Team collaborating around a desk",
      },
    },
    split: {
      title: "Communicate value with content + media",
      description: "Use split heroes when you need more space for supporting context and imagery.",
      primaryAction: { label: "Book a demo", href: "/contact" },
      secondaryAction: { label: "Explore services", href: "/services" },
      media: {
        src: STOCK.feature,
        alt: "Workspace setup and product planning notes",
      },
    },
  },
  pricing: {
    "3-tier": {
      eyebrow: "Pricing",
      title: "Simple plans for growing teams",
      description: "Choose the tier that matches your publishing velocity.",
      plans: [
        {
          id: "starter",
          name: "Starter",
          price: "$29",
          interval: "per month",
          description: "Best for small teams launching quickly.",
          features: ["3 active pages", "Section library", "Email support"],
          cta: { label: "Choose Starter", href: "/contact" },
        },
        {
          id: "growth",
          name: "Growth",
          badge: "Popular",
          featured: true,
          price: "$79",
          interval: "per month",
          description: "For teams with frequent campaigns.",
          features: ["Unlimited pages", "Priority support", "Advanced sections"],
          cta: { label: "Choose Growth", href: "/contact" },
        },
        {
          id: "scale",
          name: "Scale",
          price: "$149",
          interval: "per month",
          description: "For multi-brand and enterprise teams.",
          features: ["Workspace controls", "Publishing tools", "Migration help"],
          cta: { label: "Talk to Sales", href: "/contact" },
        },
      ],
    },
    enterprise: {
      eyebrow: "Enterprise",
      title: "Advanced workflows for larger organizations",
      description: "Security controls and publishing governance included.",
      enterpriseNote: "Custom onboarding, SLAs, and migration planning available.",
      plans: [
        {
          id: "growth",
          name: "Growth",
          price: "$79",
          interval: "per month",
          description: "High-velocity publishing for growing teams.",
          features: ["Unlimited pages", "Priority support", "Advanced sections"],
          cta: { label: "Choose Growth", href: "/contact" },
        },
        {
          id: "enterprise",
          name: "Enterprise",
          badge: "Best value",
          featured: true,
          price: "Custom",
          interval: "annual contract",
          description: "Operational reliability for complex organizations.",
          features: ["SAML/SSO", "Audit logs", "Dedicated success manager"],
          cta: { label: "Contact Sales", href: "/contact" },
        },
      ],
    },
  },
  testimonials: {
    grid: {
      eyebrow: "Testimonials",
      title: "Teams launch faster with our CMS",
      description: "Real feedback from users shipping high-converting pages.",
      items: [
        {
          id: "t1",
          quote: "The section system gave us speed without losing consistency.",
          author: "Alex Morgan",
          role: "Marketing Director",
          avatar: { src: STOCK.avatarA, alt: "Portrait of Alex Morgan" },
        },
        {
          id: "t2",
          quote: "Our campaigns now go live in hours instead of days.",
          author: "Jamie Carter",
          role: "Growth Lead",
          avatar: { src: STOCK.avatarB, alt: "Portrait of Jamie Carter" },
        },
        {
          id: "t3",
          quote: "Non-technical editors can now manage content confidently.",
          author: "Drew Riley",
          role: "Content Strategist",
          avatar: { src: STOCK.avatarC, alt: "Portrait of Drew Riley" },
        },
      ],
    },
    spotlight: {
      eyebrow: "Customer Story",
      title: "Proof that reusable sections scale",
      description: "Highlight a key quote and back it up with supporting testimonials.",
      highlight: {
        quote: "This CMS cut our content production cycle by 60%.",
        author: "Morgan Blake",
        role: "VP Marketing",
      },
      items: [
        {
          id: "ts1",
          quote: "Editing is now straightforward for our entire team.",
          author: "Casey Hart",
          role: "Content Lead",
          avatar: { src: STOCK.avatarA, alt: "Portrait of Casey Hart" },
        },
        {
          id: "ts2",
          quote: "The live preview gives confidence before publishing.",
          author: "Taylor Quinn",
          role: "Designer",
          avatar: { src: STOCK.avatarB, alt: "Portrait of Taylor Quinn" },
        },
      ],
    },
  },
  faq: {
    compact: {
      eyebrow: "FAQ",
      title: "Common questions",
      description: "Quick answers users ask before getting started.",
      items: [
        { id: "f1", title: "Can I reorder sections?", content: "Yes. Drag and drop sections in Page Sections." },
        { id: "f2", title: "Can non-coders edit content?", content: "Yes. Standard mode provides guided field editing." },
        { id: "f3", title: "Does preview support themes?", content: "Yes. Toggle light and dark directly in live preview." },
      ],
    },
    detailed: {
      title: "Detailed frequently asked questions",
      description: "Use this variant when your page requires more support context.",
      helperText: "Still have questions? Reach out via the contact page.",
      items: [
        { id: "fd1", title: "How do drafts work?", content: "All edits are saved to draft state until publish." },
        { id: "fd2", title: "Can I customize layouts?", content: "Yes, through section variants and block properties." },
      ],
    },
  },
  featureSplit: {
    mediaLeft: {
      title: "Explain key features with visual context",
      description: "Pair concise messaging with a supporting image.",
      primaryAction: { label: "Learn more", href: "/services" },
      secondaryAction: { label: "Contact us", href: "/contact" },
      media: { src: STOCK.feature, alt: "Product dashboard and analytics charts" },
    },
    mediaRight: {
      title: "Drive action with split content structure",
      description: "Use this variant when your supporting visual should lead the eye.",
      primaryAction: { label: "View pricing", href: "/pricing" },
      secondaryAction: { label: "Start now", href: "/contact" },
      media: { src: STOCK.hero, alt: "Team workshop and strategy session" },
    },
  },
  cta: {
    centered: {
      eyebrow: "Ready?",
      title: "Launch your site in days, not weeks",
      description: "Use this CTA for direct conversion intent.",
      primaryAction: { label: "Get started", href: "/contact" },
      secondaryAction: { label: "Read FAQ", href: "/faq" },
    },
    split: {
      title: "Need help choosing a plan?",
      description: "Talk with our team and get a tailored recommendation.",
      primaryAction: { label: "Book a call", href: "/contact" },
      secondaryAction: { label: "Compare plans", href: "/pricing" },
    },
  },
  team: {
    grid: {
      eyebrow: "Team",
      title: "Meet the people behind the product",
      description: "Introduce the team members who drive outcomes.",
      members: [
        { id: "m1", name: "Jordan Lee", role: "Product Lead", bio: "Owns product strategy.", photo: { src: STOCK.teamA, alt: "Portrait of Jordan Lee" } },
        { id: "m2", name: "Avery Chen", role: "Design Lead", bio: "Shapes user journeys.", photo: { src: STOCK.teamB, alt: "Portrait of Avery Chen" } },
        { id: "m3", name: "Riley Park", role: "Engineering Lead", bio: "Builds reliable systems.", photo: { src: STOCK.teamC, alt: "Portrait of Riley Park" } },
      ],
    },
    lead: {
      eyebrow: "Leadership",
      title: "A team built for execution",
      description: "Feature a lead profile alongside broader team members.",
      lead: {
        name: "Morgan Diaz",
        role: "Head of Product",
        bio: "Leads product direction and launch strategy across teams.",
        photo: { src: STOCK.teamD, alt: "Portrait of Morgan Diaz" },
      },
      members: [
        { id: "ml1", name: "Alex Hart", role: "Growth Manager", bio: "Optimizes conversion and messaging.", photo: { src: STOCK.teamA, alt: "Portrait of Alex Hart" } },
        { id: "ml2", name: "Sam Blake", role: "Frontend Engineer", bio: "Delivers reusable components.", photo: { src: STOCK.teamB, alt: "Portrait of Sam Blake" } },
      ],
    },
  },
  stats: {
    row: {
      eyebrow: "Results",
      title: "Measured impact",
      description: "Highlight performance improvements with concise metrics.",
      items: [
        { id: "s1", value: "3x", label: "Faster content production" },
        { id: "s2", value: "60%", label: "Lower page build time" },
        { id: "s3", value: "99%", label: "Visual consistency score" },
      ],
    },
    cards: {
      eyebrow: "Performance",
      title: "Outcomes at a glance",
      description: "Use card stats for more visual separation.",
      items: [
        { id: "sc1", value: "45%", label: "Higher conversion rate", note: "Compared to previous templates" },
        { id: "sc2", value: "2 days", label: "Average launch cycle", note: "From brief to publish" },
        { id: "sc3", value: "12", label: "Sections reused", note: "Across all default pages" },
      ],
    },
  },
  featureComparison: {
    compact: {
      eyebrow: "Compare",
      title: "Plan comparison",
      description: "Help buyers decide quickly with structured comparisons.",
      columns: [
        { id: "starter", label: "Starter" },
        { id: "growth", label: "Growth" },
        { id: "scale", label: "Scale" },
      ],
      rows: [
        { id: "projects", label: "Active projects", values: { starter: "3", growth: "10", scale: "Unlimited" } },
        { id: "support", label: "Support", values: { starter: "Email", growth: "Priority", scale: "Dedicated" } },
      ],
    },
    detailed: {
      eyebrow: "Detailed comparison",
      title: "Evaluate every feature",
      description: "Use this variant for longer-form plan decision pages.",
      columns: [
        { id: "starter", label: "Starter" },
        { id: "growth", label: "Growth" },
        { id: "enterprise", label: "Enterprise" },
      ],
      rows: [
        { id: "theming", label: "Theme controls", values: { starter: "Basic", growth: "Advanced", enterprise: "White-label" } },
        { id: "users", label: "Team users", values: { starter: "3", growth: "15", enterprise: "Unlimited" } },
        { id: "security", label: "Security options", values: { starter: "Standard", growth: "Enhanced", enterprise: "SAML/SSO" } },
      ],
    },
  },
  footer: {
    simple: {
      brand: "Starter",
      copyright: "© 2026 Starter. All rights reserved.",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Contact", href: "/contact" },
      ],
    },
    columns: {
      brand: "Starter",
      description: "Component-first website delivery platform.",
      columns: [
        {
          title: "Product",
          links: [
            { label: "Services", href: "/services" },
            { label: "Pricing", href: "/pricing" },
            { label: "FAQ", href: "/faq" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ],
        },
      ],
      legal: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  },
  footerCta: {
    centered: {
      title: "Need help getting started?",
      description: "Speak with our team and launch confidently.",
      primaryAction: { label: "Book intro call", href: "/contact" },
      secondaryAction: { label: "Read FAQ", href: "/faq" },
    },
    split: {
      title: "Plan your next launch",
      description: "Get guidance on pages, sections, and publishing flow.",
      primaryAction: { label: "Contact us", href: "/contact" },
      secondaryAction: { label: "View services", href: "/services" },
    },
  },
};

export function getSectionPreviewSeed(sectionType, variant) {
  return PREVIEW_SEEDS[sectionType]?.[variant] || null;
}

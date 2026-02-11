# Sections

This document is the scoped reference for components in `src/components/sections`.

## Scope

- Layer: `sections`
- Purpose: route-ready variants built from `patterns`, `ui`, and `primitives`
- Source path: `src/components/sections`

## Conventions

- Component-first folder structure:
  - `src/components/sections/<SectionName>/<SectionName>.jsx`
  - `src/components/sections/<SectionName>/<section-name>.module.css`
  - `src/components/sections/<SectionName>/index.js`
- Export via layer barrel:
  - `src/components/sections/index.js`
- Sections should compose existing patterns first, only adding layout-specific behavior where needed.

## Implemented Variants (Phase 6 Core)

## Hero
- `HeroCentered`
- `HeroSplit`

## Footer
- `FooterSimple`
- `FooterColumns`

## Pricing
- `Pricing3Tier`
- `PricingEnterprise`

## Testimonials
- `TestimonialGridSection`
- `TestimonialSpotlight`

## FAQ
- `FAQCompact`
- `FAQDetailed`

## Feature Split
- `FeatureSplitMediaLeft`
- `FeatureSplitMediaRight`

## CTA
- `CTASectionCentered`
- `CTASectionSplit`

## Team
- `TeamGrid`
- `TeamWithLead`

## Stats
- `StatsRow`
- `StatsCards`

## Feature Comparison
- `FeatureComparisonCompact`
- `FeatureComparisonDetailed`

## Footer CTA
- `FooterCtaCentered`
- `FooterCtaSplit`

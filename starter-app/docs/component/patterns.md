# Patterns

This document is the scoped reference for components in `src/components/patterns`.

## Scope

- Layer: `patterns`
- Purpose: reusable compositions built from `primitives` and `ui` components
- Source path: `src/components/patterns`

## Conventions

- Component-first folder structure:
  - `src/components/patterns/<PatternName>/<PatternName>.jsx`
  - `src/components/patterns/<PatternName>/<pattern-name>.module.css`
  - `src/components/patterns/<PatternName>/index.js`
- Export via layer barrel:
  - `src/components/patterns/index.js`
- Patterns should orchestrate composition, not own low-level one-off UI logic.

## Core Patterns (Implemented)

- `Section`
- `SectionHeader`
- `CTAGroup`
- `FeatureGrid`
- `PricingTable`
- `TestimonialGrid`
- `LogoCloud`
- `StatsSection`
- `FAQSection`
- `FeatureComparison`
- `CTASection`
- `FeatureSplitSection`
- `TeamSection`
- `FooterCtaSection`

## API Highlights

## `Section`

- Structural wrapper for vertical rhythm and content container.
- Key props:
  - `container` (boolean)
  - `density` (`sm | md | lg`)
  - `tone` (`default | surface | muted`)

## `SectionHeader`

- Shared heading block for sections.
- Key props:
  - `eyebrow`, `title`, `description`, `actions`
  - `align` (`left | center`)

## `PricingTable`

- Plan-card based pricing composition.
- Expects `plans` array with:
  - `name`, `price`, `interval`, `description`, `features`, `badge`, `cta`, `featured`

## `FAQSection`

- Section header + `Accordion` composition.
- Expects `items` array compatible with `Accordion`.

## `LogoCloud`

- Static logo grid or animated logo marquee wrapper.
- Key props:
  - `items`
  - `useMarquee` (boolean)

## `FeatureComparison`

- Comparison table pattern for plans/features.
- Key props:
  - `columns` (array)
  - `rows` (array with values)

## Usage Example

```jsx
import { Section, SectionHeader, FeatureGrid, CTASection } from "@/components/patterns";

<Section density="lg" tone="default">
  <SectionHeader
    eyebrow="Platform"
    title="Everything you need to launch"
    description="Composable sections and reusable components."
  />
  <FeatureGrid items={featureItems} />
</Section>

<CTASection
  title="Ready to get started?"
  description="Build faster with reusable patterns."
  primaryAction={{ label: "Start now", href: "/contact" }}
/>
```

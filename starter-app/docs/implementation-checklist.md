# Implementation Checklist

This checklist tracks execution order for building and maintaining the reusable website template system.

## How to use

- Mark items complete as work is merged.
- Do not skip phases unless explicitly approved.
- If a task introduces new patterns, update `docs/component-system-plan.md` and `docs/engineering-standards.md`.

## Phase 0: Foundation Alignment

- [ ] Confirm token coverage in `src/app/globals.css` (color, spacing, typography, radius, z-index, motion, semantic theme tokens).
- [ ] Remove one-off style logic that should be token-driven.
- [ ] Confirm all current interactive components meet keyboard and aria requirements.
- [ ] Confirm folder structure baseline (`primitives`, `ui`, `patterns`, `sections`, `context`, `hooks`, `lib`).

## Phase 1: Context and Providers

- [x] Create `src/context/providers.jsx` as the single provider entry point.
- [x] Create `ThemeContext` and move theme logic out of UI components.
- [x] Add `useThemeContext` hook with provider guard.
- [x] Keep default behavior browser-preference based; explicit user override only when set.
- [ ] Create `UIContext` only for one real global concern (example: toasts). (Deferred by design for current marketing website scope)
- [ ] Add `useUIContext` hook with provider guard. (Deferred by design for current marketing website scope)
- [x] Wire providers in `src/app/layout.jsx`.

## Phase 2: Primitives

- [x] Build `Icon` primitive (single source of SVG truth).
- [x] Build `Box` primitive.
- [x] Build `Stack` primitive.
- [x] Build `Grid` primitive.
- [x] Build `Text` and `Heading` primitives.
- [x] Build `Surface` primitive.
- [x] Ensure all primitives consume design tokens only.

## Phase 3: Core UI Components

- [x] Build `Button` with `variant`, `size`, `tone`.
- [x] Build `Card` with variants.
- [x] Build standardized `Image` wrapper around Next Image.
- [x] Build `Badge` (if needed by active sections).
- [x] Refactor header/footer usages to consume final `Button` and `Icon`. (Header complete; footer pending until footer component exists)

## Phase 4: Interactive UI Components

- [x] Build `Accordion` (accessible keyboard interactions).
- [x] Build `Tabs` (controlled/uncontrolled modes).
- [x] Build `LogoMarquee` (infinite horizontal scroller pattern).
- [x] Ensure reduced motion fallback for animated components.

## Phase 5: Patterns

- [x] Build `Section` pattern component.
- [x] Build `SectionHeader` pattern component.
- [x] Build `FeatureGrid` pattern.
- [x] Build `CTAGroup` pattern.
- [x] Build at least one generic content block pattern for reuse.
- [x] Build `PricingTable` pattern. (Core)
- [x] Build `TestimonialGrid` pattern. (Core)
- [x] Build `LogoCloud` pattern. (Core, can wrap `LogoMarquee`)
- [x] Build `StatsSection` pattern. (Core)
- [x] Build `FAQSection` pattern. (Core, should use `Accordion`)
- [x] Build `FeatureComparison` pattern. (Core)
- [x] Build `CTASection` pattern. (Core)
- [x] Build `FeatureSplitSection` pattern. (Core)
- [ ] Build `ProcessStepsSection` pattern. (Optional/Phase+)
- [ ] Build `UseCasesSection` pattern. (Optional/Phase+)
- [x] Build `TeamSection` pattern. (Core)
- [ ] Build `ContactSection` pattern. (Optional/Phase+)
- [ ] Build `NewsletterSection` pattern. (Optional/Phase+)
- [ ] Build `BlogPreviewSection` pattern. (Optional/Phase+)
- [ ] Build `CaseStudyPreviewSection` pattern. (Optional/Phase+)
- [ ] Build `TrustSecuritySection` pattern. (Optional/Phase+)
- [x] Build `FooterCtaSection` pattern. (Core)
- [ ] Build `EmptyStateSection` pattern. (Optional/Phase+)

## Phase 6: Section Variants

- [x] Build Hero variants (`HeroCentered`, `HeroSplit`).
- [x] Build Footer variants (`FooterSimple`, `FooterColumns`).
- [x] Build at least one feature/testimonial section variant.
- [x] Ensure section props are data-driven and variant-based.
- [x] Build pricing section variants (example: `Pricing3Tier`, `PricingEnterprise`). (Core)
- [x] Build testimonial section variants (example: grid + quote spotlight). (Core)
- [x] Build FAQ section variants (compact + full). (Core)
- [x] Build `FeatureSplitSection` variants (example: media-left + media-right). (Core)
- [x] Build `CTASection` variants (example: centered + split). (Core)
- [x] Build `TeamSection` variants (example: grid + lead-profile). (Core)
- [x] Build `StatsSection` variants (example: row + cards). (Core)
- [x] Build `FeatureComparison` variants (example: compact + detailed). (Core)
- [x] Build `FooterCtaSection` variants (example: centered + split). (Core)
- [ ] Build optional section variants from Phase 5 optional list as needed. (Deferred by design; will implement when corresponding optional patterns are built)

## Phase 7: Routing and Page Assembly

- [ ] Assemble homepage from section variants only.
- [ ] Assemble About/Contact pages using patterns/sections.
- [ ] Confirm route-level components avoid one-off UI logic unless justified.
- [ ] Move reusable route logic into components/hooks.

## Phase 8: Database/Auth Readiness (Firebase-capable)

- [ ] Define repository/service abstraction for data access in `src/lib/data`.
- [ ] Ensure no direct DB calls from visual components.
- [ ] Define auth boundary and route protection approach.
- [ ] Define client/server data access rules (server preferred for sensitive operations).
- [ ] Document data model and validation strategy.

## Phase 9: Quality Gates

- [ ] Accessibility audit (keyboard, focus, ARIA, contrast).
- [ ] Responsive audit (mobile, tablet, desktop, large desktop).
- [ ] Theme audit (light/dark + persistence behavior).
- [ ] Performance audit (bundle impact of component library).
- [ ] Confirm docs updated for any API/contract changes.

## Phase 10: Documentation and Hand-off

- [ ] Update `docs/component-system-plan.md` if architecture/contract changed.
- [ ] Update `docs/engineering-standards.md` for coding/data standards changes.
- [ ] Add usage examples for each new reusable component.
- [ ] Add migration notes when refactoring existing components.

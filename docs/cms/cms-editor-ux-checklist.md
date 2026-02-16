# CMS Editor UX Checklist

This checklist tracks the Block Props Editor UX improvement stream so work stays focused and measurable.

## Scope

- Goal: Make Standard mode intuitive for non-technical users.
- Principle: Guided editing first (`Core content` + `Optional enhancements`), Advanced mode as fallback.
- Source contracts:
  - `src/lib/registry/props.schemas.js`
  - `src/lib/registry/sections.registry.js`
  - `src/components/cms/EditorWorkspace/BlockPropsEditorPanel.jsx`

## Phase 1: Foundation (Guided Standard Mode)

- [x] Implement `Core content` vs `Optional enhancements` structure.
- [x] Keep key content fields visible by default (`eyebrow`, `title`, `description`) where present.
- [x] Show optional fields via explicit `Add <Field>` actions.
- [x] Support removing optional fields via explicit `Remove <Field>` actions.
- [x] Keep Advanced mode available for full JSON editing.

## Phase 2: Required-Field Contract Alignment

- [x] Audit top-level required fields for all section schemas.
- [x] Add nested required field rules for object/array items (actions, plans, members, etc.).
- [x] Ensure server validation enforces nested required fields.
- [x] Ensure Standard mode visually marks nested required fields.

## Phase 3: Section-by-Section Guided Presets

Define section-specific guided groups, ordering, and user-first labels.

### Hero
- [x] `hero.centered.v1`
- [x] `hero.split.v1`

### Pricing
- [x] `pricing.3-tier.v1`
- [x] `pricing.enterprise.v1`

### Testimonials
- [x] `testimonials.grid.v1`
- [x] `testimonials.spotlight.v1`

### FAQ
- [x] `faq.compact.v1`
- [x] `faq.detailed.v1`

### Feature Split
- [x] `featureSplit.media-left.v1`
- [x] `featureSplit.media-right.v1`

### CTA
- [x] `cta.centered.v1`
- [x] `cta.split.v1`

### Team
- [x] `team.grid.v1`
- [x] `team.lead.v1`

### Stats
- [x] `stats.row.v1`
- [x] `stats.cards.v1`

### Feature Comparison
- [x] `featureComparison.compact.v1`
- [x] `featureComparison.detailed.v1`

### Footer
- [x] `footer.simple.v1`
- [x] `footer.columns.v1`

### Footer CTA
- [x] `footerCta.centered.v1`
- [x] `footerCta.split.v1`

## Phase 4: Optional-Field UX Quality

- [x] Convert technical field names to user-facing labels where needed.
- [x] Provide contextual helper text per guided group (not generic per field only).
- [x] Add empty-state guidance for list/object editors (e.g. plans, members, links).
- [x] Ensure add/remove actions are consistent across all optional groups.

## Phase 5: Validation + Feedback UX

- [x] Show inline field-level validation feedback in Standard mode.
- [x] Keep API validation messages mapped to user-friendly copy.
- [x] Ensure publish/pre-publish checks surface missing required content clearly.

## Phase 6: QA and Acceptance

- [x] Lint clean.
- [x] Regression check on add/edit/remove/save/cancel in Standard mode.
- [x] Verify optional-field add/remove behavior for every section variant.
- [x] Verify Advanced mode fallback remains intact.
- [x] Update `docs/session-context.md` and `docs/cms/cms-implementation-checklist.md` after each milestone.
- [x] Record QA matrix evidence in `docs/cms/cms-editor-qa-matrix.md`.

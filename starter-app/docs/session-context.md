# Session Context

Use this file to resume work in future chats without losing continuity.

## Current Status

- Active roadmap doc: `docs/implementation-checklist.md`
- Current phase: Phase 7 complete (route/page assembly complete)
- Next phase: Phase 8 (database/auth readiness planning)

## Completed So Far

- Design system tokens + theming architecture in `globals.css`
- Header/navigation with mobile drawer, burger animation, and theme toggle
- Context foundation:
  - `ThemeContext` implemented
  - `AppProviders` wired in `layout.jsx`
  - `UIContext` intentionally deferred for current scope
- Primitives layer implemented:
  - `Box`, `Stack`, `Grid`, `Text`, `Heading`, `Surface`, `Icon`
- UI layer implemented:
  - `Button`, `Card`, `Image`, `Badge`, `Accordion`, `Tabs`, `LogoMarquee`
- Patterns layer implemented (core + base compositions)
- Sections layer implemented (Phase 6 core variants):
  - Hero, Footer, Pricing, Testimonials, FAQ, FeatureSplit, CTA, Team, Stats, FeatureComparison, FooterCta
- Phase 7 routes assembled from reusable sections/patterns:
  - `Home`, `About`, `Services`, `Pricing`, `Contact`, `FAQ`, `Privacy`, `Terms`
- Shared route content contracts added in `src/lib/content/site-pages.js`
- Added `LegalDocumentSection` pattern for reusable legal/policy content pages

## Deferred by Design

- `UIContext` until a real global UI use case exists (e.g. toast manager)
- Optional pattern variants from Phase 5/6 are deferred until needed

## Next 3 Actions

1. Phase 8: define repository/service abstraction in `src/lib/data`.
2. Phase 8: document auth boundary and client/server data access rules.
3. Phase 9: run accessibility/responsive/theme/performance audits.

## Key Source-of-Truth Docs

- `docs/implementation-checklist.md` (execution progress)
- `docs/engineering-standards.md` (coding/architecture standards)
- `docs/component-system-plan.md` (overall architecture decisions)
- `docs/component/ui.md` (UI contracts)
- `docs/component/patterns.md` (pattern contracts)
- `docs/component/sections.md` (section variants)

## Constraints / Notes

- Lint should be run after major route/content additions to verify import and composition integrity.
- Project uses component-first folder conventions across `components`, `context`, and `hooks`.
- Keep composition hierarchy strict: `primitives -> ui -> patterns -> sections -> pages`.

## Resume Instruction

When resuming, instruct the assistant to read:
1. `docs/session-context.md`
2. `docs/implementation-checklist.md`
3. `docs/engineering-standards.md`

Then continue from the next unchecked **core** task.

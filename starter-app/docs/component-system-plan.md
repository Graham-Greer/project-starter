# Component System Plan

This document is the canonical plan for building and scaling this starter project into a reusable website template system.

Related docs:
- `docs/implementation-checklist.md`
- `docs/engineering-standards.md`
- `docs/component/ui.md`
- `docs/component/patterns.md`
- `docs/component/sections.md`

## Goals

- Build websites quickly using reusable, composable components.
- Keep styling and behavior consistent through a design system.
- Favor maintainability and clear contracts over one-off implementations.

## Architecture Layers

Build from low-level primitives upward:

1. `tokens` layer
- Global design tokens in `src/app/globals.css`:
  colors, typography scale, spacing, radius, shadows, z-index, motion, semantic theme tokens.

2. `primitives` layer
- Foundation components with minimal opinions:
  `Box`, `Stack`, `Grid`, `Text`, `Heading`, `Surface`, `Icon`.

3. `ui` layer
- Reusable building blocks:
  `Button`, `Card`, `Input`, `Tabs`, `Accordion`, `Badge`, `Image`, `LogoMarquee`.

4. `patterns` layer
- Compositions of UI components:
  `Section`, `SectionHeader`, `FeatureGrid`, `StatsRow`, `TestimonialRow`, `CTAGroup`.

5. `sections` layer
- Full page blocks with layout variants:
  `HeroCentered`, `HeroSplit`, `FeatureSection`, `FooterSimple`, `FooterColumns`.

6. `pages` layer
- Routes should assemble sections and content only.

## Reuse Rules

- Prefer composition over one-off components.
- A section should be made from patterns/UI components.
- A UI component should be made from primitives where practical.
- Single-use components are allowed only for truly unique page storytelling.
- No raw visual magic numbers in component APIs (use tokens/variants).

## API Contract Conventions (JSX-first)

Apply consistently across components:

- Common props:
  `id`, `className`, `style`, `data-*`, `aria-*`.
- Standard variant props:
  `variant`, `size`, `tone`, `layout`, `density` (as relevant).
- State contracts (when interactive):
  controlled/uncontrolled support such as `value/onValueChange`, `open/onOpenChange`.
- Semantic naming:
  use `tone="primary"` instead of visual-specific flags.
- Slot-like composition:
  `iconLeft`, `iconRight`, `actions`, `media`, `footer` over too many booleans.

Recommended shared variant constants (JS):
- `SIZE_OPTIONS = ["sm", "md", "lg"]`
- `TONE_OPTIONS = ["neutral", "primary", "success", "warning", "danger"]`
- `BUTTON_VARIANTS = ["solid", "outline", "ghost"]`

## Styling Strategy

Yes: use `.module.css` for component styling, alongside `globals.css`.

Use `globals.css` for:
- Design tokens (including semantic light/dark theme tokens).
- Base element defaults (`body`, headings, paragraph defaults).
- Minimal global utility classes only when broadly useful.

Use `.module.css` for:
- Component-specific layout, spacing, variants, and responsive behavior.
- Encapsulated styles for each component without leakage.

Rules:
- Components should consume token variables from `globals.css`.
- Avoid raw hex/px values in module files when token equivalents exist.
- Avoid styling components directly in route page CSS when the style belongs to the component itself.

## Folder Structure

Target structure:

- `src/components/primitives`
- `src/components/ui`
- `src/components/patterns`
- `src/components/sections`
- `src/components/icons`
- `src/lib/content`
- `src/lib/constants`
- `src/lib/utils`
- `docs/`

Component file convention:
- Use component-first folders.
- Format:
  - `src/components/<layer>/<ComponentName>/<ComponentName>.jsx`
  - `src/components/<layer>/<ComponentName>/<component-name>.module.css`
  - `src/components/<layer>/<ComponentName>/index.js`
- Keep layer-level barrels (e.g. `src/components/primitives/index.js`) for clean imports.

Context/hooks convention:
- Apply folder-first structure to context and hooks as well.
- Format:
  - `src/context/<ContextName>/<ContextName>.jsx`
  - `src/context/<ContextName>/index.js`
  - `src/hooks/<hookName>/<hookName>.js`
  - `src/hooks/<hookName>/index.js`
- Keep layer-level barrels:
  - `src/context/index.js`
  - `src/hooks/index.js`

## Initial Component Backlog

Phase 1 (foundation):
1. `Icon`
2. `Button` (variants + sizes + tones)
3. `Card` (variants)
4. `Section`
5. `SectionHeader`

Phase 2 (interactive):
1. `Accordion`
2. `Tabs`
3. `Image` wrapper
4. `LogoMarquee` (infinite horizontal scroller)

Phase 3 (page sections):
1. Hero variants (`HeroCentered`, `HeroSplit`)
2. Footer variants (`FooterSimple`, `FooterColumns`)
3. Feature/testimonial/pricing section variants

## Quality and Maintainability Guardrails

- Accessibility defaults required for interactive components.
- Theme-aware by default (light/dark tokens, no hardcoded colors).
- Reuse first: no duplicate patterns before checking existing components.
- Keep components small and focused; compose for complexity.
- Document each component with usage examples and supported variants.

## Decision Log

Current project decisions:
- Implementation language remains `.jsx` (TypeScript not required).
- Theme toggle lives in header as compact sun/moon control.
- Browser theme preference is the default when no explicit user override exists.

## Context Blueprint

This blueprint defines where Context should be used and how to keep it maintainable.

### Principles

- Use Context for cross-cutting app state only.
- Do not move all logic into Context; keep feature logic in hooks/services.
- Prefer local component state first, then Context only when multiple distant consumers need the same state.
- Keep provider APIs small and explicit: `state + actions`.
- Split contexts by concern to avoid a monolithic `AppContext`.

### Context Scope Matrix

Use this hierarchy to choose state location:

1. URL state
- Filters, sorting, pagination, active tabs tied to navigation/shareable links.

2. Server/cache state
- Fetched content/data from APIs or CMS (use fetch/cache strategy, SWR, or React Query later if needed).

3. Context state
- Global/shared client concerns used across multiple routes/components.

4. Local state
- UI details only needed by one component subtree.

### Initial Contexts (Phase 1)

1. `ThemeContext`
- Responsibility:
  theme preference (`light | dark`) and toggle action.
- Notes:
  should remain the single source for theme preference and persistence.

2. `UIContext`
- Responsibility:
  lightweight global UI concerns:
  toasts, global dialog stack, command palette open/close, loading overlays.
- Notes:
  keep this minimal; split later if it grows.

No additional contexts until a real multi-consumer need appears.

### Future Contexts (Only When Needed)

1. `AuthContext`
- User session identity and auth actions.

2. `LocaleContext`
- Language/region settings and switch action.

3. `FeatureFlagContext`
- Runtime feature toggles for controlled rollout.

### File/Folder Blueprint

- `src/context/ThemeContext.jsx`
- `src/context/UIContext.jsx`
- `src/context/providers.jsx` (single composed providers wrapper)
- `src/hooks/useThemeContext.js`
- `src/hooks/useUIContext.js`
- `src/lib/theme/` (persistence helpers, constants)

### Provider Composition Pattern

- Use a single `AppProviders` component in a client boundary.
- In `layout.jsx`, wrap app content with `AppProviders`.
- Order:
  `ThemeProvider` outermost, then `UIProvider`.

Rationale:
- Theme should be available to all UI layers.
- UI context can depend on theme tokens if required.

### Contract Pattern for Each Context

For each context, expose:
- `state` object with minimal shape.
- `actions` object for all mutations.
- dedicated hook (`useThemeContext`) that throws if provider is missing.

Recommended shape example:
- `state`: serializable and minimal.
- `actions`: stable callbacks (`useCallback`) to reduce rerenders.

### Performance Guardrails

- Memoize provider `value`.
- Avoid passing non-memoized objects/functions.
- Split context when unrelated updates cause broad rerenders.
- Keep high-frequency local UI state out of global context.

### DRY Guardrails

- Shared behavior should live in hooks/services, not duplicated in components.
- Context should orchestrate shared state, not implement component-specific view logic.
- If a context action becomes complex, extract to `src/lib/...` helper and call from provider.

### Implementation Sequence

1. Create `src/context/providers.jsx`.
2. Move existing theme logic into `ThemeContext`.
3. Update `ThemeToggle` and any theme consumers to use `useThemeContext`.
4. Introduce `UIContext` only with one concrete global use case (e.g. toast system).
5. Re-evaluate after first 2-3 feature sections and split contexts only if needed.

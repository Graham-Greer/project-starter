# Engineering Standards

Use this file as the authoritative coding standard for creating and updating code in this project.

## 1. Core Principles

- Reuse over duplication.
- Composition over one-off implementations.
- Tokens over hardcoded values.
- Accessibility and responsiveness by default.
- Keep logic testable and isolated.

## 2. Architecture and Layering

Required component layering:

1. `tokens` -> `globals.css`
2. `primitives` -> low-level composable building blocks
3. `ui` -> reusable UI elements
4. `patterns` -> component compositions
5. `sections` -> page block variants
6. `routes/pages` -> section composition only

Rules:
- Components in higher layers can depend on lower layers only.
- Do not import `sections` into `ui`/`primitives`.
- Do not place business/data logic inside presentational components.
- Route/page files must remain composition shells:
  - Keep route components focused on wiring state + child modules.
  - Extract data mutations/query orchestration into hooks/services when scope grows.
  - Avoid duplicating renderer/editor logic across route and child components.

## 3. Styling Rules

- Use `globals.css` for:
  tokens, theme semantics, and base element defaults.
- Use `.module.css` for:
  component-level styling and responsive behavior.
- Colocate styles with their component in component-first folders:
  `src/components/<layer>/<ComponentName>/<component-name>.module.css`.
- Use folder-first conventions for context/hooks too:
  - `src/context/<ContextName>/<ContextName>.jsx`
  - `src/hooks/<hookName>/<hookName>.js`
  with `index.js` files at component and layer level.
- All component styles must consume design-system tokens.
- Avoid raw hex and px values when token equivalents exist.
- Avoid route CSS owning styles that belong to reusable components.

## 4. Component API Standards (JSX)

Every reusable component should support:
- `id`, `className`, `style`, `data-*`, `aria-*`.

Use consistent variant props where relevant:
- `variant`, `size`, `tone`, `layout`, `density`.

Interaction standards:
- Provide controlled/uncontrolled APIs when needed.
- Prefer semantic/slot props (`iconLeft`, `actions`, `media`) over many booleans.
- Preserve keyboard and screen-reader support by default.
- For destructive confirmations in product UI, use reusable modal/dialog components.
- Avoid `window.confirm`/`window.alert` in shipped CMS experiences unless explicitly approved for a temporary fallback.

## 5. State and Context Standards

State location priority:
1. URL state for navigation/shareable state.
2. Server/cache state for remote data.
3. Context for cross-cutting shared client state.
4. Local state for isolated component behavior.

Context rules:
- No monolithic `AppContext`.
- Split by concern (`ThemeContext`, `UIContext`, etc.).
- Export strict hooks (`useThemeContext`) that throw outside provider.
- Keep provider values memoized and minimal.

## 6. Data Access and Database Standards

### 6.1 General Data Rules

- Never call database SDKs directly from presentational components.
- Route all DB communication through repository/service modules.
- Validate all inputs before writes and normalize outputs after reads.
- Keep data contracts explicit and documented.
- Reserve `id` as an identity boundary field (document/query identity), not mutable payload data.
- Never persist `id` inside document payloads when the datastore already provides canonical document IDs.

Suggested structure:
- `src/lib/data/` for repositories/services
- `src/lib/validation/` for schema validation
- `src/lib/auth/` for auth/session helpers

### 6.2 Firebase-Specific Approach

When Firebase is added:

- Use Firebase Admin/server context for privileged operations.
- Use client SDK only for operations safe for client-side execution.
- Enforce authorization in Firebase Security Rules plus server checks where applicable.
- Keep Firebase config/bootstrap in one place (`src/lib/firebase/`).
- Do not scatter Firebase imports across the app.

Recommended modules:
- `src/lib/firebase/client.js`
- `src/lib/firebase/server.js`
- `src/lib/data/<domain>-repository.js`

### 6.3 Write/Mutation Standards

- Validate payloads before mutation.
- Use idempotent write patterns where possible.
- Return typed/normalized response objects (in JS: stable object shape).
- Centralize error mapping from SDK errors to app-friendly errors.

### 6.4 Read/Query Standards

- Query by indexed keys and defined filters only.
- Avoid over-fetching; request only required fields/data.
- Implement pagination/cursor patterns for list screens.
- Cache where appropriate and invalidate intentionally.
- Adapters must normalize identity consistently so canonical store IDs override any stale payload identity fields.

## 7. Auth and Access Control Standards

- Keep auth logic out of UI components.
- Use route-level guards/middleware and server checks for protected content.
- Never trust client-only checks for access enforcement.
- Use least-privilege access patterns.

## 8. Accessibility Standards

- All interactive components must be keyboard operable.
- Correct ARIA attributes where semantic HTML is insufficient.
- Maintain visible focus states.
- Verify color contrast in both light and dark themes.

## 9. Performance Standards

- Keep client bundles lean; prefer server rendering where possible.
- Avoid unnecessary global state updates.
- Lazy-load heavy or below-the-fold components when practical.
- Keep animations respectful of reduced-motion preferences.

## 10. Documentation and Change Control

- Any architecture/API change must update:
  - `docs/component-system-plan.md`
  - `docs/implementation-checklist.md`
  - `docs/engineering-standards.md` (if rules changed)

- New reusable components should include:
  - clear props/variant contract
  - usage example
  - accessibility notes for interactive behavior

## 11. Definition of Done (for feature PRs)

- Reuse existing components where possible.
- Uses tokens and semantic theming.
- Meets accessibility and responsive standards.
- Data access follows repository/service abstraction.
- Docs updated when contracts or standards change.

## 12. Monorepo Readiness Rules

- Build shared contracts as app-agnostic modules (candidate future packages):
  - `src/lib/registry`
  - `src/lib/validation`
  - `src/lib/data` interfaces/contracts
- Avoid deep relative imports across domains; prefer stable barrel exports.
- Do not import route/page/layout modules into shared library code.
- Keep CMS/editor concerns isolated from public site rendering concerns.
- Preserve API stability for shared modules so they can move to `packages/*` later without call-site changes.
- For CMS-specific guardrails and boundaries, follow:
  - `docs/cms/cms-engineering-guardrails.md`

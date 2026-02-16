# CMS Navigation + Header Checklist

This checklist tracks implementation of CMS-managed header/navigation so live runtime no longer depends on base marketing header behavior.

## Scope

- Goal: Let users manage site navigation explicitly (not auto-derived from page structure).
- Goal: Render header/navigation from CMS runtime config on `/live/*`.
- Goal: Keep static fallback and controlled rollout behavior intact.
- Related docs:
  - `docs/cms/cms-public-runtime-plan.md`
  - `docs/cms/cms-data-model.md`
  - `docs/cms/cms-implementation-checklist.md`

## Decisions Locked (v1)

- Header is **site-level global by default** in v1 with optional per-page override in page edit mode.
- Header presets support multiple site-level headers with one active header (`activeHeaderId`) used at runtime.
- Navigation is **manual-first** in v1:
  - user controls labels, order, and visibility.
  - optional “Generate from pages” is a helper, not default source of truth.
  - single menu scope in UI (`primary`) for v1 clarity.
- Header variants for v1:
  - `simple`
  - `minimal`
- CTA behavior:
  - up to two optional CTAs under `simple`
  - CTA fields are opt-in in CMS UI (hidden until user adds them)
  - legacy `split-cta` values are treated as `simple` behavior in editor/runtime flow
- Overlay/transparent behavior is a **header option**, not a separate variant.
- Mobile drawer behavior is **shared** across nav-capable variants.

## Phase 1: Data Model + Contracts

- [x] Add site-level `navigation` config object to site model contract.
- [x] Add site-level `header` config object to site model contract.
- [x] Add site-level `headers` presets array + `activeHeaderId` contract (backward compatible with legacy `header`).
- [x] Define nav item schema:
  - `id`
  - `label`
  - `type: "page" | "url"`
  - `pageId` (when `type=page`)
  - `href` (when `type=url`)
  - `visible` (default `true`)
  - `openInNewTab` (default `false`)
  - `order`
- [x] Include optional `children` field in schema and surface nested navigation editing in CMS.
- [x] Define header schema:
  - `variant` (`simple | minimal`)
  - `overlayMode` (`auto | off`)
  - `sticky` (`true | false`)
  - `mobilePattern` (`drawer`)
  - CTA fields where applicable.
- [x] Update API response contracts (`GET sites`, `GET/PATCH site`) to include new config.
- [x] Add server-side validation for navigation/header payloads.

## Phase 2: API + Persistence

- [x] Add site settings patch handler support for:
  - `header` config updates
  - `navigation` config updates
- [x] Enforce RBAC:
  - `owner/admin/editor` can update
  - `viewer` read-only
- [x] Add normalization/sanitization:
  - trim labels
  - normalize URL shape
  - remove duplicate/invalid nav ids
  - stable order indexing
- [x] Add migration-safe defaults for existing sites with no header/navigation config.

## Phase 3: CMS IA + Navigation Screen

- [x] Add left sidebar primary nav entries:
  - `Dashboard`
  - `Pages`
  - `Navigation`
- [x] Move Navigation builder into main content area (not sidebar forms).
- [x] Build `Navigation` screen with:
  - item list
  - add item form
  - reorder support
  - visibility toggles
  - link type switch (`page/url`)
  - open-in-new-tab toggle
- [x] Add explicit save feedback (`Saving...` / `Saved` / error).
- [x] Add empty state guidance for first-time setup.

## Phase 4: Header Config Screen (same area or adjacent panel)

- [x] Add header variant selector.
- [x] Add header preset selector + create preset action (multiple headers per site).
- [x] Add shared behavior controls:
  - overlay mode
  - sticky
  - mobile drawer behavior
- [x] Add CTA controls for variants that support CTA.
- [x] Add preview card for selected header variant with realistic seeded content.

## Phase 5: Live Runtime Rendering

- [x] Exclude base marketing header chrome from `/live/*`.
- [x] Render runtime header from site `header` + `navigation` config.
- [x] Resolve page-type nav items to live paths.
- [x] Handle hidden items (`visible=false`) consistently.
- [x] Keep mobile drawer behavior consistent with design-system header UX.
- [x] Ensure static routes remain unaffected.

## Phase 6: Validation + Publish Guardrails

- [x] Add pre-publish checks for navigation/header:
  - invalid/missing target for visible nav item
  - duplicate nav ids
  - invalid URL scheme for custom links
- [x] Surface actionable fix links in CMS UI.
- [x] Ensure publish cache invalidation covers header/navigation updates.

## Phase 7: QA + Acceptance

- [x] Lint clean.
- [x] Regression check:
  - site switch
  - runtime mode switch (`static` vs `cms-live`)
  - page edit mode transitions
- [x] Navigation CRUD and reorder verified on desktop/mobile.
- [x] Live runtime uses CMS header/nav (no base header bleed-through).
- [x] Access controls verified for viewer role.
- [x] Update docs/session context after milestone completion.
- [x] Record QA evidence in `docs/cms/cms-navigation-qa-matrix.md`.

## Optional Enhancements (Backlog)

- [x] “Generate from pages” helper action (one-time scaffold).
- [x] Nested dropdown nav UI (activate `children` support).
- [ ] Multi-menu support (`primary`, `footer`, `legal`) (defer; footer/legal handled by footer section variants in current UX).
- [x] Per-page header override in page edit mode:
  - default uses global active site header (`inherit`)
  - optional override to any site header preset
  - page header panel appears above page sections + section library in page edit flow
- [ ] Per-page nav item hide/show rules (defer; only if real demand remains after per-page variant override).
- [ ] Scheduled nav changes (time-based publication).
- [ ] A/B test nav label experiments (defer until required).
- [ ] Navigation analytics hooks (clickthrough by item).
- [ ] Import/export navigation presets.
- [ ] Template-specific header presets with one-click apply.

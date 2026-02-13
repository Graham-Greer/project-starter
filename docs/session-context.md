# Session Context

Use this file to resume work in future chats without losing continuity.

## Current Status

- Active roadmap doc: `docs/implementation-checklist.md`
- Current phase: CMS Phase F in progress (publish flow operational; rollback + cache invalidation pending)
- Next phase: complete publish hardening (rollback + cache invalidation), then wire registry thumbnails/metadata

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
- CMS planning docs created in `docs/cms/`:
  - `product-vision-cms.md`
  - `cms-architecture.md`
  - `cms-data-model.md`
  - `cms-ai-workflows.md`
  - `cms-engineering-guardrails.md`
  - `cms-implementation-checklist.md`
  - `firebase-setup-and-rules.md`
- CMS foundation scaffolding implemented:
  - `src/lib/data` repositories + adapter interface scaffolds
  - `src/lib/registry` section/variant registry + resolver
  - `src/lib/validation` page/block/props validation utilities
  - Firebase env contract + loader (`.env.example`, `src/lib/config/firebase-env.js`)
  - Firebase Admin bootstrap + adapter implementation baseline (`src/lib/firebase/admin.js`, `src/lib/data/adapters/firebase-adapter.js`)
  - Auth + RBAC baseline (`src/lib/auth`, `src/lib/data/secure-cms-services.js`, `/api/cms/*` verification/bootstrap routes)
  - CMS sign-in/session baseline (`/cms/sign-in`, `/cms`, `/api/cms/auth/session`, `src/context/CmsAuthContext`)
  - Dev runtime validation completed:
    - sign-in -> `/cms` redirect
    - workspace bootstrap endpoint
    - workspace access check endpoint
  - Fallback renderer baseline implemented:
    - section fallback component: `src/components/sections/SectionRenderFallback`
    - block renderer utility: `src/lib/registry/render-section-block.jsx`
    - component-key map: `src/lib/registry/section-component-map.js`
  - CMS site management baseline implemented:
    - workspace sites API: `GET/POST /api/cms/workspaces/[workspaceId]/sites`
    - CMS dashboard workspace load + site list + site create flow in `/cms`
  - CMS page management baseline implemented:
    - site pages API: `GET/POST /api/cms/sites/[siteId]/pages`
    - pages list API supports server-side pagination response (`page`, `pageSize`, `rows`, `pagination`).
    - single page API: `PATCH/DELETE /api/cms/sites/[siteId]/pages/[pageId]`
    - `PATCH` supports updating page title, slug, parent, and SEO metadata (`metaTitle`, `metaDescription`, `ogImageUrl`) in one request with path cascade updates
    - CMS dashboard site selection + page list + page create flow in `/cms`
    - hierarchical page model support with `parentPageId`, `order`, and `path`
    - reparent endpoint with cycle prevention + descendant path updates: `PATCH /api/cms/sites/[siteId]/pages/[pageId]`
    - descendant subtree delete support via `DELETE /api/cms/sites/[siteId]/pages/[pageId]`
    - clone endpoint support via `POST /api/cms/sites/[siteId]/pages/[pageId]/clone`
    - pre-publish validator endpoint support via `GET /api/cms/sites/[siteId]/pages/[pageId]/prepublish`
    - publish endpoint support via `POST /api/cms/sites/[siteId]/pages/[pageId]/publish`
    - publish flow creates immutable page version + site snapshot and updates publish pointers
    - published pages now track `hasUnpublishedChanges` for republish flow without auto-reverting status to draft
    - move-page-parent control retained in CMS sidebar content panel
  - CMS block composer scaffold implemented:
    - page blocks API: `GET/PUT /api/cms/sites/[siteId]/pages/[pageId]/blocks`
    - add/reorder/remove/save blocks flow in `/cms`
  - CMS block props editor scaffold implemented:
    - schema-driven field rendering from `props.schemas`
    - selected-block prop editing in `/cms` with local updates + block save flow
    - editor modes: `Standard` + `Advanced` with shared prop reference guidance
  - CMS live preview scaffold implemented:
    - preview route: `/cms/preview/[siteId]/[pageId]`
    - device/theme preview controls + iframe panel in `/cms`
    - preview path chrome suppression for header/scroll-to-top
    - preview route metadata now consumes page SEO fields (`metaTitle`, `metaDescription`, `ogImageUrl`)
  - CMS UX layout refinement implemented:
    - two-column workspace/editor layout instead of fully stacked vertical flow
    - public site chrome hidden on `/cms` routes (CMS-specific shell behavior)
    - full-width CMS content canvas with topbar actions
    - sidebar IA split by mode:
      - non-edit mode: Dashboard section (workspace role + switch workspace + add site/page actions)
      - edit mode: Section library only
    - active workspace + actions merged into a single Dashboard section
    - add-site/add-page/switch-workspace forms render on-demand below Dashboard
    - explicit page edit mode (composer/preview shown only when editing)
    - main-area Pages list for management (hierarchy indent + pagination + edit/clone/delete actions)
    - delete flow now uses reusable confirmation modal component instead of browser confirm
    - page settings includes pre-publish check action with pass/fail checklist feedback
    - page settings includes publish action and status feedback (`draft`/`published`)
    - publish now clears page-level `hasUnpublishedChanges` to prevent stale `changes pending` state after republish
    - editing published content now invalidates prior pre-publish success immediately (no page refresh required)
    - page-settings success notices for pre-publish/publish now auto-dismiss after a short delay
    - Pages list now consumes server-side paginated rows rather than client-side full-list slicing
    - page title click enters edit mode; save/exit returns user to Pages list
    - visual block library cards and selected-block visual preview before adding
    - side-by-side library/composer and props/reference panels on desktop
    - advanced-mode helpers: format JSON + reset-to-schema template
    - dirty-state safeguards: unsaved-change prompts before workspace/site/page/sign-out changes
    - browser refresh/close protection when unsaved composer changes exist
    - saving page blocks no longer exits edit mode/composer
    - standard-mode schema coverage expanded across all registry section variants
    - recursive object/array editors added for non-technical nested content editing
    - variant-picker previews now use example seed data for complete visual representations
    - live preview remains tied to actual draft content state
    - CMS route modularization pass:
      - `src/app/cms/page.jsx` reduced from mixed UI/logic rendering toward orchestration-only composition
      - sidebar split into focused modules: `DashboardPanel`, `DashboardActionPanel`, `PageSettingsPanel`, `SectionLibraryPanel`
      - editor workspace split into focused modules: `VariantPickerPanel`, `PageSectionsPanel`, `BlockPropsEditorPanel`, `LivePreviewPanel`
      - shared CMS helpers centralized in `src/lib/cms/cms-utils.js`
      - data/mutation orchestration extracted into hooks:
        - `src/hooks/cms/useCmsWorkspacePageActions.js` (workspace/site/page fetch + mutation flows)
        - `src/hooks/cms/useCmsBlockActions.js` (block load/edit/reorder/persist flows)
      - derived CMS selector/view model extracted into hook:
        - `src/hooks/cms/useCmsPageViewModel.js` (selected entities + preview/pagination/composer derived state)

## Deferred by Design

- `UIContext` until a real global UI use case exists (e.g. toast manager)
- Optional pattern variants from Phase 5/6 are deferred until needed

## Next 3 Actions

1. Implement rollback/unpublish workflow on top of immutable snapshots.
2. Implement live cache invalidation strategy after publish.
3. Generate and wire registry thumbnails/metadata.

## Key Source-of-Truth Docs

- `docs/implementation-checklist.md` (execution progress)
- `docs/cms/cms-implementation-checklist.md` (CMS-specific execution progress)
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

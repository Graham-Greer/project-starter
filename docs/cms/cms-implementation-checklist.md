# CMS Implementation Checklist

This checklist runs alongside `docs/implementation-checklist.md` and covers the CMS product track.

## Phase A: Product + Technical Discovery

- [x] Document product vision and scope in `docs/cms/product-vision-cms.md`.
- [x] Document architecture in `docs/cms/cms-architecture.md`.
- [x] Document data model and section registry in `docs/cms/cms-data-model.md`.
- [x] Document AI workflows in `docs/cms/cms-ai-workflows.md`.
- [x] Document CMS engineering guardrails in `docs/cms/cms-engineering-guardrails.md`.
- [x] Freeze CMS v1 section/variant scope in `docs/cms/cms-data-model.md`.
- [x] Confirm MVP boundaries and launch metrics.

## Phase B: Core Platform Foundation

- [x] Implement Firebase project config separation (dev/stage/prod).
- [x] Define Firestore/Storage rules baseline per environment.
- [x] Implement auth + workspace membership model.
- [x] Implement RBAC guardrails (owner/admin/editor/viewer).
- [x] Build CMS sign-in/session flow (Firebase Auth + server session cookie sync).
- [x] Add repository/service layer in `src/lib/data` for CMS entities.
- [x] Add schema validation layer for page block payloads.
- [x] Validate dev runtime flow: sign-in -> `/cms` -> workspace bootstrap -> workspace access check.

## Phase C: Section Registry + Renderer Contracts

- [x] Implement section/variant registry in `src/lib/registry`.
- [x] Implement props schema registry + validation utilities.
- [x] Build resolver: `sectionType + variant -> component`.
- [x] Build fallback renderer for unknown/invalid blocks.
- [x] Generate and wire registry thumbnails/metadata.
- [x] Lock header architecture to site config (not section registry blocks):
  - Header remains managed in Navigation/Header workspace.
  - Per-page header behavior uses `inherit` or preset override from page settings.
  - Section registry scope stays focused on page body sections.

## Phase D: CMS Admin Portal

- [x] Create dedicated editor UX tracker: `docs/cms/cms-editor-ux-checklist.md`.
- [x] Create dedicated navigation/header tracker: `docs/cms/cms-navigation-checklist.md`.
- [x] Build site list/create flow.
- [x] Build page list/create flow.
- [x] Build dedicated Navigation management screen in CMS main content area:
  - Sidebar view-switch between `Pages` and `Navigation`.
  - Navigation item CRUD + ordering + visibility + target type controls.
  - Save/discard status messaging and first-run empty state guidance.
- [x] Build Header configuration controls in CMS main content area:
  - Header variant + behavior controls (`overlayMode`, `sticky`, `mobilePattern`).
  - Header CTA controls with validated patch persistence.
  - Header preview card to guide non-technical users.
- [x] Render CMS-driven runtime header/navigation on `/live/*`:
  - Base marketing header/scroll-to-top chrome is suppressed on live routes.
  - Live header resolves from site `header` + `navigation` config.
  - Page-type nav links resolve through published snapshot page entries.
  - Live mobile drawer behavior implemented for nav-capable header variants.
- [x] Add navigation/header pre-publish guardrails:
  - Pre-publish now validates header config and navigation config integrity.
  - Visible navigation items must resolve to valid page/URL targets.
  - Pre-publish failures include actionable “Fix this” links to Navigation workspace.
- [x] Complete navigation/header implementation QA acceptance:
  - Recorded in `docs/cms/cms-navigation-qa-matrix.md`.
  - Includes runtime-mode, live-header rendering, pre-publish fix-flow, and RBAC verification.
- [x] Replace delete-page browser confirms with reusable confirmation modal UX.
- [x] Add page SEO metadata editing in Page settings:
  - SEO title + description fields in CMS UI.
  - OG image URL field in CMS UI (`seo.ogImageUrl`) with URL guidance.
  - Server-side validation/limits on update endpoint.
  - SEO metadata included in page response contracts.
  - CMS preview route metadata now consumes SEO fields for social/meta tags.
- [x] Add hierarchical page IA in CMS content tree:
  - Parent/child page model support (`parentPageId`, `order`, `path`).
  - Hierarchical page listing in main content area with title indentation.
  - Reparent action with cycle prevention and path cascade updates.
  - Page deletion flow (including descendant subtree deletion).
  - Page clone flow (duplicate draft page with copied blocks/SEO under same parent).
  - Page settings update flow for title, slug, and parent in a single action.
- [x] Build block composer (add/reorder/remove blocks).
  - Section delete now uses reusable confirmation modal and persists immediately on confirm.
- [x] Build block props editor from schema definitions.
- [x] Build live preview panel (desktop/tablet/mobile + theme).
- [x] Add non-technical editing UX:
  - Standard mode with guided controls and field help text.
  - Advanced mode with prop reference, JSON formatting, and schema template reset.
- [x] Refine CMS page layout for desktop:
  - Two-column workspace + editor shell.
  - Side-by-side library/composer and props/reference panels.
  - CMS-specific topbar/sidebar shell with full-width canvas and contextual forms.
  - Sidebar IA updated to Dashboard mode (workspace/site/page actions) vs Edit mode (page settings only).
  - Section library + variant picker consolidated into main editor workflow with back navigation.
  - Active workspace + actions merged into a single Dashboard section.
  - Add-site/add-page forms render on-demand below Dashboard.
  - Composer/preview panels gated behind explicit page edit mode.
  - Main-area Pages management list with hierarchical title indentation, row actions, and pagination.
  - Page title click enters edit mode; save/exit returns to Pages list.
  - Pages list wired to server-side pagination (`page` + `pageSize` API query contract).
- [x] Refactor CMS route composition into reusable modules:
  - `src/app/cms/page.jsx` reduced to orchestration shell responsibilities.
  - Sidebar split into reusable panels (`DashboardPanel`, `DashboardActionPanel`, `PageSettingsPanel`, `SectionLibraryPanel`).
  - Editor workspace split into focused panels (`VariantPickerPanel`, `PageSectionsPanel`, `BlockPropsEditorPanel`, `LivePreviewPanel`).
  - Editor and pages/list concerns continue through dedicated CMS component modules (`EditorWorkspace`, `PagesListPanel`, `CmsTopbar`, `CmsSidebar`).
  - Shared CMS field/schema/tree helpers centralized in `src/lib/cms/cms-utils.js`.
  - Data/mutation orchestration extracted from route into hooks:
    - `src/hooks/cms/useCmsWorkspacePageActions.js`
    - `src/hooks/cms/useCmsBlockActions.js`
  - Derived view-model/selectors extracted from route:
    - `src/hooks/cms/useCmsPageViewModel.js` (selected site/page/block, preview model, parent-page options, pagination display model)
- [x] Add unsaved-change safeguards in composer:
  - Dirty-state detection from last persisted block payload.
  - Confirm-before-switch for workspace/site/page/sign-out.
  - Browser refresh/close warning when unsaved changes exist.
- [x] Expand Standard mode editing coverage across registered section variants:
  - Nested object + array field editing (actions, media, plans, testimonials, team members, footer columns/links).
  - Dynamic key/value object editing for dictionary-style props (e.g. comparison row values).
  - Schema-driven select options and deeper nested validation contracts.
  - Required-field contracts aligned across section schemas (including nested object/array item required fields).
  - Nested required fields now enforced server-side and surfaced in Standard mode labels.
  - Guided Standard mode flow implemented: `Core content` always visible, `Optional enhancements` shown via explicit add/remove actions.
  - Standard mode hides internal schema `id` fields and auto-generates list-item IDs for non-technical users.
  - Standard mode no longer seeds placeholder content; optional fields initialize empty and legacy placeholder values are sanitized.
  - Newly added unsaved sections are discarded on cancel; only one in-progress unsaved new section is allowed at a time.
- [x] Implement variant-picker example previews:
  - Add registry preview seed payloads per section variant.
  - Merge schema defaults + preview seeds for complete variant representations.
  - Keep live preview bound to actual draft page content.
- [x] Improve editor validation and publish guidance UX:
  - Inline field-level validation in Standard mode (required, type/length constraints, URL-like fields).
  - API block validation errors mapped back to field paths with user-friendly inline copy.
  - Pre-publish failures now render actionable fix items in Page Settings with jump-to-field/section actions.

## Phase E: Media Library Foundation (Pre-AI Dependency)

- [x] Create dedicated media-library tracker: `docs/cms/cms-media-library-checklist.md`.
- [x] Implement workspace-scoped media asset model and APIs.
- [x] Implement secure Firebase Storage upload/list/delete flow with RBAC and validation.
- [x] Build CMS Media library view in main content panel.
- [x] Build reusable media picker for header/logo, section media fields, and SEO OG image selection.
- [x] Ensure preview/live runtime resolve selected media assets correctly.

## Phase F: AI Copilot (After Media Library Foundation)

- [ ] Implement AI run service (structured input/output contracts).
- [ ] Build page draft generation flow.
- [ ] Build block rewrite flow.
- [ ] Build SEO assist flow.
- [ ] Build proposal diff/review/apply UI.

## Phase G: Publish Pipeline

- [x] Implement draft save + autosave behaviors.
  - Debounced autosave now persists block draft edits while in page edit mode.
  - Manual save remains available for explicit commit control.
- [x] Implement pre-publish validators.
- [x] Implement immutable page/site snapshot creation.
- [x] Implement publish action + rollback/history.
  - Published pages keep status and use `hasUnpublishedChanges` for republish readiness.
  - Publish now explicitly clears page `hasUnpublishedChanges` so status returns to `Published` after republish.
  - Editing a published page now invalidates prior pre-publish success state immediately (run-check button reappears without refresh).
  - Pre-publish/publish success notices in Page settings auto-dismiss to keep panel feedback clean.
  - Saving blocks keeps editor in page edit mode (does not collapse back to Pages list).
  - Unpublish action now available in Page settings (`DELETE /publish`) to return a page to draft and refresh site snapshot pointers.
  - Publish history now available in Page settings via `GET /publish/history` (latest versions list).
  - Rollback-to-version now available in Page settings via `POST /publish/rollback`.
  - Rollback creates a new immutable published version and site snapshot (history-preserving rollback, not in-place mutation).
- [x] Implement live cache invalidation strategy.
  - Added publish-cache invalidation utility in `src/lib/cms/publish-cache.js`.
  - Publish/unpublish now trigger tag + path invalidation in `src/app/api/cms/sites/[siteId]/pages/[pageId]/publish/route.js`.
  - Strategy covers site-level, page-level, and path-level invalidation keys to support live runtime caching patterns.

## Phase G.5: Public Runtime Integration

- [x] Implement CMS-powered public runtime route in parallel namespace (`/live/[siteSlug]/[[...slug]]`).
- [x] Implement published-page resolver service (`site -> snapshot -> pageVersion -> page payload`).
- [x] Implement live runtime metadata from published SEO snapshot fields.
- [x] Keep existing static routes as fallback during rollout (no regression path).
- [x] Extend publish/unpublish invalidation to cover live runtime paths (`/live/[siteSlug]/*`).
- [x] Add site-level runtime-mode switch (`static` vs `cms-live`) for controlled adoption.
  - Added `runtimeMode` to site API contracts (`/api/cms/workspaces/[workspaceId]/sites`).
  - Added site update endpoint `PATCH /api/cms/sites/[siteId]`.
  - Added Dashboard control to switch selected site between `Static` and `CMS live`.
  - Live runtime resolver now serves only sites explicitly set to `cms-live`.

## Phase H: Reliability + Operations

- [x] Add audit logs for edit/publish events.
  - Added workspace-scoped audit log data layer (`workspaces/{workspaceId}/auditLogs`).
  - Mutation routes now write audit events (site/page create/update/delete, blocks save, publish/unpublish/rollback, clone).
  - Added read endpoint: `GET /api/cms/workspaces/[workspaceId]/audit-logs`.
  - Added CMS main-content Activity view with refresh + action/page filtering.
  - Added Activity quick presets (`Publishing`, `Content edits`, `Site config`) and row deep-link actions.
  - Added actor resolution in audit rows (label/email fallback instead of raw UID where available).
- [ ] Add analytics on AI usage and publish outcomes.
- [x] Add rate limits and quotas per workspace.
  - Added reusable server-side rate limiting utility in `src/lib/cms/rate-limit.js`.
  - Applied rate limits to publish/unpublish/rollback routes with standardized `429` + `Retry-After`.
  - Added reusable workspace daily quota utility in `src/lib/cms/quota.js`.
  - Applied daily quotas to publish/unpublish/rollback routes with standardized `429` responses (`code`, `action`, `limit`, `resetAt`).
- [x] Add backup/export strategy for site content.
  - Added workspace export endpoint: `GET /api/cms/workspaces/[workspaceId]/export`.
  - Supports optional site-scoped export via `?siteId=...`.
  - Export bundle includes workspace, sites, pages, pageVersions, siteSnapshots, summary metadata, schema version, and generated timestamp.
  - Export responses are downloadable JSON attachments and are audit-logged (`workspace.exported`).
- [x] Add monitoring/alerting for publish failures.
  - Added workspace alerts data layer (`workspaces/{workspaceId}/alerts`) and secure alerts API (`GET /api/cms/workspaces/[workspaceId]/alerts`).
  - Publish/unpublish/rollback routes now create structured failure alerts with reason codes.
  - Added CMS Alerts main-panel view with filtering and deep-link open actions.
  - Added automatic alert resolution on successful publish/unpublish/rollback for the same page.

## Phase I: White-label + Template Expansion

- [ ] Add template registry and template picker UX.
- [ ] Add brand token manager (colors/fonts/logo) and validation.
- [ ] Add domain settings UI and verification flow.
- [ ] Add white-label controls (custom branding, footer policy).
- [ ] Add migration tooling for template/version upgrades.

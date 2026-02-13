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
- [ ] Generate and wire registry thumbnails/metadata.

## Phase D: CMS Admin Portal

- [x] Build site list/create flow.
- [x] Build page list/create flow.
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
- [x] Build block props editor from schema definitions.
- [x] Build live preview panel (desktop/tablet/mobile + theme).
- [x] Add non-technical editing UX:
  - Standard mode with guided controls and field help text.
  - Advanced mode with prop reference, JSON formatting, and schema template reset.
- [x] Refine CMS page layout for desktop:
  - Two-column workspace + editor shell.
  - Side-by-side library/composer and props/reference panels.
  - CMS-specific topbar/sidebar shell with full-width canvas and contextual forms.
  - Sidebar IA updated to Dashboard mode (workspace/site/page actions) vs Edit mode (section library).
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
- [x] Implement variant-picker example previews:
  - Add registry preview seed payloads per section variant.
  - Merge schema defaults + preview seeds for complete variant representations.
  - Keep live preview bound to actual draft page content.

## Phase E: AI Copilot

- [ ] Implement AI run service (structured input/output contracts).
- [ ] Build page draft generation flow.
- [ ] Build block rewrite flow.
- [ ] Build SEO assist flow.
- [ ] Build proposal diff/review/apply UI.

## Phase F: Publish Pipeline

- [ ] Implement draft save + autosave behaviors.
- [x] Implement pre-publish validators.
- [x] Implement immutable page/site snapshot creation.
- [x] Implement publish action (rollback pending).
  - Published pages keep status and use `hasUnpublishedChanges` for republish readiness.
  - Publish now explicitly clears page `hasUnpublishedChanges` so status returns to `Published` after republish.
  - Editing a published page now invalidates prior pre-publish success state immediately (run-check button reappears without refresh).
  - Pre-publish/publish success notices in Page settings auto-dismiss to keep panel feedback clean.
  - Saving blocks keeps editor in page edit mode (does not collapse back to Pages list).
- [ ] Implement live cache invalidation strategy.

## Phase G: Reliability + Operations

- [ ] Add audit logs for edit/publish events.
- [ ] Add analytics on AI usage and publish outcomes.
- [ ] Add rate limits and quotas per workspace.
- [ ] Add backup/export strategy for site content.
- [ ] Add monitoring/alerting for publish failures.

## Phase H: White-label + Template Expansion

- [ ] Add template registry and template picker UX.
- [ ] Add brand token manager (colors/fonts/logo) and validation.
- [ ] Add domain settings UI and verification flow.
- [ ] Add white-label controls (custom branding, footer policy).
- [ ] Add migration tooling for template/version upgrades.

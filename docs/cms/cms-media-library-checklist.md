# CMS Media Library Checklist

This checklist tracks the media-library foundation needed before AI copilot work.

## Scope

- Goal: Give non-technical users a reusable media workflow for headers, section content, and SEO OG images.
- Goal: Replace ad-hoc external URL entry with workspace-managed assets as the primary path.
- Goal: Keep asset handling secure, role-aware, and environment-safe (dev/stage/prod).
- Related docs:
  - `docs/cms/cms-implementation-checklist.md`
  - `docs/cms/cms-data-model.md`
  - `docs/cms/firebase-setup-and-rules.md`

## Decisions Locked (v1)

- Media is stored per workspace/site namespace in Firebase Storage.
- Media library is shared across a workspace; pages/headers reference media by stable asset record, not raw storage path.
- OG image supports:
  - selecting from media library
  - optional external URL fallback (validated)
- Public rendering uses resolved public URLs from stored asset metadata.
- No image editing pipeline in v1 (crop/resize/focal-point deferred).

## Phase 1: Data Model + Contracts

- [x] Define media asset model in CMS data contracts:
  - `id`
  - `workspaceId`
  - `siteId` (optional for shared/global scope decision)
  - `filename`
  - `contentType`
  - `sizeBytes`
  - `width`/`height` (when available)
  - `storagePath`
  - `publicUrl` (or signed URL strategy flag)
  - `alt`
  - `tags`
  - `createdBy`
  - `createdAt` / `updatedAt`
- [x] Define media reference contract for sections/header/SEO fields (asset id + resolved URL snapshot behavior).
- [x] Document allowed file types and max size limits for v1.
- [x] Document naming/path strategy per environment.

## Phase 2: Storage Security + Rules

- [x] Finalize Firebase Storage rules for workspace-scoped media access.
- [x] Ensure write access is RBAC-gated (`owner/admin/editor`) and read access matches runtime requirements.
- [x] Add server-side upload guards:
  - MIME allowlist
  - max file size
  - path sanitization
- [ ] Verify dev/stage/prod bucket behavior and rule parity.

## Phase 3: API + Service Layer

- [x] Add media repository/service functions in `src/lib/data` for:
  - create asset record
  - list assets (paged)
  - update metadata (`alt`, tags)
  - delete asset
- [x] Add upload initiation/finalization endpoints (or direct server upload endpoint for v1).
- [x] Add media list endpoint with filters (search/type/date).
- [x] Add asset delete endpoint with safe failure handling if referenced.
- [x] Add audit log events for upload/update/delete.

## Phase 4: CMS UX (Media Library)

- [x] Add `Media` entry to CMS main navigation.
- [x] Build media library panel in main content area:
  - upload trigger
  - asset grid/list toggle (optional; list-only acceptable for v1)
  - search/filter controls
  - pagination
- [x] Build asset detail/edit UX (`alt`, filename display, copy URL action if needed).
- [x] Build reusable `MediaPicker` modal/panel component for use across CMS forms.
- [x] Ensure clear loading, success, and danger-token error states.

## Phase 5: Integrations

- [x] Header editor:
  - logo source can be selected from media library.
- [x] Block props editor:
  - image/video-like fields can choose from media library (with manual URL fallback where needed).
- [x] Page SEO settings:
  - OG image can select from media library first, with validated external URL fallback.
- [x] Preview/live rendering:
  - selected assets render correctly in CMS preview and `/live/*`.

## Phase 6: Validation + Guardrails

- [x] Add reference validation for selected asset IDs.
- [x] Add graceful fallback for missing/deleted assets in preview/live renderers.
- [x] Add pre-publish checks for required media fields (where schema requires media).
- [x] Confirm block/schema validation messages are user-facing and actionable.

## Phase 7: QA + Acceptance

- [ ] Lint clean.
- [ ] Upload/list/select/delete flow verified across roles.
- [ ] Header logo + section media + OG image selection verified end-to-end.
- [ ] Runtime and preview rendering parity verified.
- [ ] Audit entries verified for media mutations.
- [ ] Update `docs/session-context.md` and `docs/cms/cms-implementation-checklist.md`.

## Optional Enhancements (Backlog)

- [ ] Bulk upload.
- [ ] Folder/collection organization.
- [ ] Image transforms (resize/crop/focal point).
- [ ] Replaced-asset versioning.
- [ ] Usage map: where an asset is referenced (headers/pages/sections).
- [ ] CDN optimization and cache-control tuning.

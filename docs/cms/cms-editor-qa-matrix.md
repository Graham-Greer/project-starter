# CMS Editor QA Matrix

This matrix documents the Phase 6 QA acceptance pass for editor UX.

## Scope

- Block Props Editor (Standard + Advanced)
- Optional field add/remove behavior
- API validation mapping to field-level UI
- Pre-publish failure guidance UX
- Publish/unpublish status workflow checks

## Evidence Summary

- Lint status: user-confirmed clean in latest session.
- Runtime confirmations (user-verified during this cycle):
  - Unpublish flow works.
  - API + inline validation flows functioning.
  - Add/cancel/edit section behavior improvements functioning.
- Code-level contract verification performed against:
  - `src/lib/registry/sections.registry.js`
  - `src/lib/registry/props.schemas.js`
  - `src/components/cms/EditorWorkspace/BlockPropsEditorPanel.jsx`
  - `src/hooks/cms/useCmsBlockActions.js`
  - `src/components/cms/PageSettingsPanel/PageSettingsPanel.jsx`

## Matrix Results

| Area | Check | Result | Notes |
|---|---|---|---|
| Variant coverage | Registry schemas mapped to guided presets | Pass | 22/22 variants represented in guided preset keys (including camelCase registry variants e.g. `mediaLeft`). |
| Standard mode | Required + length + URL-like inline validation | Pass | Implemented in `BlockPropsEditorPanel` via schema-driven validation map and field-level error rendering. |
| Standard mode | Hide internal ids | Pass | `id` fields filtered from Standard mode; list-item IDs auto-generated when adding object-array items. |
| Optional UX | Add optional fields | Pass | Optional fields shown via explicit add actions only. |
| Optional UX | Remove optional fields | Pass | Remove actions hide optional fields and clear underlying values. |
| Save flow | API validation errors mapped back to fields | Pass | Backend `validationErrors` parsed and mapped to `{ blockId -> fieldPath[] }`; rendered inline. |
| Advanced mode | JSON edit fallback intact | Pass | `Apply JSON`, `Format JSON`, `Reset to template`, read-only schema template all present. |
| Pre-publish UX | Failure summary with actionable fixes | Pass | Failed checks grouped with `Fix this` jump actions to relevant field/sections. |
| Publish workflow | Publish + republish status behavior | Pass | Existing checks retained; published pages track `hasUnpublishedChanges`. |
| Publish workflow | Unpublish action | Pass | `DELETE /publish` implemented and user-verified in runtime. |
| Composer flow | Add section -> editor focus | Pass | Add action scrolls to block editor. |
| Composer flow | New unsaved section cancel discard | Pass | Cancel removes unsaved new block; prevents orphan invalid sections. |
| Composer flow | Prevent multiple unsaved new sections | Pass | Add action blocked until current draft section is completed/cancelled. |

## Acceptance Decision

- Phase 6 acceptance criteria: **Pass**.
- Remaining roadmap work is outside editor UX Phase 6:
  - publish cache invalidation
  - media library foundation

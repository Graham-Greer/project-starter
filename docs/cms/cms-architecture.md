# CMS Architecture

## Architecture Summary

The system has three main runtimes:

1. Admin CMS
- Authenticated app for site configuration, page composition, AI drafting, preview, and publish.

2. Content Services Layer
- Server actions/APIs for validation, persistence, AI orchestration, and publish operations.

3. Live Site Runtime
- Public site that reads published content snapshots and renders approved section variants.

## High-Level Flow

1. User edits draft in CMS.
2. CMS writes draft data to Firebase (`draft` status).
3. Preview renderer resolves section registry and renders draft.
4. User publishes.
5. Publish service validates schema, creates immutable snapshot, marks as published.
6. Live site fetches published snapshot and renders pages.

## Core Components

## 1) Variant Registry

- Canonical map of allowed section types + variants + props schema references.
- Shared by CMS composer, preview renderer, AI planner, and live renderer.
- Prevents unknown component execution.

## 2) Composer Engine

- Page block list editor:
  - add section type
  - choose variant
  - edit variant props (schema-driven form)
  - reorder/remove blocks

## 3) Preview Renderer

- Renders page JSON from draft state using the same component mapping as production.
- Supports desktop/tablet/mobile preview and theme toggles.

## 4) AI Orchestrator

- Accepts structured prompt input:
  - site profile, tone, audience, goals, keywords, selected page/blocks.
- Returns structured output mapped to allowed section schemas.
- No direct write to published state.

## 5) Publish Pipeline

- Pre-publish checks:
  - schema validation
  - required SEO fields
  - section/variant existence in registry
- On success:
  - creates versioned snapshot
  - updates page/site publish pointers

## Security Boundaries

- Firebase Auth for identity.
- Workspace/site scoped RBAC for authorization.
- Writes to published state only through server-side publish endpoint.
- Client cannot bypass schema validation.
- Request identity is resolved from Firebase ID token (`Authorization: Bearer <token>` or `x-firebase-id-token`) via server utilities in `src/lib/auth`.
- Browser CMS sessions use automatic ID-token sync to `cms_session` httpOnly cookie via `/api/cms/auth/session`.
- Workspace authorization is enforced by server-side role checks before repository operations in `createSecureCmsDataServices`.

## Environment and Secrets Contract

- Runtime environment selection uses `CMS_FIREBASE_ENV` with allowed values: `dev`, `stage`, `prod`.
- Public web config is environment-scoped via `NEXT_PUBLIC_FIREBASE_*_{ENV}` keys.
- Server/admin credentials are environment-scoped via `FIREBASE_ADMIN_*_{ENV}` keys.
- Local key template is maintained in `.env.example`; actual values live in `.env.local` and must not be committed.
- Firebase access code must read through `src/lib/config/firebase-env.js` instead of direct `process.env` usage.

## Rendering Strategy

- Registry-driven rendering:
  - `sectionType + variant + props` -> component resolver
- Unknown section/variant => fail-safe fallback component + error log.

## Future Extensions

- Multi-template registry namespaces.
- Theme packs and white-label overrides.
- Domain management and deployment integrations.
- Billing/usage quotas for AI and workspace seats.

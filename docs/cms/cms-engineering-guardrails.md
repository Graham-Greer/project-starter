# CMS Engineering Guardrails

This document defines implementation guardrails for CMS development in the current single-project setup, while preserving easy migration to a monorepo split later.

## 1. Boundary Rules

- CMS-specific UI must live under CMS feature boundaries (for now, route/features structure; later package/app split).
- Public-site rendering logic must not import CMS editor-only modules.
- Shared modules (`registry`, `validation`, `data contracts`) must remain app-agnostic.

## 2. Shared Contract Rules

- Section rendering must be registry-driven (`sectionType + variant + props`).
- Props must validate against schema before draft save and before publish.
- Unknown variants must fail safely and log diagnostics.

## 3. Data Layer Rules

- All Firebase access goes through repositories/services in `src/lib/data`.
- No direct Firebase SDK calls from components, patterns, sections, or page files.
- Authz checks required for all write/publish operations.

## 4. AI Integration Rules

- AI output must conform to schema contracts before it can be applied.
- AI can propose changes; only user-approved changes can be persisted.
- AI cannot write published snapshots directly.

## 5. Publish Pipeline Rules

- Published content must be immutable snapshot data.
- Publish actions require validation gates and metadata (`publishedBy`, `publishedAt`).
- Rollback must switch to prior immutable snapshot, not mutate historical snapshot payload.

## 6. Monorepo Readiness Rules

- Avoid deep relative imports across domains; prefer stable barrel exports.
- Keep shared logic free from route/framework assumptions where practical.
- Do not import app-level pages/layouts inside shared library modules.
- New shared modules should be designed to move into `packages/*` without API change.

## 7. Testing and Verification Rules

- Add schema-validation tests for each new variant schema.
- Add repository tests/mocks for data access behavior.
- Add publish pipeline tests for validation failure and success paths.

## 8. Documentation Rules

Any contract change in CMS track must update:

- `docs/cms/cms-data-model.md`
- `docs/cms/cms-architecture.md`
- `docs/cms/cms-implementation-checklist.md`
- `docs/implementation-checklist.md` (if it affects shared core phases)

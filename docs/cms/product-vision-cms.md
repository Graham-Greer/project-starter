# Product Vision: CMS + Site Builder

## Purpose

Build a multi-tenant CMS product that enables internal teams and clients to launch branded websites quickly by composing approved section variants, assisted by AI, with controlled draft/publish workflows.

## Vision Statement

A user can sign in, choose a template, set brand inputs (logo, colors, voice), assemble pages from section variants, use AI to draft and iterate content, preview the result, and publish a production-ready site without engineering intervention.

## Target Users

- Agency operators managing multiple client sites.
- Client marketing teams managing their own site content.
- Internal content operators shipping landing pages frequently.

## Core Product Outcomes

- Time-to-first-publish under one hour for a basic site.
- Safe content operations via draft/review/publish.
- Consistent visual quality through constrained variant registry.
- AI acceleration without losing human editorial control.

## Product Pillars

1. Assembly over custom coding
- Users compose pages from reusable section variants only.

2. AI copilot, not autopilot
- AI drafts and suggests; humans edit and approve.

3. Predictable rendering
- Live site renders only validated, known section schemas.

4. Multi-tenant security by default
- Every resource scoped to workspace/site ownership and role.

5. Reversible publishing
- Version history, snapshots, and rollback support.

## MVP Scope

- Multi-tenant authentication and role-based access.
- Site creation with template selection (base template initially).
- Brand configuration (logo, colors, voice profile).
- Page composer with section/variant library + ordering controls.
- AI content generation and iterative rewrites at block/page level.
- Preview mode + publish pipeline + live consumption from Firebase.

## Non-Goals (Initial)

- Arbitrary custom React components in CMS.
- Unbounded WYSIWYG layouts without section constraints.
- Full enterprise workflow automation (advanced approvals, legal sign-off).

## Success Metrics

- Median time from site creation to first publish.
- Number of manual edits required after AI draft.
- Publish frequency per workspace.
- Rollback incidents and content quality defects.

## Related Docs

- `docs/cms/cms-architecture.md`
- `docs/cms/cms-data-model.md`
- `docs/cms/cms-ai-workflows.md`
- `docs/cms/cms-implementation-checklist.md`

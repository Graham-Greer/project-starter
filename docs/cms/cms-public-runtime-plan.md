# CMS Public Runtime Route Plan

This document defines Step 1 implementation for CMS-powered live rendering from published snapshots, without regressing existing static routes.

## Goal

- Serve public pages from published CMS snapshot data.
- Keep existing static marketing routes as fallback during rollout.
- Preserve no-regression behavior while introducing live runtime incrementally.

## Non-Goals (Step 1)

- No template marketplace behavior yet.
- No media-library picker behavior (separate phase).
- No AI integration changes (separate phase).

## Route Contract

Implement a dedicated CMS runtime namespace first to avoid collisions with existing static routes.

## Public Runtime (new)

- `GET /live/[siteSlug]`
- `GET /live/[siteSlug]/[[...slug]]`

Resolution rules:
- `[]` (no slug): resolve home page (`path === "/"` or empty slug entry).
- `[...slug]`: resolve page by normalized path (e.g. `["pricing"] -> "/pricing"`).

Behavior:
- Return rendered sections from published page version snapshot.
- If site/page/snapshot/version is missing, render `notFound()`.

## Metadata Contract

For the live runtime pages, implement `generateMetadata` from published snapshot SEO:

- `title` from `seo.metaTitle` fallback `page.title`
- `description` from `seo.metaDescription`
- `openGraph.images` + `twitter.images` from `seo.ogImageUrl` when present

## Data Resolver Shape

Add a server-only resolver utility in `src/lib/cms/live-runtime.js`.

Recommended interface:

```js
export async function resolvePublishedPageByPath({ siteSlug, path }) {
  return {
    site: { id, slug, workspaceId, templateId, theme, publishedSnapshotId },
    snapshot: { id, pages: [{ pageId, slug, versionId }], publishedAt, publishedBy },
    pageVersion: { id, pageId, version, snapshot: pageSnapshot },
    page: pageSnapshot, // normalized page payload used by renderer
  } | null;
}
```

Resolver steps:
1. Load site by `siteSlug` (new repository helper: `getSiteBySlug`).
2. Ensure `publishedSnapshotId` exists on site.
3. Load `siteSnapshots/{publishedSnapshotId}`.
4. Match requested normalized path to snapshot entry:
   - entry `slug` -> path mapping (`"" => "/"`, `"pricing" => "/pricing"`).
5. Load `pageVersions/{versionId}` from matched entry.
6. Return normalized page payload (`sectionType`, `variant`, `props`).

## Rendering Contract

In `src/app/live/[siteSlug]/[[...slug]]/page.jsx`:
- Resolve with `resolvePublishedPageByPath`.
- Render blocks with existing `renderSectionBlock`.
- Apply runtime theme bridge only if needed (based on snapshot/site theme fields).

## Caching Contract

Use cache tags for live fetches:
- site-level: `cms:site:{siteId}:published`
- page-level: `cms:site:{siteId}:page:{pageId}:published`
- path-level: `cms:site:{siteId}:path:{encodedPath}`

Publish/unpublish invalidation is already wired in `src/lib/cms/publish-cache.js` and `/api/cms/sites/[siteId]/pages/[pageId]/publish`.

## Rollout Strategy (No Regression Risk)

## Stage 1: Parallel Runtime (safe)

- Add `/live/[siteSlug]/[[...slug]]` only.
- Do not modify existing static routes (`/`, `/about`, `/services`, etc.).
- Validate end-to-end:
  - edit draft in CMS
  - publish
  - open `/live/{siteSlug}/...`
  - confirm published snapshot rendering + metadata.

## Stage 2: Optional Per-Site Switch

- Add site field: `runtimeMode: "static" | "cms-live"` (default `static`).
- Add CMS toggle in site settings (later).
- Keep production stable by controlling adoption per site.

## Stage 3: Root-Domain Adoption

- Only after Stage 1/2 hardening, consider routing primary domain paths through live resolver.
- Keep static fallback and feature flag until acceptance is complete.

## API/Repository Additions Required

1. `sites` repository:
- `getSiteBySlug(slug)`

2. live resolver utility:
- `resolvePublishedPageByPath({ siteSlug, path })`
- `normalizePublicPath(slugSegments)`

3. optional diagnostics:
- lightweight logging for unresolved site/snapshot/version mismatches.

## Acceptance Criteria

- Published CMS page is accessible via `/live/[siteSlug]/[[...slug]]`.
- Draft edits are not visible until publish.
- Unpublish removes page from live route resolution.
- SEO metadata reflects published snapshot fields.
- Existing static marketing routes remain unchanged.

## Follow-up (post Step 1)

- Wire media-library assets into live rendering paths.
- Add rollback action UI using existing snapshots/versions.
- Add monitoring for live resolver misses and publish propagation latency.

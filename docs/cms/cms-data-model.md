# CMS Data Model

This document defines the draft Firestore schema and the section/variant registry contract.

## Design Principles

- Multi-tenant first: every document includes `workspaceId` and `siteId` where relevant.
- Draft/publish separation: published content is immutable snapshot data.
- Schema-driven blocks: block payloads must match registry schemas.
- Auditable changes: versioning and metadata on write/publish actions.

## V1 Variant Scope Freeze (Step 1)

The CMS v1 block registry is frozen to the current production-ready section variants below.

- `hero`: `centered`, `split`
- `footer`: `simple`, `columns`
- `pricing`: `3-tier`, `enterprise`
- `testimonials`: `grid`, `spotlight`
- `faq`: `compact`, `detailed`
- `featureSplit`: `mediaLeft`, `mediaRight`
- `cta`: `centered`, `split`
- `team`: `grid`, `lead`
- `stats`: `row`, `cards`
- `featureComparison`: `compact`, `detailed`
- `footerCta`: `centered`, `split`

New section types/variants are deferred until after CMS v1 foundation and publish pipeline milestones, unless a critical blocker is identified.

## Firestore Collections

## `workspaces/{workspaceId}`

```json
{
  "name": "Acme Agency",
  "ownerUserId": "user_123",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## `workspaces/{workspaceId}/members/{userId}`

```json
{
  "role": "owner",
  "status": "active",
  "createdAt": "timestamp"
}
```

Roles: `owner | admin | editor | viewer`

## `sites/{siteId}`

```json
{
  "workspaceId": "ws_123",
  "name": "Acme Marketing Site",
  "slug": "acme-site",
  "status": "draft",
  "templateId": "base-template-v1",
  "themeId": "default-light-dark",
  "brand": {
    "logo": { "assetId": "asset_logo_1", "url": "..." },
    "colors": {
      "primary": "#4f46e5",
      "secondary": "#111827",
      "accent": "#ef4444"
    },
    "typography": {
      "headingFont": "Inter",
      "bodyFont": "Inter"
    },
    "voice": {
      "tone": "clear, confident, practical",
      "audience": "SMB founders"
    }
  },
  "domains": ["www.acme.com"],
  "publishedSnapshotId": "snap_2025_02_01_001",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## `sites/{siteId}/pages/{pageId}`

```json
{
  "workspaceId": "ws_123",
  "siteId": "site_123",
  "slug": "pricing",
  "title": "Pricing",
  "status": "draft",
  "seo": {
    "metaTitle": "Pricing | Acme",
    "metaDescription": "Plans and pricing for ...",
    "ogImage": "..."
  },
  "blocks": [
    {
      "id": "block_hero_01",
      "sectionType": "hero",
      "variant": "centered",
      "props": {
        "eyebrow": "Pricing",
        "title": "Simple plans",
        "description": "Choose your fit",
        "primaryAction": { "label": "Start", "href": "/contact" }
      }
    },
    {
      "id": "block_pricing_01",
      "sectionType": "pricing",
      "variant": "3-tier",
      "props": {
        "title": "Plans",
        "plans": []
      }
    }
  ],
  "draftVersion": 12,
  "updatedAt": "timestamp",
  "updatedBy": "user_123"
}
```

## `sites/{siteId}/pageVersions/{versionId}`

Immutable snapshot per page publish event.

```json
{
  "workspaceId": "ws_123",
  "siteId": "site_123",
  "pageId": "pricing",
  "version": 12,
  "sourceDraftVersion": 12,
  "snapshot": { "...": "full page payload at publish time" },
  "publishedAt": "timestamp",
  "publishedBy": "user_123"
}
```

## `sites/{siteId}/siteSnapshots/{snapshotId}`

Immutable full-site publish snapshot for rollback.

```json
{
  "workspaceId": "ws_123",
  "siteId": "site_123",
  "templateId": "base-template-v1",
  "theme": { "...": "resolved theme tokens" },
  "pages": [
    { "pageId": "home", "slug": "", "versionId": "ver_home_22" },
    { "pageId": "pricing", "slug": "pricing", "versionId": "ver_pricing_12" }
  ],
  "publishedAt": "timestamp",
  "publishedBy": "user_123"
}
```

## `assets/{assetId}`

```json
{
  "workspaceId": "ws_123",
  "siteId": "site_123",
  "kind": "image",
  "url": "https://...",
  "width": 1920,
  "height": 1080,
  "alt": "...",
  "createdAt": "timestamp"
}
```

## `aiRuns/{runId}`

```json
{
  "workspaceId": "ws_123",
  "siteId": "site_123",
  "pageId": "pricing",
  "mode": "block-rewrite",
  "status": "completed",
  "input": { "...": "prompt payload" },
  "output": { "...": "structured proposal" },
  "createdBy": "user_123",
  "createdAt": "timestamp"
}
```

## Section/Variant Registry Contract

Recommended file: `src/lib/registry/sections.registry.js`

```js
export const SECTIONS_REGISTRY = {
  hero: {
    label: "Hero",
    variants: {
      centered: {
        componentKey: "HeroCentered",
        propsSchema: "hero.centered.v1",
        thumbnail: "/registry/hero-centered.png",
        tags: ["top-of-page", "conversion"],
      },
      split: {
        componentKey: "HeroSplit",
        propsSchema: "hero.split.v1",
        thumbnail: "/registry/hero-split.png",
        tags: ["feature", "media"],
      },
    },
  },
  pricing: {
    label: "Pricing",
    variants: {
      "3-tier": {
        componentKey: "Pricing3Tier",
        propsSchema: "pricing.3-tier.v1",
        thumbnail: "/registry/pricing-3-tier.png",
        tags: ["plans", "comparison"],
      },
      enterprise: {
        componentKey: "PricingEnterprise",
        propsSchema: "pricing.enterprise.v1",
        thumbnail: "/registry/pricing-enterprise.png",
        tags: ["b2b", "sales-led"],
      },
    },
  },
};
```

## Props Schema Registry Contract

Recommended file: `src/lib/registry/props.schemas.js`

```js
export const PROPS_SCHEMAS = {
  "hero.centered.v1": {
    required: ["title"],
    fields: {
      eyebrow: { type: "string", maxLength: 80 },
      title: { type: "string", maxLength: 120 },
      description: { type: "string", maxLength: 240 },
      primaryAction: {
        type: "object",
        fields: {
          label: { type: "string", maxLength: 40 },
          href: { type: "string" },
        },
      },
    },
  },
};
```

## Validation Requirements

- Validate `sectionType` exists in `SECTIONS_REGISTRY`.
- Validate `variant` exists under `sectionType`.
- Validate `props` against `propsSchema` before draft save and publish.
- Reject unknown fields unless explicitly allowed for forward compatibility.

## Notes

- `site-pages.js` remains useful for local defaults and fixtures, but CMS-managed sites should render from Firestore snapshot data.
- Store generated thumbnails/assets in Cloud Storage and reference in registry metadata.

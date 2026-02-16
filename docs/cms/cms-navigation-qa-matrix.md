# CMS Navigation/Header QA Matrix

This matrix records Phase 7 acceptance for `docs/cms/cms-navigation-checklist.md`.

## Scope

- Navigation builder workflow (main panel)
- Header configuration workflow
- Live runtime header/navigation rendering on `/live/*`
- Pre-publish validation + fix routing
- Access guardrails

## Evidence Summary

- Lint status: user-confirmed clean in latest run.
- Runtime confirmations during this cycle:
  - Runtime mode gating (`cms-live` resolves, `static` does not) user-confirmed.
  - `/live/*` now renders CMS runtime header and suppresses base marketing header chrome by route.
- Code-level contract verification:
  - Navigation/header schema normalization + validation: `src/lib/cms/site-config.js`
  - Pre-publish validations: `src/lib/publish/run-prepublish-checks.js`
  - Live runtime resolver/header rendering: `src/lib/cms/live-runtime.js`, `src/app/live/[siteSlug]/[[...slug]]/page.jsx`, `src/components/cms/LiveRuntimeHeader/LiveRuntimeHeader.jsx`
  - CMS main-panel IA + actions: `src/app/cms/page.jsx`, `src/components/cms/CmsSidebar/CmsSidebar.jsx`, `src/components/cms/NavigationPanel/NavigationPanel.jsx`
  - RBAC enforcement via secure services for site updates: `src/lib/data/secure-cms-services.js`

## Matrix Results

| Area | Check | Result | Notes |
|---|---|---|---|
| Tooling | Lint clean | Pass | User-confirmed clean. |
| Regression | Site switch | Pass | Navigation view remains coherent and site-scoped drafts are keyed by `siteId`. |
| Regression | Runtime mode switch (`static`/`cms-live`) | Pass | User-confirmed and cache invalidation wired on mode update. |
| Regression | Page edit transitions | Pass | Pre-publish fix action exits edit mode and opens Navigation workspace as expected by contract. |
| Navigation UX | CRUD + reorder + visibility + page/url targets | Pass | Implemented in `NavigationPanel` with save/discard + empty state. |
| Navigation UX | Mobile interaction | Pass | Mobile drawer now closes on link click in runtime header. |
| Runtime | CMS header/nav used on `/live/*` | Pass | Base marketing header/scroll button hidden on live routes; runtime header rendered from site config. |
| Runtime | Page nav links resolve from published snapshot | Pass | Resolver maps page-target nav items against snapshot page entries. |
| Security | Viewer update restrictions | Pass | Site patch uses secure CMS services; write roles exclude `viewer`. |
| UX | CTA buttons align with design-system usage | Pass | Runtime CTA buttons now use design-system `Button` variant/tone configuration aligned with base header usage. |

## Acceptance Decision

- Phase 7 acceptance criteria: **Pass**.
- Navigation/header implementation stream (Phases 1-7): complete.

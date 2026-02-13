# Firebase Setup and Rules

This document is the source of truth for Firebase environment setup in this project.

## Environment Model

- `dev`: rapid iteration, authenticated access, relaxed Storage writes.
- `stage`: pre-production, production-like access controls.
- `prod`: strict production controls.

## Required Env Keys

Use `.env.example` as the template and set values in `.env.local`.

- `CMS_FIREBASE_ENV`
- `NEXT_PUBLIC_CMS_FIREBASE_ENV`
- `NEXT_PUBLIC_FIREBASE_*_{DEV|STAGE|PROD}`
- `FIREBASE_ADMIN_*_{DEV|STAGE|PROD}`

Important:
- Keep secrets only in `.env.local`.
- If `FIREBASE_ADMIN_PRIVATE_KEY_*` is one line, keep `\n` escaped; loader converts it to real newlines.

## Rules Files

- Firestore (all environments): `firebase/firestore.rules`
- Storage dev: `firebase/storage.dev.rules`
- Storage stage/prod: `firebase/storage.rules`

## Storage Path Contract

All CMS-managed uploads should use:

- `workspaces/{workspaceId}/sites/{siteId}/...`

Example:

- `workspaces/ws_123/sites/site_123/assets/logo.png`
- `workspaces/ws_123/sites/site_123/media/hero-video.mp4`

This path contract is required for rules-based authorization.

## Deploy Rules

Use Firebase CLI per project.

1. Authenticate once

```bash
firebase login
```

2. Deploy by environment config

Dev:

```bash
firebase deploy --project <dev-project-id> --config firebase/firebase.dev.json --only firestore:rules,storage
```

Stage:

```bash
firebase deploy --project <stage-project-id> --config firebase/firebase.stage.json --only firestore:rules,storage
```

Prod:

```bash
firebase deploy --project <prod-project-id> --config firebase/firebase.prod.json --only firestore:rules,storage
```

## Notes on Server Access

- Server-side `firebase-admin` bypasses Firestore and Storage client rules by design.
- Enforce RBAC in server actions/repositories before write/publish operations.
- Client SDK reads/writes (if used in CMS UI) must comply with rules above.

## Verification Checklist

1. Authenticated user with `viewer` role can read site/page docs and assets.
2. `viewer` cannot write pages/assets.
3. `editor` can write draft pages and upload allowed file types.
4. Uploads outside `workspaces/{workspaceId}/sites/{siteId}` are denied.
5. `pageVersions` and `siteSnapshots` writes are blocked from client.

## API Verification Endpoints

The project includes server endpoints to validate environment/auth/access flow:

- `GET /api/cms/health`
  - Returns selected Firebase environment and missing env keys.
- `GET /api/cms/auth/me`
  - Resolves current user from Firebase ID token.
- `POST /api/cms/workspaces/bootstrap`
  - Creates workspace and auto-creates owner membership for the authenticated user.
  - Body: `{ "workspaceId": "ws_demo", "name": "Demo Workspace" }`
- `GET /api/cms/workspaces/{workspaceId}/access`
  - Returns workspace membership for current user if role is valid.

## CMS Sign-In Flow (No Manual Headers)

- Open `/cms/sign-in`.
- Use email/password sign-in.
- Client Firebase auth state syncs ID token to server via `POST /api/cms/auth/session`.
- Server stores `cms_session` httpOnly cookie.
- CMS API routes resolve identity from `Authorization` header or `cms_session` cookie.
- Manual `Authorization` headers are no longer required for normal in-browser CMS usage.

Current dev validation status:
- Verified working: sign-in at `/cms/sign-in`, redirect to `/cms`, bootstrap endpoint, workspace access endpoint.

Example bootstrap request:

```bash
curl -X POST http://localhost:3000/api/cms/workspaces/bootstrap \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase-id-token>" \
  -d '{"workspaceId":"ws_demo","name":"Demo Workspace"}'
```

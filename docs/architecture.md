# Work Shell architecture

## Platform model

Work Shell is an application shell, not a data consolidation project. It owns shared navigation, workspace context, application discovery and cross-app utilities. Each feature module owns its domain-specific UI and calls its existing backend through an adapter.

PORTAL is the platform control plane: identity, sessions, app registry, permissions, app settings and audit administration. It is not a business-data application.

## Existing systems

| Module | Existing API | Data store | Identity transition |
|---|---|---|---|
| TRUCK | Elysia on Cloudflare Worker: `truck-api-cf.fall3n.workers.dev` | Supabase PostgreSQL | Clerk → PORTAL Custom OIDC |
| DATA LEDGER | Elysia on Cloudflare Worker: `data-api.fall3n.workers.dev` | Cloudflare D1 + R2 | Clerk → PORTAL-issued app token |
| PORTAL / Identity Center | Existing Svelte 5 app at `me.mcky.space` | New dedicated D1: `mcky-identity` | Becomes first-party identity provider |

## Deployment

- Cloudflare Pages project: `work-shell`
- Production URL: `https://work.mcky.space`
- Git source: `ktypez/work-shell`, production branch `main`
- Build: `npm install --no-audit --no-fund && npm run build`; output `dist`
- `SKIP_DEPENDENCY_INSTALL=1` avoids the Pages build image auto-install path; the explicit install command is used.

## API routing

- `/api/truck-health` → TRUCK Worker `/health`
- `/api/truck/*` → TRUCK Worker `/api/*`
- `/api/data/*` → DATA Worker `/api/*`

Vite provides a development-only fetch proxy. Cloudflare Pages Functions provide a same-origin production API proxy with a fixed upstream allowlist; only `/api/*` invokes Functions, while static assets remain edge-served. `vercel.json` remains an optional alternate deployment rewrite. Browser code must never contain service-role or backend secrets.

## Authentication

PORTAL at `https://me.mcky.space` is being elevated into the platform identity provider and administration center. Work Shell redirects users to the central Portal sign-in with `from=work`; it does not embed Clerk.

The target issuer is `https://me.mcky.space`, with OIDC discovery and JWKS endpoints, asymmetric JWT signing, short-lived access tokens, and rotating opaque refresh sessions in Secure HttpOnly cookies. LINE Login v2.1 is integrated directly by PORTAL. See [identity-architecture.md](./identity-architecture.md).

## Stable identity compatibility

TRUCK migration 010 stores `clerk_user_id` as text and its RLS policies compare it with `auth.jwt() ->> 'sub'`; migration 020 centralizes that lookup in `public.clerk_sub()`. PORTAL will preserve existing Clerk `user_...` identifiers as immutable subjects. Supabase's Custom OIDC provider support allows it to trust PORTAL's asymmetric issuer without rewriting existing TRUCK row ownership. During migration, both issuers remain trusted; Clerk is removed only after every app has moved.

## Current live integration

- TRUCK `/health` responds with `{ ok: true }`.
- DATA `/api/ping` responds with `{ ok: true }`.
- DATA `/api/clients/count` currently reports 558 records.
- DATA `/api/clients/list` and `/api/clients/search` supply the prototype catalog.

The client count and catalog are read-only prototype integrations. Mutations remain disabled until PORTAL session forwarding and each API's existing authorization rules are implemented.

## Identity database

A dedicated Cloudflare D1 database named `mcky-identity` has been created in APAC. It is separate from TRUCK Supabase/Postgres and DATA LEDGER D1/R2. Its schema, migrations and Portal Pages binding are pending.

## Design system

Work Shell consumes the opt-in MCKY UI V6 foundation from PR #16. V5 remains unchanged for existing applications. The initial V6 palette and typography follow the supplied Attendance Terminal design reference.
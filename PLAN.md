# Work Shell implementation plan

Project: Work Shell  
Domain: work.mcky.space  
Repository: ktypez/work-shell  
Status: Prototype foundation built; GitHub source publication pending

## Phase 0 — Foundation
- [x] Create a new Svelte 5 + Vite application.
- [x] Establish Global Shell, app switcher, responsive navigation and workspace frames.
- [x] Create TRUCK and DATA LEDGER modules.
- [x] Move PORTAL into the Platform section as Identity & Access Center.
- [x] Add V6 design tokens through the new mcky-ui package entry.
- [x] Remove the Clerk browser SDK dependency from Work Shell.
- [x] Add same-origin API proxy routes for local development and Vercel.
- [x] Verify TRUCK API health and DATA API ping.
- [x] Verify existing DATA API connectivity in an isolated test.
- [x] Restrict the public Work Shell proxy to health/ping only; keep business data hidden until Portal authorization is ready.
- [x] Create the GitHub repository `ktypez/work-shell`.
- [x] Push prototype source and documentation to GitHub.
- [x] Merge mcky-ui V6 foundation PR #16.
- [x] Create Cloudflare Pages project `work-shell` connected to GitHub `ktypez/work-shell`.
- [x] Add `work.mcky.space` custom domain and verify DNS.
- [x] Verify first Cloudflare Pages deployment and same-origin API proxy (TRUCK health, DATA ping and live client count).

## Phase 1 — PORTAL Identity Core
- [x] Decide to elevate PORTAL into the platform identity and administration service.
- [x] Design stable-subject migration to preserve existing Clerk `user_...` IDs used by TRUCK RLS.
- [x] Design direct LINE Login v2.1 with state, nonce and PKCE; preserve link-only behavior.
- [x] Design Custom OIDC discovery/JWKS integration for Supabase.
- [x] Create dedicated production D1 `mcky-identity` and isolated preview D1 `mcky-identity-preview` in APAC.
- [x] Apply identity schema migrations 0001 and 0002 to both databases.
- [x] Bind `IDENTITY_DB` to Portal Pages preview and production environments.
- [x] Add D1 binding and signing-key readiness foundation to Portal Pages Functions (PR #6 merged).
- [ ] Provision ES256 key pair in Cloudflare Pages secrets and D1 to activate `/api/identity/ready`.
- [ ] Implement OIDC discovery (`/.well-known/openid-configuration`) and JWKS (`/.well-known/jwks.json`).
- [ ] Implement password reset/re-enrollment and session rotation/revocation.
- [ ] Implement direct LINE link, login and explicit profile sync.
- [ ] Import existing Clerk users and app grants; preserve stable subjects.
- [ ] Establish new platform credentials through a verified migration bridge or reset flow.

## Phase 2 — Authorization and administration
- [ ] Register the Portal Custom OIDC issuer in the Truck Supabase project.
- [ ] Add restrictive RLS issuer checks; temporarily allow both Clerk and Portal.
- [ ] Verify existing TRUCK historical records and RLS under Portal-issued JWTs.
- [ ] Implement platform owner/admin, app admin and member roles.
- [ ] Migrate Clerk `private_metadata.apps` grants into `app_permissions`.
- [ ] Build account and linked identity administration.
- [ ] Build per-user/per-app permission management.
- [ ] Build app registry and per-app settings.
- [ ] Build audit log and session revocation views.
- [ ] Keep secrets in Cloudflare secrets, not D1 app settings.

## Phase 3 — Application migration
- [ ] Update TRUCK Worker token validation to trust Portal tokens and enforce audience/app permissions.
- [ ] Keep legacy Clerk validation during the transition.
- [ ] Update TRUCK Supabase client to request Portal-issued Custom OIDC tokens.
- [ ] Update DATA API token validation and app permission enforcement.
- [ ] Preserve TRUCK Supabase/PostgreSQL and DATA LEDGER D1/R2 as source-of-truth stores.
- [ ] Verify offline sync and idempotency behavior.
- [ ] Migrate remaining apps (Paper, Dept and future apps) through the app registry.

## Phase 4 — DATA LEDGER module
- [ ] Authenticated client list and search after Portal token integration.
- [ ] Record detail view.
- [ ] Create/edit/delete workflows using existing API contracts.
- [ ] Map, media, trash and offline behavior.

## Phase 5 — Production hardening and cutover
- [ ] Keyboard accessibility and focus management.
- [ ] Loading, empty, error, offline and permission states.
- [ ] Mobile and desktop responsive QA.
- [ ] Performance and bundle-size review.
- [ ] PWA strategy and service-worker scope.
- [ ] End-to-end tests for each application module.
- [ ] Migrate every client and revoke legacy Clerk sessions.
- [ ] Remove Clerk issuer from Supabase/API trust lists after rollback window.
- [ ] Remove Clerk SDK, secret configuration and legacy bridge only after cutover checks.
- [ ] Configure production deployment and domain verification.
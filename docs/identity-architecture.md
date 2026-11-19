# Platform Identity Architecture

Status: approved direction / implementation design  
Identity UI: `https://me.mcky.space` (existing PORTAL)  
OIDC issuer: `https://me.mcky.space`  
Identity database: Cloudflare D1 `mcky-identity` (created in APAC; schema pending)

## 1. Product boundary

PORTAL becomes the platform identity and administration service, not another business application.

It owns:
- Account lifecycle, credentials, sessions, recovery and profile
- LINE Login and linked external identities
- Platform roles and per-application permissions
- Application registry and non-secret per-app settings
- Audit events and administrative operations
- OIDC discovery, JWKS and short-lived app/Supabase access tokens

Work Shell owns the shared navigation and workspace UI. TRUCK, DATA LEDGER, and future apps retain their own business logic, APIs and data stores.

## 2. Preserve existing account identifiers

Keep each existing Clerk user ID (for example, `user_...`) as the immutable platform subject during migration.

This is deliberate: TRUCK's migration 010 stores `clerk_user_id` as text and its RLS policies compare it to `auth.jwt() ->> 'sub'`. Migration 020 centralizes this lookup in `public.clerk_sub()`. Keeping the same subject avoids rewriting every historical row and ownership relationship.

New accounts may use a generated opaque subject, but it must be a string and must never be reused.

## 3. Identity database

A dedicated D1 database named `mcky-identity` was created in APAC. It is separate from the DATA LEDGER D1, TRUCK Supabase/Postgres database, and other application databases.

Proposed tables:

| Table | Purpose |
|---|---|
| `users` | Stable subject, normalized email/username, password hash, display name, avatar, status, timestamps |
| `identities` | Provider + provider subject, LINE profile, link state, encrypted LINE refresh token and scopes |
| `sessions` | Hashed opaque refresh tokens, session family, expiry, rotation and revocation |
| `applications` | App ID, display name, base URL, enabled state, allowed redirect origins and scopes |
| `roles` | Platform or app-scoped roles |
| `user_roles` | Role assignments and grantor |
| `app_permissions` | Explicit user-to-app permission grants |
| `app_settings` | Non-secret per-app configuration |
| `oauth_transactions` | Short-lived LINE state, nonce, PKCE verifier, login/link intent and safe return URL |
| `audit_logs` | Sign-in, link/sync, permission, settings and admin events |

Secrets (LINE channel secret, JWT private signing key, token encryption key, password reset signing key) must be Cloudflare Worker/Pages secrets. Never store plaintext secrets in D1 or return them to the admin UI. LINE refresh tokens must be encrypted at rest before storage.

## 4. Authentication and tokens

Issuer: `https://me.mcky.space`

Required OIDC endpoints:
- `/.well-known/openid-configuration`
- `/.well-known/jwks.json`

Use asymmetric JWT signing (ES256 or RS256) with a `kid`; never HS256 for Supabase third-party OIDC. Access tokens are short-lived and carry:
- `iss`: `https://me.mcky.space`
- `sub`: stable platform subject (preserve legacy Clerk IDs)
- `aud`: the intended app / Supabase audience
- `role`: `authenticated` for Supabase requests
- `iat`, `exp`, `jti`
- app/client context and authorization version where required

Use a random opaque refresh token in a Secure, HttpOnly, SameSite=Lax cookie, store only its hash, rotate on use, detect reuse, and support per-session revocation. Do not put refresh tokens in localStorage.

For app APIs, validate signature, issuer, audience, expiry, subject, and app permission server-side. A signed-in session alone must not imply access to every app.

### Supabase compatibility

Supabase now supports Custom OIDC third-party authentication. The identity issuer must expose HTTPS discovery and asymmetric JWKS, and JWTs must contain `role: authenticated`.

TRUCK already reads the subject as text rather than casting it to UUID, so preserving the legacy subject allows the new issuer to retain row ownership. Register the new issuer as a Custom OIDC provider in the Truck Supabase project. Add restrictive issuer checks to RLS policies: during migration allow both the legacy Clerk issuer and the new Portal issuer; after all clients move, remove the Clerk issuer. Keep using `auth.jwt() ->> 'sub'` / `public.clerk_sub()`; do not switch to `auth.uid()` for `user_...` subjects.

DATA LEDGER's current API and D1/R2 remain its source of truth. Its API must independently validate the new Portal access token and app permission before protected operations.

## 5. LINE Login and account linking

Use LINE Login v2.1 directly:
1. Create a random `state`, `nonce`, and PKCE verifier/challenge (S256).
2. Redirect to LINE's authorization endpoint with `profile openid`; request `email` only if the LINE channel has the required permission approved and the user consents.
3. Exchange the authorization code server-side.
4. Validate the ID token (issuer, audience/channel ID, expiry, nonce and signature/LINE verification endpoint).
5. Resolve the LINE subject to an existing `identities` record.

Preserve the current link-only behavior:
- LINE login cannot silently create a second account.
- A user links LINE only while authenticated to the existing platform account.
- Never auto-link accounts solely because email addresses match.
- After linking, future LINE login resolves to the same platform user.
- "Sync from LINE" remains an explicit user action and updates selected profile fields (display name/avatar; email only when LINE grants it and it is verified).
- Record link and sync events in `audit_logs`.

LINE refresh tokens, if retained for later sync, are encrypted with a key stored as a platform secret. If token refresh is unavailable or revoked, ask the user to reconnect LINE.

## 6. Authorization and administration

Roles:
- `platform_owner`: bootstrap owner; cannot be granted through ordinary UI.
- `platform_admin`: platform-wide user, app registry and policy administration.
- `app_admin`: administration limited to one app.
- `member`: normal user with explicit app grants.

Admin pages:
1. Accounts & identities — account status, profile, linked LINE, sessions, recovery.
2. App permissions — grant/revoke app access and assign app roles.
3. App settings — app registry, redirect allowlist, feature flags and non-secret settings.
4. Audit logs — filter by actor, app, action and time.
5. Sessions & security — revoke sessions, review recent sign-ins and link changes.

Do not use a hard-coded email comparison as the long-term admin check. Bootstrap the initial owner through a one-time controlled migration/secret and persist the owner role in D1. Every privileged mutation must be authorized server-side and audited.

Secret values must not be stored in `app_settings`; use Cloudflare secrets or a dedicated secret store and expose only whether a secret is configured.

## 7. Migration strategy — no big-bang cutover

1. **Foundation:** create D1 schema and migrations; add D1 binding to the existing Portal Pages Functions project; implement OIDC discovery/JWKS and health checks.
2. **Account import:** import existing Clerk users and app grants server-side. Preserve each Clerk user ID as the platform subject. Do not copy password hashes. Use a one-time verified Clerk-session bridge or password reset/re-enrollment to establish a new password.
3. **LINE:** allow authenticated users to link LINE directly to the new identity. Keep current LINE link-only policy. Users reconnect LINE if existing provider tokens cannot be safely transferred.
4. **Dual issuer:** register Portal as Custom OIDC in Supabase. Keep Clerk and Portal issuers accepted during the controlled transition. Test the same user against existing TRUCK RLS and historical rows.
5. **API migration:** update TRUCK Worker and DATA API to verify Portal tokens, app audience and permissions. Keep legacy Clerk validation only during the transition.
6. **App administration:** move the existing Clerk `private_metadata.apps` grants to `app_permissions`; implement app settings and audit pages.
7. **Cutover:** migrate every client, revoke legacy sessions, remove Clerk issuer from Supabase/API allowlists, then remove Clerk SDK and secret configuration. Do not disable Clerk before the rollback window closes.

## 8. Non-goals

- Do not merge application databases.
- Do not migrate TRUCK or DATA LEDGER business records into PORTAL.
- Do not grant app access just because a user can sign in.
- Do not expose service-role keys, LINE secrets, JWT private keys, refresh tokens or password hashes to browser code.
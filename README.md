# Work Shell

Work Shell is the new MCKY application platform at `work.mcky.space`.

## Product boundary

- Work Shell owns the shared shell, workspace navigation, app discovery and cross-app experience.
- Each app keeps its own UI logic, API, database and business rules.
- PORTAL at `me.mcky.space` is being elevated into the platform Identity & Administration Center.
- Work Shell does not embed Clerk. The platform identity migration is designed around PORTAL-issued OIDC tokens.
- Existing TRUCK and DATA LEDGER data stores remain authoritative and separate.

## Current integrations

- TRUCK: existing Elysia API on Cloudflare Workers, backed by Supabase/PostgreSQL.
- DATA LEDGER: existing Elysia API on Cloudflare Workers, backed by Cloudflare D1 and R2.
- PORTAL: existing Svelte 5 app at `me.mcky.space`; identity migration is in design/implementation phases.
- MCKY UI V6: opt-in Work Shell foundation from `@mcky/ui/v6.css`. V5 remains unchanged.

## Stack

- Svelte 5 + Vite + TypeScript
- `@mcky/ui` V6 foundation
- Cloudflare Pages / Workers API adapters
- Dedicated Cloudflare D1 identity database (created; schema and binding pending)

## Development

```sh
npm install
npm run dev
npm run check
npm run build
```

## Documentation

- [Platform architecture](./docs/architecture.md)
- [Identity architecture and migration plan](./docs/identity-architecture.md)
- [Implementation checklist](./PLAN.md)

## Security

Never expose service-role credentials, API secrets, LINE channel secrets, JWT private keys, password hashes or refresh tokens in browser code. App permissions must be enforced by each backend, not only by hiding navigation items in the UI.
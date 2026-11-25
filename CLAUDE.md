# Homebet

Leé y seguí [AGENTS.md](./AGENTS.md). Ese archivo es el manual del proyecto para Claude y Codex.

Reglas que no se negocian:

- Un solo proyecto Vercel y un solo Supabase de plataforma. No conectes Supabase hasta que se pida: el esqueleto usa `apps/web/lib/fixtures.ts`.
- El host decide la superficie. La regla está en `apps/web/lib/tenant.ts` y se aplica en `apps/web/proxy.ts`.
- Los juegos son catálogo de Home (`public.games`). `packages/proveedores` los construye y los publica ahí.
- No abras un segundo Supabase para el proveedor ni copies juegos dentro de cada casa.
- El cliente no escribe `ledger_entries` ni `game_rounds`. La service role no va al browser.
- Antes de usar una API de Next, leé `apps/web/node_modules/next/dist/docs/`. Esta versión no es la de tu entrenamiento. El archivo de borde se llama `proxy.ts`, no `middleware.ts`.

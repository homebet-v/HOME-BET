# Homebet

Manual del proyecto. Claude y Codex siguen este archivo. El detalle de Next.js 16 está en `apps/web/AGENTS.md` y en `apps/web/node_modules/next/dist/docs/`. Esta versión de Next no es la de los datos de entrenamiento: leé esa docs antes de usar una API.

## Qué es

Homebet es la casa padre. Desde Home se crean casas hijas (`bet1`, `bet2`, `bet3`). Cada hija tiene un panel de administrador y una casa donde entran los jugadores.

Un solo deploy sirve a todas las casas. Crear una casa es una fila en Supabase, no un proyecto nuevo.

## Stack

- TypeScript en todo el código.
- Next.js 16 (App Router) y React. Tailwind para la UI. shadcn/ui cuando haya pantallas reales.
- Supabase: Postgres, Auth, Realtime y Storage. Un solo proyecto.
- Vercel: un proyecto, dominio raíz más `*.dominio`. Runtime Node (Fluid Compute). El borde de la app es `apps/web/proxy.ts`. No existe `middleware.ts`.
- npm workspaces. La app es `@homebet/web`. El taller de juegos es `@homebet/proveedores`.

No uses Vite como app de la plataforma. No agregues Rust en esta etapa.

## Superficies

El host decide la superficie. Un comodín `*.dominio` cubre un solo nivel, así que el panel del hijo no va en `admin.bet1.dominio`.

| Quién | Host de producción | Host local |
|---|---|---|
| Home, el padre | `home.dominio` y el ápice | `http://localhost:3000` y `http://home.localhost:3000` |
| Admin de una casa | `bet1-admin.dominio` | `http://bet1-admin.localhost:3000` |
| Jugadores | `bet1.dominio` | `http://bet1.localhost:3000` |

La única función que interpreta el host es `resolveHost` en `apps/web/lib/tenant.ts`. El proxy reescribe por dentro a `/s/home`, `/s/admin/{slug}` y `/s/casa/{slug}`. Esas rutas no se enlazan ni se visitan a mano: si alguien pide `/s/...`, el proxy lo manda a `/` y el host vuelve a decidir.

Reservados, no son una casa: `home`, `www`, `api`, `app`, `localhost`.

## Dónde va el código

```text
AGENTS.md                         este manual
CLAUDE.md                         apunta acá
apps/web/                         Next.js: Home, admin hijo, casa
  proxy.ts                        host → superficie
  lib/tenant.ts                   regla de host, con tests
  lib/fixtures.ts                 datos de muestra, hasta conectar Supabase
  app/s/home/                     /  /casas  /dominios  /juegos  /catalogo
  app/s/admin/[slug]/             /  /juegos  /jugadores  /dominio
  app/s/casa/[slug]/              /  /juegos  /cuenta
packages/proveedores/             taller de juegos, sin base propia
supabase/migrations/              esquema y RLS de la plataforma
```

Las pantallas son rutas concretas. Un path sin página responde 404.

Hasta que se pida conectar Supabase, la UI lee `apps/web/lib/fixtures.ts`. No instales el cliente, no leas las claves y no apliques migraciones. Los formularios se pueden completar y no guardan nada.

La UI habla español. Los identificadores del código van en inglés.

El panel Home tiene dos fábricas en la misma navegación. Casinos: `/casas` y `/dominios`. Juegos: `/juegos` es el taller (`packages/proveedores`) y `/catalogo` es donde viven los publicados. No mezcles el alta de un casino con el taller de un juego.

## Juegos

Los juegos viven en Home, en el mismo Supabase de la plataforma.

- `public.games` y `public.game_versions` son el catálogo. Los escribe Home.
- `public.casino_games` dice qué casa tiene qué juego publicado, activo o no.
- `public.game_rounds` es la partida. Siempre lleva `casino_id`.
- `packages/proveedores` es el taller. Ahí se construye el juego. Publicar escribe en el catálogo. El paquete no abre una base de datos.

No copies el juego dentro de cada casa. No pongas un segundo Supabase en el camino de la apuesta: el débito y la ronda tienen que quedar en la misma base. Un Supabase aparte, solo para borradores del estudio que el jugador nunca lee, se discute el día que el taller sea otro equipo. No se crea ahora.

## Dinero y permisos

El saldo no es una columna que se pisa. La verdad es `public.ledger_entries` (`amount_cents` distinto de cero: apuesta, premio, ajuste).

El navegador no escribe `ledger_entries` ni `game_rounds`. Eso lo hace el servidor con la service role. Esa clave no lleva prefijo `NEXT_PUBLIC` y no entra a un Client Component.

Roles en `public.profiles`:

- `superadmin`: `casino_id` nulo. Ve y opera todas las casas. Entra por Home.
- `casino_admin`: una casa. Entra por `{slug}-admin`. No lee otra casa.
- `player`: una casa. Entra solo por el host de esa casa.

Toda tabla nueva de datos de una casa lleva `casino_id` y RLS. El aislamiento entre bet1 y bet2 es RLS, no esconder un botón.

`cacheComponents` está activo. `cookies()`, `headers()`, `params` y la sesión van en tiempo de request, detrás de `<Suspense>`. No des por autorizada una página solo porque el proxy reescribió la ruta: la comprobación de rol vive en el servidor, en cada lectura de datos.

## Cómo correr

```bash
npm install
npm test
npm run dev
```

Variables en `apps/web/.env.local` (plantilla en `apps/web/.env.example`):

- `NEXT_PUBLIC_ROOT_DOMAIN` — `localhost` en local. En producción, el dominio raíz, sin protocolo.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` — cliente.
- `SUPABASE_SERVICE_ROLE_KEY` — solo servidor.

Las migraciones viven en `supabase/migrations`. No se aplican solas desde este repo hasta que el proyecto Supabase esté enlazado.

## Qué no hacer

- No conectar Supabase hasta que se pida. El esqueleto usa `lib/fixtures.ts`.
- No crear un proyecto Vercel por casa, ni un Supabase por casa.
- No resolver la casa en el cliente.
- No poner lógica de un juego en `app/s/casa`. El portal pide el catálogo; el juego se publica desde `packages/proveedores`.
- No confiar en un rol enviado por el navegador.
- No reintroducir `middleware.ts`.
- No apagar RLS para “hacer que funcione”.

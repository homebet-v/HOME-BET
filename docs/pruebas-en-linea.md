# Pruebas en línea de Homebet

## Vercel y dominios

1. Importá el repositorio en un único proyecto de Vercel. Elegí **Next.js** como preset y **`apps/web`** como Root Directory. Activá **Include source files outside of the Root Directory in the Build Step** para que Vercel incluya el workspace `packages/proveedores`. Dejá los comandos de instalación y build en automático y seleccioná Node.js 22.x, la versión usada en la prueba local.
2. En las variables del entorno que sirve los dominios de prueba, agregá `NEXT_PUBLIC_ROOT_DOMAIN` con el dominio raíz, sin protocolo ni puerto. Por ejemplo, `ejemplo.com`. Volvé a desplegar después de cambiarlo, porque Next.js incorpora las variables públicas al build.
3. En **Settings → Domains**, agregá `ejemplo.com` y `*.ejemplo.com` al mismo proyecto. Para el wildcard, configurá los nameservers que indica Vercel. Si el dominio ya tiene correo u otros servicios, trasladá sus registros DNS antes de cambiar los nameservers.
4. Cuando Vercel confirme DNS y HTTPS, ejecutá `bash scripts/check-staging.sh ejemplo.com` desde la raíz. La prueba usa `curl` y `rg`. Verifica el ápice, Home, los paneles y las casas de Krakenbet y Kairobet, la redirección de una ruta interna y una ruta inexistente. Para probar el mismo enrutamiento en local, iniciá la app con `npm run dev` y pasá `localhost` como dominio.

Los hosts de prueba son `home.ejemplo.com`, `krakenbet.ejemplo.com`, `krakenbet-admin.ejemplo.com`, `kairobet.ejemplo.com` y `kairobet-admin.ejemplo.com`. El comodín cubre todos esos nombres. La URL de Vercel compartida para la prueba abre Home en los despliegues que incluyan este cambio. Las URLs nuevas que Vercel facilite mediante `VERCEL_URL` o `VERCEL_PROJECT_PRODUCTION_URL` también abren Home si terminan en `.vercel.app`. Usá el dominio propio para probar las casas y sus paneles.

Las pantallas, usuarios, fichas y operaciones de esta etapa usan datos de demostración. Usá solamente datos ficticios durante la prueba, incluidos los formularios de cuenta y de cargas.

[Vercel y monorepos](https://vercel.com/docs/monorepos/monorepo-faq) · [Dominios y wildcard](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

## Supabase

Usá un solo proyecto Supabase de prueba para todas las casas. Desde la raíz, con la CLI autenticada y el ID del proyecto de prueba, revisá las migraciones pendientes antes de aplicarlas.

```bash
supabase link --project-ref <id-del-proyecto>
supabase db push --dry-run --remote
supabase db push --remote
```

Las migraciones crean el esquema y las políticas RLS y declaran explícitamente los permisos de la Data API. El deploy de Vercel puede probarse antes de configurar credenciales. Para que la app use la base, todavía hace falta integrar Auth y las lecturas con sesión y validar el aislamiento entre dos casas. La primera prueba de dominios verifica el enrutamiento HTTP.

[Flujo de migraciones de Supabase](https://supabase.com/docs/guides/local-development/cli-workflows) · [Permisos de la Data API](https://supabase.com/docs/guides/api/securing-your-api)

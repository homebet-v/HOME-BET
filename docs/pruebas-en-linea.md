# Pruebas en línea de Homebet

## Vercel y dominios

1. Importá el repositorio en un único proyecto de Vercel. Elegí **Next.js** como preset y **`apps/web`** como Root Directory. Activá **Include source files outside of the Root Directory in the Build Step** para que Vercel incluya el workspace `packages/proveedores`. Dejá los comandos de instalación y build en automático y seleccioná Node.js 22.x, la versión usada en la prueba local.
2. En las variables del entorno que sirve los dominios de prueba, agregá `NEXT_PUBLIC_ROOT_DOMAIN` con el dominio raíz, sin protocolo ni puerto. Por ejemplo, `ejemplo.com`. Volvé a desplegar después de cambiarlo, porque Next.js incorpora las variables públicas al build.
3. En **Settings → Domains**, agregá `ejemplo.com` y `*.ejemplo.com` al mismo proyecto. Para el wildcard, configurá los nameservers que indica Vercel. Si el dominio ya tiene correo u otros servicios, trasladá sus registros DNS antes de cambiar los nameservers.
4. Cuando Vercel confirme DNS y HTTPS, después de crear Krakenbet y Kairobet en Supabase, ejecutá `bash scripts/check-staging.sh ejemplo.com` desde la raíz. La prueba usa `curl` y `rg`. Verifica el ápice, Home, los paneles y las casas de Krakenbet y Kairobet, la redirección de una ruta interna y una ruta inexistente. Para probar el mismo enrutamiento en local, iniciá la app con `npm run dev` y pasá `localhost` como dominio.

Los hosts de prueba son `home.ejemplo.com`, `krakenbet.ejemplo.com`, `krakenbet-admin.ejemplo.com`, `kairobet.ejemplo.com` y `kairobet-admin.ejemplo.com`. El comodín cubre todos esos nombres. La URL de Vercel compartida para la prueba abre Home en los despliegues que incluyan este cambio. Las URLs nuevas que Vercel facilite mediante `VERCEL_URL` o `VERCEL_PROJECT_PRODUCTION_URL` también abren Home si terminan en `.vercel.app`. Usá el dominio propio para probar las casas y sus paneles.

[Vercel y monorepos](https://vercel.com/docs/monorepos/monorepo-faq) · [Dominios y wildcard](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

## Supabase

Usá un solo proyecto Supabase para todas las casas. Copiá `supabase/.env.example` a `supabase/.env.local` si hace falta y completá el token personal de Supabase y la referencia del proyecto. Si la CLI necesita contraseña de Postgres, agregala a ese mismo archivo. Ejecutá estos comandos desde la raíz para inspeccionar y aplicar las migraciones al proyecto que indicaste.

```bash
(
  set -a
  source supabase/.env.local
  set +a
  : "${SUPABASE_ACCESS_TOKEN:?Completá el token en supabase/.env.local}"
  : "${SUPABASE_PROJECT_REF:?Completá la referencia en supabase/.env.local}"
  if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then unset SUPABASE_DB_PASSWORD; fi
  supabase link --project-ref "$SUPABASE_PROJECT_REF" &&
  supabase db push --linked --dry-run &&
  supabase db push --linked
)
```

Copiá la plantilla `apps/web/.env.example` a `apps/web/.env.local` si el archivo local todavía no existe. Completá en ese archivo o en **Environment Variables** de Vercel:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable |
| `SUPABASE_SECRET_KEY` | Clave secreta del servidor |

Git ignora ambos archivos `.env.local`. El token personal de la CLI sirve para autenticar la CLI. La app usa las claves del proyecto que figuran en la tabla.

En Supabase Auth, habilitá el proveedor correo para el acceso de Home y administradores. Deshabilitá el alta pública desde Supabase Auth. El portal de jugadores registra cuentas por CI y contraseña desde el servidor y asigna cada cuenta a la casa donde se creó. El registro por CI no comprueba la titularidad del documento. Para pasar cuentas de jugadores que ya se crearon por correo al acceso por CI, hay que vincularlas a su identificación interna conservando el UUID de Auth y el saldo.

## Primer ingreso

1. Creá en **Authentication → Users** una cuenta para administrar Home. Copiá el UUID de ese usuario y ejecutá esta sentencia, sustituyendo el marcador por el UUID real.

   ```sql
   insert into public.profiles (id, role)
   values ('UUID_DEL_USUARIO_DE_HOME', 'superadmin');
   ```

2. Entrá en Home con esa cuenta. Creá cada casa en **Casas**. Para conservar las identidades existentes, usá sus nombres y slugs previstos, por ejemplo **Kairobet** con `kairobet` y **Krakenbet** con `krakenbet`.
3. En **Home → Casas → Asignar administrador**, elegí la casa y escribí el correo del administrador. Si el correo todavía no tiene cuenta, completá la contraseña inicial. Si ya tiene cuenta, dejá ese campo vacío. El administrador asignado ingresa en el host de su panel. El superadmin puede ingresar con su propia cuenta en cualquiera de esos paneles.
4. Desde **Catálogo** en Home, publicá la biblioteca de juegos incluida. En **Juegos** del panel de cada casa, activá los que quieras mostrar a sus jugadores.
5. Registrá un jugador con su CI desde el portal de la casa. En el panel de la misma casa, revisá la cuenta en **Registros** y aprobala después de verificarla. El jugador ya puede iniciar sesión con su CI. En el panel de la misma casa, usá **Cargas** para acreditar fichas. En el portal, verificá saldo y movimiento. Probá también que un usuario de la otra casa no pueda entrar con esa cuenta ni leer el movimiento.

Los saldos nuevos empiezan en cero y se calculan a partir del historial de fichas. Los juegos siguen funcionando con fichas de prueba separadas de la cuenta. Las rondas con saldo de cuenta, los retiros y la revisión de comprobantes aún requieren flujos propios.

[Flujo de migraciones de Supabase](https://supabase.com/docs/guides/local-development/cli-workflows) · [Permisos de la Data API](https://supabase.com/docs/guides/api/securing-your-api)

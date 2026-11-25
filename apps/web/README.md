# @homebet/web

App Next.js de Homebet. El manual del proyecto está en el [AGENTS.md](../../AGENTS.md) de la raíz.

```bash
npm install
npm test
npm run dev
```

## Registro y verificación de muestra

En el host de una casa, abrir **Ingresar → Crear cuenta** y elegir CI y contraseña ficticios. El perfil ofrece **Ver mi verificación**: primero datos personales, después frente y reverso de CI y selfie. Los menores de 18 años no pueden enviar la solicitud. Al enviarla queda **En revisión**, sin acceso a jugar.

En el host administrador de esa misma casa, **Registros** muestra fichas ficticias con datos y tres imágenes ampliables. Se puede buscar por CI o nombre y filtrar por estado:

- **Verificado:** permite el acceso a jugar cuando exista un juego habilitado.
- **Denegado:** requiere un motivo; permite corregir datos/fotos y reenviar a revisión.
- **Rechazado:** requiere un motivo; el jugador no puede modificar ni reenviar.

El administrador puede cambiar cualquiera de esas decisiones. Las pruebas de `lib/verification.test.ts` cubren mayoría de edad, aprobación, reenvío, rechazo y revocación.

La demo mantiene cuentas, contraseñas de prueba y fotos únicamente en memoria del navegador. Se reinicia al recargar y no sincroniza hosts, pestañas ni dispositivos. Las fotos seleccionadas se previsualizan localmente; no se suben. El panel administrador usa `registrationFixtures` en `lib/fixtures.ts`. No usar datos ni documentos reales.

La autenticación real por CI, el almacenamiento privado de documentos, la recepción de solicitudes en cada casa y la autorización del servidor para entrar a juegos quedan pendientes de conectar Supabase. Los controles de esta demo son de interfaz y no constituyen autenticación, RLS ni verificación real.

La ficha administrativa se comparte entre **Jugadores** y **Registros**: datos personales editables en memoria, saldo derivado de movimientos de muestra, revisión de documentos con ampliación de fotos y resumen de actividad. Las cargas y retiros enlazan a las secciones existentes; la ficha no permite sobrescribir el saldo.

## Revisión de cargas de muestra

**Cargas** abre con todas las solicitudes de la casa actual, de más nuevas a más antiguas y con 20 por página. Al abrir una solicitud se muestra una tarjeta con monto declarado por el jugador, identidad, fecha, bono y comprobante ampliable. El cajero elige **Aceptar** o **Rechazar**, sin tipear el monto ni tomar la solicitud previamente. Rechazar requiere confirmación y usa un motivo general. Ambas acciones se bloquean desde el primer clic; cancelar la confirmación permite volver a elegir. Al resolver, la tarjeta se cierra y aparece un aviso durante cinco segundos con el resultado y, al cargar, el total acreditado con bono.

Al aceptar se usa directamente el importe solicitado por el jugador. El cajero debe revisar que coincida con el comprobante; si no coincide, rechaza la solicitud. Si se seleccionó un bono válido, se calcula automáticamente desde las condiciones asociadas a esa solicitud (mínimo, máximo, beneficio fijo o porcentual, tope y vigencia al solicitar). Una carga de 15.000 con bono fijo de 2.000 genera dos movimientos: carga de 15.000 y bono de 2.000. El total acreditado es 17.000; no se sobrescribe el saldo. Sin bono seleccionado se acredita únicamente el pago.

La solicitud resuelta no puede aceptarse de nuevo. Rechazar no genera movimientos. El estado de muestra publica juntos la decisión y los movimientos y actualiza la ficha y la lista de Jugadores de esta pestaña. Las pruebas de `lib/deposits.test.ts` cubren esos recorridos, importes, condiciones del bono, casa/cajero y duplicados.

Los comprobantes y solicitudes vienen de `depositRequestFixtures` en `lib/fixtures.ts`. El envío del jugador, los pagos, el editor de bonos y la acreditación real no están conectados a este flujo de muestra. Todo se reinicia al recargar. Al conectar Supabase, la toma y la acreditación deben ser transacciones de servidor con control de rol, aislamiento por `casino_id` e idempotencia; el cliente nunca escribe el libro de movimientos.

## Juegos demo de Lumen Studio

En **Home → Taller** (`/juegos`) están las veinte demos 3×3, cada una con 10.000 fichas separadas del saldo de las casas. En **Home → Proveedores** se configura el RTP general de Lumen y las excepciones por juego para los ensayos de esa pestaña. Se reinician al recargar. Los juegos están también en el catálogo de las casas y conservan el requisito de cuenta demo verificada para abrirlos desde allí.

Motor, probabilidades, pruebas y manifiestos: [packages/proveedores/README.md](../../packages/proveedores/README.md). Los recursos son WebP locales y podrán migrarse a Storage cuando se conecte Supabase.

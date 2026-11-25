# Royal Gold · ruleta europea jugable

Una sola temática y una sola variante: ruleta europea de un cero. Motor y jugador implementados en `packages/proveedores/src/roulette-engine.ts` y `roulette-player.tsx`. Se abre desde el taller `/juegos` o directamente en `/juegos/ruleta` usando el host de Home.

Dirección visual: oro pulido, madera oscura, terciopelo y paño burdeos. La pantalla reúne saldo demo, último premio, rueda, resultados recientes, tablero, fichas y giro. El tablero compacto propone una vista ampliada para colocar apuestas en móvil.

La rueda se dibuja con SVG: orden europeo, colores y 37 bolsillos. El motor elige un resultado uniforme con Web Crypto y descarte de la cola de uint32; la animación termina con ese número alineado con la bola. La imagen de la maqueta anterior queda solo como referencia; su numeración no interviene en el juego.

Fondo generado con **image_gen integrada**, guardado en `apps/web/public/images/roulette/royal-gold/scene.webp`; prompt exacto y procedencia en `scene-prompt.json`. La rueda, tablero, fichas y botones son elementos de código. Maqueta original: `royal-gold-mobile-v1.webp`.

## Apuestas y liquidación

157 zonas: plenos, caballos, calles y tríos con cero, cuadros y primeros cuatro, líneas de seis, docenas, columnas, rojo/negro, par/impar y mitades. El tablero ampliado permite elegir las combinaciones sin acertar con el dedo sobre líneas pequeñas.

Pagos de ganancia clásicos 35:1, 17:1, 11:1, 8:1, 5:1, 2:1 y 1:1. El cobro mostrado incluye la apuesta ganadora. Se suman las apuestas superpuestas. El cero pierde las apuestas externas; no se aplica La Partage. Referencia de pagos: [Nevada Gaming Control Board, reglas de ruleta](https://prod.gaming.nv.gov/siteassets/content/divisions/enforcement/rules-of-play/Roulette.pdf).

Importes en centavos enteros. Cada giro valida zonas, importes, saldo y límite de 100.000 fichas antes de sortear. Se descuenta una sola apuesta total al iniciar y se acredita una sola liquidación al terminar. El bloqueo inmediato por referencia evita giros duplicados; transición y temporizador comparten una finalización idempotente.

Saldo inicial: 10.000 fichas demo. Diez fichas seleccionables: 10, 25, 50, 100, 250, 500, 1k, 2k, 5k y 10k. La pantalla muestra una sola ficha seleccionada. Al tocarla, el selector compartido con los slots abre las diez opciones en una tarjeta de dos filas, con confirmación y cancelación; también se usa en el tablero ampliado. Deshacer, limpiar, repetir, historial de 20 resultados (ocho visibles), sonido opcional, reglas y premio que se cierra al tocar. Movimiento reducido respetado. La sesión se reinicia al cerrar el jugador.

## Comprobación

- `npm test`: diez archivos anteriores y el nuevo archivo de pruebas de ruleta. Se comprueba cada zona con los 37 resultados posibles, saldo, superposición, cero, entradas inválidas y descarte del RNG. El retorno teórico de cada apuesta es 36/37.
- `node --experimental-strip-types packages/proveedores/src/roulette-engine.test.ts`: ejecutado directamente también; las cinco pruebas pasan, sin depender de procesos secundarios del ejecutor de pruebas.
- `npm run typecheck` y ESLint de los archivos nuevos.
- `node scripts/audit-royal-gold.cjs`: render estático, 37 números, hoja CSS y alineación de los 37 destinos de la rueda.

No hubo prueba interactiva en navegador en este entorno. La compilación de producción no quedó verificada: Turbopack no avanzó y Webpack falló con `Could not parse output from TypeScript's --showConfig`. Se reprodujo que el proceso secundario usado por Next retorna salida vacía en este entorno, mientras que ejecutar `tsc --showConfig` y `tsc --noEmit` directamente funciona. No se cambió la configuración de compilación para ocultar el problema.

La integración actual es una demo local del taller, no una publicación en el catálogo de las casas.

Royal Gold conserva su temática original. Las otras tres ruletas y sus distribuciones se documentan en `../roulette-pilot/README.md`. No se modificaron las reglas de los slots ni se conectó Supabase.

## Acabado visual v2

Se conserva la distribución móvil. El acabado agrega marco dorado con rubíes, cartel de terciopelo con corona, tres botones ilustrados y cuatro fichas con centros vacíos para etiquetas vivas. Los nueve recursos transparentes viven en `apps/web/public/images/roulette/royal-gold/`: `frame-v2.webp`, `title-v2.webp`, `undo-v2.webp`, `spin-v2.webp`, `repeat-v2.webp` y `chip-{0,1,2,3}-v2.webp`.

Generación mediante **image_gen integrada**: [prompt de controles](controls-v2-prompt.json) y [prompt del marco](frame-v2-prompt.json). [Hoja de revisión de controles](controls-v2-review.webp). Exportación reproducible con `node scripts/pack-royal-gold-v2.cjs`.

`roulette-royal-skin.css` aplica el arte sobre los controles existentes. La rueda sigue en SVG, con vetas, anillos de metal, bolsillos separados, brazos y remates del eje, iluminación y sombras. La bola termina dentro del bolsillo, debajo de su número. No se usa una imagen generada para representar números o zonas de apuesta. El motor y las tablas de pago no cambian.

Verificación de esta revisión: TypeScript directo, ESLint sin errores, CSS con Lightning CSS y auditoría de render, 37 destinos y transparencia de los nueve recursos. Sin comprobación interactiva en navegador desde este entorno.

El selector y sus estilos viven en `src/chip-picker.tsx` y `src/chip-picker.css`; el componente anterior `SlotChipPicker` reexporta el mismo selector con sus textos originales. La ruleta adapta los textos a «Elegí tu ficha» y «Usar ficha». La abreviación de importes también se comparte desde `src/chip-label.ts`.

# Lumen Studio · slots 3×3, 5×3 y 5×5

Ochenta temáticas tienen doscientas cuarenta ediciones de demostración: ochenta con motor 3×3 (edición I), ochenta con motor 5×3 de 25 líneas fijas (edición II) y ochenta con motor 5×5 de 50 líneas fijas (edición III). El paquete no abre bases de datos, no lee claves y no opera dinero real.

## Probar

1. Iniciar la plataforma con `npm run dev` desde la raíz.
2. En Home, abrir **Taller** (`/juegos`) y elegir **Probar con fichas demo**.
3. Cada partida comienza con **10.000 fichas demo**; apuesta inicial de 50. Estas fichas son independientes del saldo de la casa y se reinician al cerrar el juego.
4. En **Proveedores**, cambiar el RTP general de Lumen (96% inicial) o una excepción por juego. Probar otra vez desde el Taller en esa misma pestaña.
5. Los cuarenta juegos también aparecen como demos en el catálogo de las casas. El acceso de la casa sigue requiriendo la cuenta de muestra verificada (CI `1234567`, contraseña `123456789`); Home permite ensayarlos directamente.

Las reglas, tabla de pagos y últimas veinte rondas se consultan dentro del juego. El sonido es opcional y empieza apagado. El cargador informa errores y permite reintentar los recursos.

## Motor

- Grilla 3×3 y cinco líneas: tres filas y dos diagonales.
- Seis símbolos normales. Tres iguales pagan **1×, 2×, 5×, 10×, 20× o 50× la apuesta total**. Un símbolo WILD puede sustituir un símbolo de una línea.
- El motor selecciona un resultado con una tabla de probabilidades y luego construye una grilla coherente con ese resultado. Las victorias normales tienen exactamente una línea ganadora; no simula nueve símbolos independientes.
- Tres símbolos de giros gratis activan **cinco giros gratis**, sin débito, sin reactivaciones y conservando apuesta y RTP del giro que los activó.
- Tres símbolos WILD en las posiciones del bono abren **tres cofres**: uno se elige y paga entre 1× y 5×. El importe queda fijado antes de elegir; ninguna posición da ventaja. El motor bloquea más giros hasta resolverlo y evita un segundo cobro.
- Apuestas permitidas: 10, 25, 50, 100, 250 o 500 fichas. Los importes internos siempre son enteros en centésimos.
- Velocidades ×1, ×2 y ×3 cambian únicamente los tiempos de animación, nunca el resultado.
- Autojuego finito (10, 20, 50 o 100 giros), con límites de pérdida y ganancia respecto del saldo inicial. Se detiene al activar un bono, giros gratis, saldo insuficiente, ocultar la pestaña o pulsar Detener. Un giro ya iniciado termina una sola vez.
- Los bloqueos de interacción se aplican inmediatamente con referencias; no dependen del siguiente render de React.

### RTP

Rango: **80–98%**, con dos decimales. `ProviderRtp` tiene un valor general y un mapa opcional de excepciones. Quitar una excepción hace que el juego herede de nuevo. La configuración no depende del jugador, sus resultados ni su saldo.

La distribución usa **3.450.000 tickets** por giro. Los seis premios normales tienen pesos `50, 25, 15, 6, 3, 1`; su premio medio condicionado es 3,45 apuestas. En un giro pagado, cada tramo normal tiene `(rtpBps − 800) × peso` tickets. Hay 34.500 tickets para giros gratis y 34.500 para cofres (1% cada uno); el resto pierde. En giros gratis, cada tramo normal tiene `10.000 × peso` tickets y no aparecen nuevas funciones. El retorno esperado de cada giro gratis es una apuesta.

Por tanto, el retorno total esperado por giro pagado es:

`(RTP − 8%) + (1% × 5 giros × 100%) + (1% × premio medio de cofre 3×) = RTP`.

`expectedRtp()` verifica esa identidad. Es una expectativa de largo plazo, no una garantía por sesión ni una certificación del juego. El azar demo usa `crypto.getRandomValues` con rechazo para evitar sesgo de módulo. No usa el saldo para compensar victorias o pérdidas.

## Recursos raster

Los archivos consumidos viven en `apps/web/public/images/slots/{slug}/`:

- `banner.webp`: 960×420, también usado en la pantalla de carga y como fondo.
- `cover.webp`: 384×480 para catálogo.
- `icon.webp`: 96×96.
- `symbols.webp`: atlas horizontal de ocho símbolos de 192×192; una sola imagen para los rodillos.

Los recursos actuales están comprimidos en WebP; los inventarios por lote registran sus dimensiones y procedencia. Las demos cargan solo su propio banner y atlas antes de entrar; las portadas del Taller se cargan bajo demanda. No hay SVG ni emojis usados como ilustración de los juegos.

Las ilustraciones originales se generaron con la herramienta integrada **image_gen**, una generación por temática. El conjunto de prompts temáticos está en `assets/themes.json`. Cada generación pide una escena superior y ocho símbolos inferiores (seis temáticos, estrella wild y portal), con estilo 3D de joyas y sin texto. `scripts/prepare-slot-assets.cjs` extrae, dimensiona y comprime esos atlas raster; `assets/asset-audit.json` registra los tamaños resultantes. Los originales de generación no son necesarios para ejecutar la plataforma.

## Pruebas y límites

`npm test` incluye `src/slot-engine.test.ts`: RTP analítico, tramos de premios y grillas, pérdidas coherentes, apuestas inválidas, cinco giros sin débito, bloqueo de bonos duplicados, herencia y 100.000 rondas de contabilidad.

Las sesiones y configuraciones son de muestra, en memoria; no persisten ni sincronizan hosts/pestañas. El motor es ejecutable y la interfaz permite jugar, pero no es una integración de apuestas reales ni un motor certificado. Al conectar Supabase, el servidor deberá resolver las rondas, validar rol/casa/configuración y escribir débito, premio y ronda de forma atómica e idempotente en el mismo proyecto. El navegador nunca debe autorizar premios ni escribir el ledger real. Los archivos WebP podrán migrarse a Storage/CDN mediante el manifiesto sin duplicarlos por casa.

## Segundo lote de casino

Los juegos 21–40 se definen en `src/slot-batch-02.ts` y comparten el motor existente. El taller permite filtrar por lote y conserva la búsqueda y las cuatro distribuciones. Los recursos y prompts de este lote viven en `assets/casino-batch-02/`. Cada tema tiene portada, fondo vertical, ocho símbolos transparentes, cartel, ficha, giro, botón e insignias propios.

## Ediciones I y II

El taller permite elegir edición y lote. `slotPlayableGames` reúne las 240 demos, reutilizando el arte de las 80 temáticas; los slugs de la edición II terminan en `-ii`. La configuración demo de RTP y la distribución de controles se pueden ajustar por edición. Reglas y verificación: `assets/edition-II-5x3.md`.

## Edición III en las 80 temáticas

La edición III usa grilla 5×5 y 50 líneas fijas. Está en el taller, la vista móvil y las fixtures del catálogo de las casas. Reutiliza el arte original, añade el sufijo `-iii` y tiene preferencias y configuración demo propias. Documentación: `assets/edition-III-5x5.md`. Las ediciones I y II conservan sus motores y reglas. Las variantes de pagos por formas o grupos quedan para una edición futura.

## Lote 3: pixel art

Se suman 20 temas: 19 originales y un fanart de Hora de Aventura para la demo visual local solicitada. Cada uno tiene las tres ediciones, reutilizando los mismos recursos. El taller permite filtrar «Lote 3» en cualquier motor. Arte, prompts y auditorías: `assets/pixel-batch-03/README.md`. Las tarjetas fanart están identificadas como tales y no se realizó una publicación externa.

El lote 4 incorpora 20 homenajes originales a géneros de cultura pop y completa 80 temáticas y 240 ediciones. Recursos y procedencia: `assets/pop-batch-04/README.md`.

## Royal Gold · ruleta europea

Una primera ruleta jugable con fichas demo, independiente de los slots. Motor puro en `src/roulette-engine.ts`, jugador móvil en `src/roulette-player.tsx`, exportaciones `@homebet/proveedores/roulette-engine` y `@homebet/proveedores/roulette-player`. En Home: `/juegos/ruleta` o el botón «Jugar Royal Gold» del taller. Incluye 37 números, apuestas simples y combinadas, liquidación en centavos, rueda SVG alineada con el resultado, tablero ampliado, historial y reglas. Detalles y procedencia del fondo: `assets/royal-gold/README.md`. No está publicada en el catálogo de las casas ni conecta Supabase.

La ruleta europea ya tiene 40 temas, diez por cada una de cuatro distribuciones: clásica, mesa protagonista, vista alternada y compacta. Comparten el mismo motor de apuestas; las 36 temáticas nuevas aportan escena, portada y paleta propias, y mantienen los controles de su familia visual. El catálogo vive en `src/roulette-catalog.ts`. Demos, arte y verificaciones: `assets/roulette-pilot/README.md`.

# Edición II: 80 temáticas con motor 5×3 de líneas fijas

Abrir en Home: `/juegos` y elegir «Edición II · 5×3». Cada una de las 80 temáticas tiene su edición II con sufijo `-ii`; por ejemplo `/juegos?demo=golden-sevens-ii` o `/juegos?demo=oraculo-coral-ii`. El taller, la vista móvil y el catálogo demo de las casas incluyen 80 ediciones I, 80 ediciones II y 80 ediciones III: 240 demos en total. No se conecta Supabase ni se realiza un despliegue externo.

- Edición I: motor 3×3 existente.
- Edición II: motor 5×3, 25 líneas fijas siempre activas.
- Edición II Pro: futuras variantes de pago; no implementada.
- Edición III 5×5: 80 versiones de edición III disponibles; ver `edition-III-5x5.md`.

## Reglas de la edición II

Pagan 3, 4 o 5 símbolos consecutivos, desde el primer rodillo y de izquierda a derecha. Entre rodillos consecutivos la línea permanece en la misma fila o pasa a una vecina; nunca salta directamente de arriba a abajo. Cada línea paga su mejor combinación una sola vez y se suman las líneas ganadoras. Los multiplicadores se aplican a la **apuesta total**, sin dividirla entre 25 ni cobrar adicional por línea.

| Símbolo | 3 iguales | 4 iguales | 5 iguales |
|---|---:|---:|---:|
| Moneda | 1× | 2× | 5× |
| Cereza | 2× | 5× | 10× |
| Limón | 5× | 10× | 25× |
| Campana | 10× | 25× | 50× |
| Barra de oro | 20× | 50× | 100× |
| Siete | 50× | 100× | 250× |

WILD sustituye símbolos normales y se elige el pago mayor por línea, también cuando un prefijo de WILD admite varios símbolos. Tres WILD en la grilla activan el bono de elección, con premio 1×–5× fijado antes de elegir. Tres sellos en cualquier posición activan cinco giros gratis. Conservan apuesta y RTP de activación, no debitan ni reactivan funciones.

## Matemática de demostración

Como en el motor I, el resultado se elige por tramos de tickets y luego se construye una grilla coherente. La generación contempla varias líneas ganadoras cuando comparten un inicio válido. Cada tramo de tickets incluye el premio agregado real de todas las líneas que paga esa grilla, sin omitirlas ni mantener un RTP calculado para una sola línea.

El RTP teórico se calcula con los pesos de las 450 combinaciones de símbolo/cantidad/recorrido, más 1% de activaciones de cinco giros gratuitos con retorno medio de una apuesta por giro y 1% de bonos con premio medio de tres apuestas. Las funciones reservan 8 puntos de RTP; el resto corresponde a premios de línea. El ajuste admite 80%–98% como la edición I. Esta es una demo de navegador con fichas, no un motor certificado ni conectado a dinero real.

## Reutilización

`themeSlug: golden-sevens` comparte portada, fondo, atlas, cartel, ficha, controles e insignias; no se duplican imágenes. `engine: 5x3` selecciona el perfil de grilla, líneas, pagos y giro. La animación termina con el quinto rodillo y resalta solo las celdas de la combinación pagada.

Pruebas: 25 líneas, 3/4/5 símbolos, WILD, sumas de líneas, todos los tramos de resultado, RTP exacto, bonos, gratuitos y contabilidad de 20.000 rondas. También se ejecuta la suite existente del motor I. La revisión interactiva en navegador queda pendiente.

Regresión de la captura del usuario: `[2,1,2,1,4, 1,0,3,1,1, 2,2,5,2,4]` no paga. Cambiar la moneda central del segundo rodillo por limón habilita el recorrido inferior → central → superior.

## Distribución a las 80 temáticas

`createSlotEditionII` en `packages/proveedores/src/slot-editions.ts` deriva las ediciones II del catálogo base. Conserva portada, sprites y demás recursos; asigna un slug, nombre, versión y perfil de motor propios. Las preferencias de controles y los ajustes demo de RTP se identifican por edición.

`slotGames` sigue representando las 80 temáticas originales; `slotEditionIIGames` contiene sus 80 variantes y `slotPlayableGames` reúne las 240 demos. `slotGameBySlug` resuelve ambas ediciones para el portal de jugadores. Las fixtures indican `slot-3x3` o `slot-5x3` y las tarjetas conservan la portada completa en ambos casos.

Verificación: `node scripts/audit-slot-editions.cjs` comprueba las 240 rutas, perfiles, referencias de tema y los 880 recursos compartidos, además de las entradas del catálogo demo. TypeScript y las diez suites de pruebas pasan. La edición II Pro queda pendiente; el motor 5×5 está disponible en las 80 temáticas.

El lote 3 agrega 20 temáticas de pixel art. El catálogo actual tiene 80 temáticas y 240 versiones; las reglas de los motores permanecen iguales. Véase `pixel-batch-03/README.md` para recursos y procedencia del arte.

El lote 4 incorpora 20 homenajes originales a géneros de cultura pop y completa 80 temáticas y 240 ediciones. Recursos y procedencia: `pop-batch-04/README.md`.

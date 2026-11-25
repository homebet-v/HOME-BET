# Edición III: 80 temáticas con motor 5×5

Abrir en Home: `/juegos` y elegir «Edición III · 5×5». Las 80 temáticas tienen su versión III, con sufijo `-iii`; por ejemplo `/juegos?demo=golden-sevens-iii` o `/juegos?demo=oraculo-coral-iii`.

El taller, la vista móvil y el catálogo demo de las casas incluyen las 240 versiones: 80 de edición I (3×3), 80 de edición II (5×3) y 80 de edición III (5×5). Cada edición conserva sus propios identificadores de sesión, distribución de controles y ajustes demo de RTP, reutilizando el arte de su tema. No se conecta Supabase ni se despliega un proyecto externo.

## Reglas

- Grilla de cinco rodillos y cinco filas: 25 símbolos.
- 50 líneas fijas, activas en cada giro.
- Premios por 3, 4 o 5 símbolos consecutivos desde el primer rodillo, de izquierda a derecha.
- Entre rodillos consecutivos, la línea mantiene su fila o pasa a una vecina. No salta filas.
- Se cobra la mejor combinación de cada línea una sola vez y se suman las distintas líneas ganadoras.
- Los multiplicadores se aplican a la apuesta total; no se divide entre 50 ni se cobra por línea.

| Símbolo | 3 iguales | 4 iguales | 5 iguales |
|---|---:|---:|---:|
| Moneda | 1× | 2× | 5× |
| Cereza | 2× | 5× | 10× |
| Limón | 5× | 10× | 25× |
| Campana | 10× | 25× | 50× |
| Barra de oro | 20× | 50× | 100× |
| Siete | 50× | 100× | 250× |

WILD sustituye símbolos normales y se elige el pago mayor por línea. Tres WILD activan el bono de elección, con premio de 1× a 5× fijado antes de elegir. Tres sellos en cualquier posición dan cinco giros gratis con la apuesta y RTP de activación. Durante los gratuitos no se cobran fichas ni se reactivan funciones.

## Interfaz compartida

El arte se reutiliza de Golden Sevens mediante `themeSlug`; no se duplican imágenes. La grilla y las animaciones muestran cinco filas completas. El quinto rodillo termina la animación de giro. Primero se resaltan las líneas ganadoras y después aparece la tarjeta de premio, que se cierra al tocarla. Las 50 líneas se consultan en páginas de diez dentro de las reglas.

El encuadre móvil reserva el espacio para saldo, cartel, apuesta y controles antes de calcular el tamaño de la grilla cuadrada. La edición III tiene sus propios ajustes de espacio para evitar heredar la separación vertical del 5×3.

## Motor y validación

`src/slot-engine-5x5.ts` define sus 50 líneas. Comparte con la edición II el evaluador de cinco rodillos, las validaciones y la contabilidad de `src/slot-engine-five-reels.ts`; cada configuración calcula su propia distribución de premios y RTP. La configuración de la edición II mantiene 25 líneas y su mismo número de tickets.

El motor III contempla 900 combinaciones de símbolo, cantidad y recorrido. Cada tramo considera la suma de todas las líneas válidas en la grilla. Su conjunto de 5.433.200.000 tickets supera el rango de 32 bits: el muestreo uniforme usa 53 bits con rechazo del resto para evitar sesgo. Los importes siguen siendo enteros en centésimos.

Pruebas: 50 líneas únicas y adyacentes, las cinco filas, pagos por 3/4/5, WILD, scatter, múltiples líneas, todos los tramos de resultado, RTP teórico de 80%–98%, bonos, gratuitos, contabilidad de 20.000 rondas y muestreo aleatorio sobre 32 bits. Pasan las diez suites de pruebas existentes y nuevas, TypeScript y ESLint de los componentes cambiados (solo advertencias existentes de imágenes).

Auditoría: `node scripts/audit-slot-editions.cjs` verifica las 240 demos, los recursos compartidos y la selección de motor. No se pudo realizar una revisión interactiva en navegador desde este entorno; el ajuste visual se revisará con el usuario en el móvil.

Edición II Pro y otros motores con pagos por grupos o formas quedan fuera de esta edición. No se conectó Supabase ni se modificó dinero real.

## Distribución a todas las temáticas

`createSlotEditionIII` deriva las 80 versiones 5×5 a partir de `slotGames`. `slotEditionIIIGames` las agrupa y `slotPlayableGames` reúne las 240 versiones. `slotGameBySlug` resuelve las tres ediciones. Las fixtures identifican la edición III con `runtime: slot-5x5` y las tarjetas mantienen las portadas completas.

La auditoría confirma 240 slugs y nombres únicos, 80 entradas por motor, los perfiles 3×3/5×3/5×5 y 880 recursos existentes compartidos. Pasan TypeScript, las diez suites y ESLint sin errores (solo las advertencias de imágenes existentes).

El lote 3 agrega 20 temáticas de pixel art. El catálogo actual tiene 80 temáticas y 240 versiones; las reglas de los motores permanecen iguales. Véase `pixel-batch-03/README.md` para recursos y procedencia del arte.

El lote 4 incorpora 20 homenajes originales a géneros de cultura pop y completa 80 temáticas y 240 ediciones. Recursos y procedencia: `pop-batch-04/README.md`.

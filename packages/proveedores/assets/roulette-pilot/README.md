# Ruletas · 40 temas, cuatro distribuciones

Colección de **40 temas: diez por distribución**. Las cuatro primeras definen la interfaz de cada familia; los otros 36 añaden escenas y portadas propias y conservan el acabado de controles de su distribución.

| Tema | Distribución | Comportamiento |
| --- | --- | --- |
| Royal Gold | Clásica | Rueda protagonista arriba y tablero tradicional debajo. Conserva el nombre sin cartel de fondo y sin marco exterior. |
| Neon Vegas | Mesa protagonista | Rueda pequeña a la derecha para apostar. Al girar, se amplía sobre el tablero y permanece grande para ver el resultado. El premio espera 1,1 segundos tras la caída de la bola; al cerrar la tarjeta o tocar «Volver al tablero» se recupera la mesa. Contadores apilados a la izquierda, tablero de seis columnas y ficha junto a la apuesta. |
| Coral Palace | Alternada | El tablero y la rueda comparten el centro. Botones para cambiar de vista; al girar se muestra automáticamente la rueda. |
| Cyber Wheel | Compacta | Rueda mediana, seis apuestas rápidas y tablero completo de números/combinaciones en una tarjeta. |

## Colección completa

| Distribución | Temas |
| --- | --- |
| Clásica | Royal Gold, Sapphire Crown, Ruby Dynasty, Emerald Court, Venetian Fortune, Midnight Majesty, Desert Sultan, Imperial Jade, Crystal Ballroom, Moonstone Casino |
| Mesa protagonista | Neon Vegas, Velvet 777, Diamond District, Electric Avenue, Miami Royale, Starlight Lounge, Tokyo Jackpot, Disco Fortune, High Roller Boulevard, Chrome Palace |
| Vista alternada | Coral Palace, Pearl Atlantis, Sakura Tide, Moonlit Lagoon, Sunken Treasure, Aurora Reef, Mermaid's Pearl, Jade Lagoon, Poseidon's Trident, Tropical Mirage |
| Compacta | Cyber Wheel, Quantum Vault, Matrix Fortune, Plasma Circuit, Titanium Grid, Neon Protocol, Digital Dynasty, Lunar Systems, Reactor Rush, Binary Jackpot |

Las 40 comparten `roulette-engine.ts`: 37 números, 157 zonas, pagos clásicos, saldo demo y sorteo uniforme. No cambian probabilidades, pagos ni límites según tema. Cada tema nuevo tiene escena, portada, paleta y emblema central propios; cada familia conserva sus estilos de rueda y su set de controles y fichas. Matrix Fortune tiene además un eje de circuitos con núcleo hexagonal. Royal Gold conserva ocho brazos; Neon Vegas usa cinco y una estrella; Coral Palace seis curvos, perlas y una concha; Cyber Wheel seis brazos rectos, remates hexagonales y circuitos.

Las fichas se eligen con el selector compartido de los slots: una visible, diez disponibles en la tarjeta. Los números de rueda y tablero permanecen en código; las imágenes generadas no resuelven apuestas.

## Abrir en Home

- `/juegos`: 40 tarjetas agrupadas por distribución en el taller de ruletas, antes de los slots.
- `/juegos/ruleta?theme=royal-gold`
- `/juegos/ruleta?theme=neon-vegas`
- `/juegos/ruleta?theme=coral-palace`
- `/juegos/ruleta?theme=cyber-wheel`

Usar `http://localhost:3000` o el host local de Home. Cada apertura inicia una sesión demo independiente; cambiar de tema reinicia la sesión.

## Código

- `src/roulette-catalog.ts`: 40 perfiles visuales, agrupados en diez temas por distribución.
- `src/roulette-player.tsx`: jugador común, vistas de apuesta/rueda y botones rápidos.
- `src/roulette-layouts.css`: cuatro distribuciones responsive y acabados de los temas.
- `apps/web/components/roulette-studio.tsx`: tarjetas y lanzamiento de demos.

Las 40 ruletas están disponibles en el catálogo demo de las casas, en la categoría Ruleta. La apertura usa el acceso de jugador de la casa y la disponibilidad definida en las fixtures.

## Arte y procedencia

Generado con **image_gen integrada**. Los 40 temas tienen una portada vertical que integra la rueda y el título en el mismo escenario. Las cuatro portadas horizontales originales se conservan como recursos de referencia. Los botones y fichas usan el atlas de su familia de distribución. Archivos en `apps/web/public/images/roulette/{slug}/`.

- `cover.webp`, 1200×800, portada original de cada prototipo.
- `cover-v3.webp`, 800×1000, portada vertical de cada ruleta.
- `scene.webp`, 860×1720, fondo con centro despejado.
- `undo-v2.webp`, `spin-v2.webp`, `repeat-v2.webp`, botones sin texto.
- `chip-{0,1,2,3}-v2.webp`, fichas con centro vacío.

Los textos y las animaciones se superponen con código. Los nuevos briefs de generación están en `packages/proveedores/assets/roulette-themes-v2/scenes.json`; `scripts/pack-roulette-theme-scene.cjs` normaliza cada generación y prepara la portada.

[Prompts y procedencia final](final-prompts.json) · [Portadas](covers-review.webp) · [Controles](controls-review.webp) · [Fondos](scenes-review.webp) · [Ruedas SVG por tema](wheels-review.webp) · [Auditoría](asset-audit.json).

Recursos nuevos: 36 escenas y 36 portadas, además de los cuatro sets de controles y fichas ya aprobados. La auditoría actualizada produce hojas de contacto de toda la colección con `node scripts/audit-roulette-pilot.cjs`.

Verificación: `node scripts/audit-roulette-pilot.cjs`, TypeScript directo, ESLint y las cinco pruebas del motor. La auditoría comprueba cuatro perfiles, cuatro distribuciones, todas las zonas numéricas, 36 recursos, transparencias y CSS. Las hojas de contacto se inspeccionan visualmente.

No se pudo hacer una prueba interactiva en navegador desde este entorno. Las pantallas de 360×640 y superiores tienen reglas responsive; falta confirmar el ajuste real en el móvil. El bloqueo del build del entorno descrito en `../royal-gold/README.md` sigue sin resolverse y no se alteró la configuración de Next para ocultarlo.

La animación compartida ahora elige un ángulo final visual entre 0 y 360 grados para cada ronda. `src/roulette-motion.ts` calcula giros opuestos de rueda y bola para que el número ya resuelto termine exactamente bajo la bola en cualquier posición. Se elimina la flecha fija superior. Las dos pruebas de movimiento cubren 370 combinaciones de número/ángulo con rondas consecutivas y entradas inválidas. Este ángulo visual es independiente del sorteo y de la liquidación de premios.

El giro ahora tiene dos fases: la rueda se detiene primero y la bola continúa 720 ms con desaceleración y un pequeño rebote radial amortiguado. La finalización de la ronda escucha la transición de la bola; el temporizador de respaldo también espera ese tramo. El premio y los controles se liberan una vez asentada, conservando el centrado del bolsillo. Con movimiento reducido ambas transiciones duran 1 ms y se omite el rebote.

# Lote 3: 20 temas de aventura en pixel art

Lote implementado: 20 temáticas añadidas a las 40 existentes. El catálogo incluye las tres ediciones de cada una: 60 temáticas y 180 versiones demo.

Un tema es fanart de **Hora de Aventura**, con los personajes de la serie transformados a una estética de 8 bits. Los otros 19 tienen personajes originales. El usuario pidió este fanart como demostración visual dentro del proyecto, sin publicación externa. No se considera una licencia de la franquicia ni una producción oficial. Las tarjetas correspondientes se identifican como «FANART DEMO».

## Temas

Adventure Time 8-Bit, Candy Quest, Dungeon Dice, Slime Kingdom, Wizard Arcade, Pixel Pirates, Dragon Byte, Neon Ninja, Robot Rumble, Ghost Manor, Crystal Caverns, Moon Patrol, Goblin Gold, Star Rangers, Mushroom Knights, Mecha Cats, Frost Giants, Desert Raiders, Jungle Spirits y Retro Royals.

Los nombres de los juegos están en inglés y la interfaz, los símbolos y los bonos, en español.

## Arte y recursos

Herramienta: **image_gen integrada**. Cada tema tiene cuatro generaciones: portada, atlas de ocho símbolos, atlas de siete controles/insignias y fondo vertical. Se exportan al proyecto con interpolación de vecino más cercano y WebP sin pérdida para conservar los píxeles. Las ediciones II y III comparten esos mismos archivos.

Recursos finales bajo `apps/web/public/images/slots/{slug}/`:

- `identity-v3/cover.webp`: portada 1200×800.
- `skin-v2/scene.webp`: fondo 860×1474, con centro despejado para la grilla.
- `symbols-transparent.webp`: ocho símbolos, 1536×192, con margen transparente de ocho píxeles por celda.
- `icon.webp`: personaje/símbolo protagonista.
- `identity-v3/{title,chip,spin,button,prize-1,prize-2,prize-3}.webp`: cartel vacío para título vivo, ficha, giro, botón auxiliar y tres insignias.

`artStyle: pixel` conserva la apariencia de píxeles al escalar. `fanArt` identifica el único tema de la franquicia. La voz de audio opcional usa onda cuadrada; comienza silenciada como en los demás juegos.

- [Definiciones artísticas](games.json).
- [Prompts y procedencia final](final-prompts.json).
- [Portadas](covers-review.webp).
- [Símbolos](symbols-review.webp).
- [Controles](controls-review.webp).
- [Fondos](scenes-review.webp).
- [Auditoría de recursos](asset-audit.json).

Exportar: `node scripts/pack-pixel-batch-03.cjs --new-only`.

Revisar los 20 temas: `node scripts/audit-pixel-batch-03.cjs`.

Revisar las 180 versiones y sus recursos compartidos: `node scripts/audit-slot-editions.cjs`.

El catálogo se construye desde `slot-batch-03.ts`. Los motores de las ediciones I, II y III conservan su matemática y reglas; este lote añade arte y metadatos. No se aplican migraciones ni se conecta Supabase.

## Validación final

La auditoría del lote confirmó 20 temas, 160 símbolos y 140 recursos transparentes de controles e insignias. La auditoría del catálogo confirmó 180 slugs y nombres únicos, 60 versiones por motor y 660 recursos existentes compartidos. TypeScript, las diez suites de pruebas y ESLint pasaron sin errores (solo advertencias existentes por imágenes HTML). Se revisaron visualmente las hojas de contacto y se eliminó con image_gen el fondo residual del atlas de Goblin Gold. No se realizó una comprobación interactiva en navegador desde este entorno.

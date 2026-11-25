# Lote 4: 20 homenajes originales a la cultura pop

Último lote de slots de esta etapa: suma 20 temáticas a las 60 existentes para completar 80 temáticas y 240 versiones demo en los motores 3×3, 5×3 y 5×5.

Los personajes, vestuarios, emblemas, criaturas y objetos de este lote se plantean como diseños originales basados en géneros de cultura pop. No se solicitan personajes, logotipos ni actores concretos de franquicias existentes. El fanart de Hora de Aventura del lote anterior permanece separado e identificado como demo.

## Temas

Neon Outlaws, Ghost Hunters, Midnight Arcade, Cosmic Rebels, Monster Trainers, Vampire Disco, Mutant Alley, Time Jumpers, Kaiju City, Mystery Motel, Wasteland Radio, Masked Legends, Dungeon Party, Galaxy Racers, Monster Matinee, Sugar Rush Idols, Space Cowboys, Haunted Broadcast, Toybox Rebellion y Final Encore.

Cada tema tiene su dirección de arte: cómic, neón, fantasía, cine clásico, misterio o retrofuturismo. Los nombres de juego están en inglés y la interfaz, las reglas y los símbolos están en español.

## Recursos y generación

Herramienta: **image_gen integrada**, con una generación por portada, atlas de ocho símbolos, atlas de siete controles/insignias y fondo vertical. Las tres ediciones comparten las imágenes del tema.

Recursos finales bajo `apps/web/public/images/slots/{slug}/`:

- `identity-v3/cover.webp`: portada 1200×800, sin recortar el título.
- `skin-v2/scene.webp`: fondo 860×1474, con centro oscuro despejado para rodillos y controles.
- `symbols-transparent.webp`: ocho símbolos en una fila 1536×192, con márgenes transparentes de ocho píxeles por celda.
- `icon.webp`: protagonista.
- `identity-v3/{title,chip,spin,button,prize-1,prize-2,prize-3}.webp`: cartel, ficha, giro, botón auxiliar y tres insignias.

Las presentaciones `comic` y `neon` adaptan la tipografía viva y la tarjeta de premio a los marcos ilustrados. Las reglas y probabilidades de los tres motores se conservan.

- [Definiciones artísticas](games.json).
- [Prompts y procedencia final](final-prompts.json).
- [Portadas](covers-review.webp).
- [Símbolos](symbols-review.webp).
- [Controles](controls-review.webp).
- [Fondos](scenes-review.webp).
- [Auditoría de recursos](asset-audit.json).

Exportar: `node scripts/pack-pop-batch-04.cjs --new-only`.

Revisar el lote: `node scripts/audit-pop-batch-04.cjs`.

Revisar todas las versiones y referencias compartidas: `node scripts/audit-slot-editions.cjs`.

El lote está implementado en `packages/proveedores/src/slot-batch-04.ts` e incorporado al catálogo, al taller y a las tres ediciones. En `/juegos`, seleccionar «Lote 4» y la edición deseada.

Verificación: 20 temas, 160 símbolos y 140 controles con transparencia; 80 temas y 240 versiones únicas; 880 recursos compartidos existentes. Pasan TypeScript y las diez suites de pruebas. ESLint sin errores, con tres advertencias existentes sobre imágenes en SlotPlayer. Las hojas de contacto se revisaron visualmente y se corrigieron el fondo residual de Toybox Rebellion y las líneas del atlas de Masked Legends mediante image_gen integrada. `final-prompts.json` conserva los prompts originales y las correcciones.

No se pudo verificar de forma interactiva en navegador desde este entorno. No se conectó Supabase, no se aplicaron migraciones ni se realizó un despliegue externo.

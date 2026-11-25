# Segundo lote: 20 slots de casino

Los juegos 21–40 están implementados como demos del motor 3×3 existente. El catálogo tiene 40 juegos, 20 por lote, con nombres en inglés e interfaz en español. Los símbolos normales conservan el orden de pagos 1×, 2×, 5×, 10×, 20× y 50×. WILD, giros gratis y bono de elección usan las reglas del motor compartido.

## Implementación

- `packages/proveedores/src/slot-batch-02.ts`: datos de los 20 juegos y sus temas; el catálogo y los perfiles de tema los incorporan.
- Taller `/juegos`: contador dinámico, búsqueda y filtro por lote.
- Vista móvil `/juegos/movil`: los 40 juegos disponibles y las cuatro distribuciones por juego.
- Catálogo y colecciones de las casas: incorporan las demos a través de las fixtures existentes. No se conectó Supabase ni se desplegó otro proyecto.

## Recursos finales

Cada juego tiene recursos en `apps/web/public/images/slots/{slug}/`:

- `identity-v3/cover.webp`: portada 1200×800, mostrada completa.
- `skin-v2/scene.webp`: fondo vertical 860×1474, centro despejado para los rodillos.
- `symbols-transparent.webp`: ocho símbolos transparentes, 1536×192.
- `icon.webp`: símbolo protagonista.
- `identity-v3/{title,chip,spin,button,prize-1,prize-2,prize-3}.webp`: siete recursos transparentes de interfaz y premios.

**Dragon Fortune y Lucky Carnival usan `symbols-transparent-v2.webp` e `icon-v2.webp`**, con fondo eliminado mediante image_gen. Los nombres versionados evitan que el navegador conserve los atlas anteriores con halos claros.

Las portadas de **Wild West Gold y Aztec Treasure** provienen de los carteles de la maqueta aprobada. La generación individual fue rechazada; se conserva el diseño aprobado completo, de menor resolución de origen, sin recortar el título. Sus fondos, controles y símbolos sí tienen generación propia. Los recortes originales se guardan en `source-covers/`.

## Generación y comprobaciones

Herramienta: **image_gen integrada**. Los originales se exportan a WebP en el proyecto; la app no depende de rutas de la carpeta de generación.

- [Prompts finales y procedencia](final-prompts.json).
- [Definiciones artísticas](games.json).
- [Las 20 portadas](covers-review.webp).
- [Los 160 símbolos](symbols-review.webp).
- [Controles e insignias](controls-review.webp).
- [Fondos verticales](scenes-review.webp).
- [Auditoría de archivos](asset-audit.json).

Exportar cambios: `node scripts/pack-casino-batch-02.cjs --new-only`.

Auditar: `node scripts/audit-casino-batch-02.cjs`. Lee el catálogo TypeScript real, comprueba 40 slugs y nombres únicos, los 40 perfiles y recursos, los 20 juegos del segundo lote, ocho símbolos por atlas y márgenes transparentes que evitan contaminación entre celdas. Genera las hojas de revisión.

También se verificaron TypeScript, ESLint de los archivos cambiados y las ocho suites de pruebas existentes. No se realizó una verificación interactiva en navegador en esta sesión.

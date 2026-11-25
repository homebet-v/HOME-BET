# Identidad visual del primer lote de 20 slots

Motor: 3×3, cinco líneas. La renovación modifica presentación y nombres visibles; no modifica probabilidades, premios ni activadores del motor.

Los nombres de juego y sus logotipos están en inglés. La interfaz, las reglas y los mensajes permanecen en español. Los slugs existentes se conservan para mantener las rutas y preferencias de distribución.

## Recursos finales

- Portadas de catálogo: `apps/web/public/images/slots/{slug}/identity-v3/cover.webp`, 1200×800. Se muestran completas en formato 3:2 en taller, catálogo y colección.
- Cartel, ficha, giro, botón auxiliar y tres insignias: `apps/web/public/images/slots/{slug}/identity-v3/{title,chip,spin,button,prize-1,prize-2,prize-3}.webp`.
- Coral Oracle conserva los siete controles e insignias de `apps/web/public/images/slots/oraculo-coral/skin-v2/`; su portada sí se renueva.
- Fondos verticales y símbolos transparentes existentes conservan sus rutas y su correspondencia con el motor.

Cada juego tiene controles e insignias propios. Compartir una familia de colores ya no implica compartir las mismas imágenes.

## Generación y revisión

Herramienta utilizada: **image_gen integrada**, sin CLI ni API externa adicional.

- [Prompts finales de portadas en inglés](english-cover-prompts.json).
- [Prompts de los atlas transparentes](prompts.json): usar las entradas `controls`. Las entradas `cover` en español son la primera versión, reemplazada por la versión inglesa a pedido del usuario.
- [Revisión conjunta de las portadas](cover-review.webp).
- [Auditoría de recursos](asset-audit.json).

Los manifiestos individuales guardan la procedencia de los originales generados. Los consumidores de la app solo usan los WebP exportados al proyecto.

Exportación: `node scripts/pack-slot-identity-v3.cjs --new-only`. Selecciona la portada inglesa cuando existe, busca los espacios transparentes entre piezas del atlas y conserva los adornos completos al exportar.

Revisión: `node scripts/audit-slot-identity-v3.cjs`. Comprueba las 20 portadas, correspondencia entre banner/cover/loading, presencia de controles, transparencia y contenido visible; crea la hoja de contacto.

Este lote conserva los 20 mundos existentes y profundiza su identidad. Los 140 juegos adicionales y el motor 5×3 siguen siendo etapas posteriores.

# Transparent slot symbols

Generated with the built-in `image_gen` image editing tool, with `transparent_background: true` and one original `symbols.webp` atlas per request. Original atlases remain in place. The published files are `apps/web/public/images/slots/{slug}/symbols-transparent.webp` (1536 × 192, eight RGBA cells).

## Main prompt template

Use case: background-extraction. Edit target: {slug} slot atlas attached. Remove ONLY all dark navy/black rectangle backgrounds, horizontal and vertical divider lines and tiny cut-off stray fragments at the edges. Genuine transparent RGBA background. Keep all EIGHT original illustrated symbols, with exactly the same appearance, colors, order left to right, proportions, details. Single horizontal row of eight evenly spaced icons centered in eight equal cells. No rearranging, no new artwork, no text, no drawn checkerboard. Preserve the whole shape and soft luminous outlines of each main object. Output transparent cutouts for use in the existing game.

## Biblioteca Lunar

Use case: background-extraction. Edit target: attached horizontal 8-cell slot sprite atlas Biblioteca Lunar. Remove ONLY the dark navy/black rectangular backgrounds and the thin horizontal divider lines and stray edge fragments. Output genuine transparent RGBA background. Preserve all eight original illustrated symbols exactly: glasses, inkwell, candle, feather, book, owl, star, portal in this exact left-to-right order. Preserve their detail, colors, size, spacing, sharpness, positions, and original single-row 8 equal square-cell atlas layout and aspect ratio (1536x192). No new artwork, no text, no checkerboard drawn into pixels, no rearranging, no clipping symbols. Every background pixel outside the eight objects should be transparent. Intended use: drop-in transparent game sprite atlas.

## Puerto Ámbar (selected retry)

Background extraction only. Remove background from this eight-symbol sprite sheet. TRUE CLEAN TRANSPARENT ALPHA everywhere except the eight illustrated objects, including between them. No white background, no gray background, no navy background, no drop shadows, no glow clouds, no horizontal lines. Exactly eight original objects, same sequence: rolled map, anchor, captain hat, compass, open treasure chest, amber airship, golden star, portal on steps. Preserve all details and shape of the objects. One horizontal row, 8 equally spaced square cells, centered cutouts. Output RGBA transparent PNG.

## Integration

`scripts/pack-transparent-slot-assets.cjs` takes a JSON manifest of `{ slug, source }` records pointing to the generated RGBA cutouts. It normalizes negligible alpha noise, fits each cell into a 176 px square with an 8 px transparent gutter, and exports the eight-cell WebP atlas. `transparent-symbols-audit.json` records dimensions, transparency and size for all final assets. The game catalog references these new assets in reels, rules and bonuses.

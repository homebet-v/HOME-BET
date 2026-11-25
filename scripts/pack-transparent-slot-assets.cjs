// Pack imagegen cutouts into the existing eight-cell sprite layout.
// The original opaque atlases remain untouched.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const audit = [];
  for (const { slug, source } of manifest) {
    const meta = await sharp(source).metadata();
    if (!meta.hasAlpha) throw new Error(`${slug}: no alpha channel`);
    // Quantize imperceptible alpha noise before trimming and atlas export.
    const { data: pixels, info: sourceInfo } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] < 12) pixels[i] = 0;
    const cutouts = await sharp(pixels, { raw: sourceInfo }).png().toBuffer();
    const tiles = [];
    for (let symbol = 0; symbol < 8; symbol++) {
      const left = Math.round(symbol * meta.width / 8);
      const right = Math.round((symbol + 1) * meta.width / 8);
      const cell = await sharp(cutouts)
        .extract({ left, top: 0, width: right - left, height: meta.height }).png().toBuffer();
      const tile = await sharp(cell)
        .trim({ background: '#00000000', threshold: 4 })
        .resize(176, 176, { fit: 'contain', background: '#00000000' })
        .extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#00000000' })
        .png().toBuffer();
      const stats = await sharp(tile).stats();
      if (stats.channels[3].max === 0) throw new Error(`${slug}: empty symbol ${symbol}`);
      tiles.push({ input: tile, left: symbol * 192, top: 0 });
    }
    const destination = path.join('apps/web/public/images/slots', slug, 'symbols-transparent.webp');
    await sharp({ create: { width: 1536, height: 192, channels: 4, background: '#00000000' } })
      .composite(tiles).webp({ quality: 92, alphaQuality: 100, effort: 5 }).toFile(destination);
    const { data, info } = await sharp(destination).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let transparentPixels = 0;
    for (let i = 3; i < data.length; i += info.channels) if (data[i] === 0) transparentPixels++;
    if (transparentPixels < info.width * info.height * 0.3) throw new Error(`${slug}: insufficient transparency`);
    audit.push({ slug, file: destination, width: info.width, height: info.height, transparentPixels, bytes: fs.statSync(destination).size });
  }
  fs.writeFileSync('packages/proveedores/assets/transparent-symbols-audit.json', JSON.stringify(audit, null, 2) + '\n');
  console.log(JSON.stringify({ games: audit.length, symbols: audit.length * 8, totalBytes: audit.reduce((sum, item) => sum + item.bytes, 0) }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

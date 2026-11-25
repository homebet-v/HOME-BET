// Procesamiento de atlas raster generados. No genera ilustraciones ni llama APIs.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
async function main() {
  const manifest = JSON.parse(fs.readFileSync(process.argv[2] || '/tmp/lumen-assets.json', 'utf8'));
  const audit = [];
  for (const item of manifest) {
    const meta = await sharp(item.path).metadata();
    const { data, info } = await sharp(item.path).resize({ width: 240 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let split = item.heroRatio || 0.44;
    if (!item.heroRatio) {
      for (let y = Math.floor(info.height * 0.40); y < info.height * 0.56; y++) {
        let dark = 0;
        for (let x = 0; x < info.width; x++) { const p = (y * info.width + x) * info.channels; if (data[p] + data[p + 1] + data[p + 2] < 110) dark++; }
        if (dark / info.width > 0.92) { split = y / info.height; break; }
      }
    }
    let secondSplit = 0.70;
    for (let y = Math.floor(info.height * 0.63); y < info.height * 0.82; y++) {
      let dark = 0;
      for (let x = 0; x < info.width; x++) { const p = (y * info.width + x) * info.channels; if (data[p] + data[p + 1] + data[p + 2] < 110) dark++; }
      if (dark / info.width > 0.94) { secondSplit = y / info.height; break; }
    }
    const heroHeight = Math.round(meta.height * split);
    const symbolRowBoundary = Math.round(meta.height * secondSplit);
    const dir = path.join('apps/web/public/images/slots', item.slug);
    fs.mkdirSync(dir, { recursive: true });
    const hero = await sharp(item.path).extract({ left: 0, top: 0, width: meta.width, height: heroHeight }).png().toBuffer();
    await sharp(hero).resize(960, 420, { fit: 'cover', position: 'centre' }).webp({ quality: 80, effort: 5 }).toFile(path.join(dir, 'banner.webp'));
    await sharp(hero).resize(384, 480, { fit: 'cover', position: 'attention' }).webp({ quality: 81, effort: 5 }).toFile(path.join(dir, 'cover.webp'));
    await sharp(hero).resize(96, 96, { fit: 'cover', position: 'attention' }).webp({ quality: 85 }).toFile(path.join(dir, 'icon.webp'));
    const sprites = [];
    for (let index = 0; index < 8; index++) {
      const source = index < 6 ? 5 - index : index;
      const x0 = Math.round((source % 4) * meta.width / 4), x1 = Math.round((source % 4 + 1) * meta.width / 4);
      const y0 = source < 4 ? heroHeight : symbolRowBoundary, y1 = source < 4 ? symbolRowBoundary : meta.height;
      const tile = await sharp(item.path).extract({ left: x0 + 2, top: y0 + 2, width: x1 - x0 - 4, height: y1 - y0 - 4 }).resize(192, 192, { fit: 'contain', background: '#03081b' }).png().toBuffer();
      sprites.push({ input: tile, left: index * 192, top: 0 });
    }
    await sharp({ create: { width: 1536, height: 192, channels: 3, background: '#03081b' } }).composite(sprites).webp({ quality: 84, effort: 5 }).toFile(path.join(dir, 'symbols.webp'));
    const bytes = fs.readdirSync(dir).reduce((sum, file) => sum + fs.statSync(path.join(dir, file)).size, 0);
    audit.push({ slug: item.slug, heroRatio: split, secondRowRatio: secondSplit, bytes });
  }
  const root = 'apps/web/public/images/slots';
  await sharp(path.join(root, manifest[0].slug, 'icon.webp')).resize(96, 96).webp({ quality: 85 }).toFile(path.join(root, 'provider-icon.webp'));
  await sharp({ create: { width: 420, height: 96, channels: 4, background: '#00000000' } }).composite([{ input: path.join(root, 'provider-icon.webp'), left: 0, top: 0 }, { input: { text: { text: '<span foreground="#fbbf24">LUMEN STUDIO</span>', font: 'DejaVu Sans Bold 26', rgba: true } }, left: 110, top: 32 }]).webp({ quality: 90 }).toFile(path.join(root, 'provider-logo.webp'));
  fs.writeFileSync('packages/proveedores/assets/asset-audit.json', JSON.stringify(audit, null, 2) + '\n');
  console.log(JSON.stringify({ games: audit.length, totalBytes: audit.reduce((sum, item) => sum + item.bytes, 0), largestBytes: Math.max(...audit.map(item => item.bytes)) }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
async function main() {
  const themes = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const audit = [];
  for (const { motif, source } of themes) {
    const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    // Some generated exports retain a faint matte in nominally transparent
    // gutters. Quantize that export noise before trimming and downsampling.
    let cornerAlpha = 0;
    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
      for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
        const index = (Math.round(row * info.height / 2 + y) * info.width + Math.round(col * info.width / 3 + x)) * 4 + 3;
        cornerAlpha = Math.max(cornerAlpha, data[index]);
      }
    }
    const alphaFloor = cornerAlpha > 12 ? Math.max(160, cornerAlpha + 18) : 12;
    for (let i = 3; i < data.length; i += 4) if (data[i] < alphaFloor) data[i] = 0;
    const normalized = await sharp(data, { raw: info }).png().toBuffer();
    const directory = `apps/web/public/images/slots/controls-v2/${motif}`;
    fs.mkdirSync(directory, { recursive: true });
    for (const [index, name] of ['chip', 'spin', 'button', 'prize-1', 'prize-2', 'prize-3'].entries()) {
      const col = index % 3, row = Math.floor(index / 3);
      const left = Math.round(col * info.width / 3), right = Math.round((col + 1) * info.width / 3);
      const top = Math.round(row * info.height / 2), bottom = Math.round((row + 1) * info.height / 2);
      const tile = await sharp(normalized).extract({ left, top, width: right - left, height: bottom - top }).png().toBuffer();
      const file = path.join(directory, `${name}.webp`);
      const width = name === 'button' ? 640 : name === 'spin' ? 320 : 256;
      const height = name === 'button' ? 144 : width;
      await sharp(tile).trim({ background: '#00000000', threshold: 12 }).resize(width, height, { fit: name === 'button' ? 'fill' : 'contain', background: '#00000000' })
        .webp({ quality: 94, alphaQuality: 100, effort: 5 }).toFile(file);
      const meta = await sharp(file).metadata();
      if (!meta.hasAlpha) throw new Error(`${file}: missing alpha`);
      audit.push({ motif, file, width: meta.width, height: meta.height, bytes: fs.statSync(file).size });
    }
  }
  fs.writeFileSync('packages/proveedores/assets/lumen-polish-control-audit.json', JSON.stringify(audit, null, 2) + '\n');
  console.log(JSON.stringify({ themes: themes.length, assets: audit.length }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

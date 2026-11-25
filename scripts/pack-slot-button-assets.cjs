// Export the two generated control shapes into production-sized transparent assets.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const audit = [];
  for (const { motif, source } of manifest) {
    const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const rowCounts = Array(info.height).fill(0);
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const index = (y * info.width + x) * 4 + 3;
        if (data[index] < 12) data[index] = 0;
        if (data[index] > 128) rowCounts[y]++;
      }
    }
    // Find the transparent gap separating the horizontal and circular control.
    let split = Math.floor(info.height * 0.4);
    for (let y = Math.floor(info.height * 0.32); y < info.height * 0.58; y++) {
      if (rowCounts[y] < rowCounts[split]) split = y;
    }
    const normalized = await sharp(data, { raw: info }).png().toBuffer();
    const directory = path.join('apps/web/public/images/slots/controls', motif);
    fs.mkdirSync(directory, { recursive: true });
    for (const [name, top, height, width, targetHeight] of [
      ['button', 0, split, 640, 160],
      ['spin', split, info.height - split, 256, 256],
    ]) {
      const region = await sharp(normalized).extract({ left: 0, top, width: info.width, height }).png().toBuffer();
      const destination = path.join(directory, `${name}.webp`);
      await sharp(region).trim({ background: '#00000000', threshold: 12 })
        .resize(width, targetHeight, { fit: name === 'button' ? 'fill' : 'contain', background: '#00000000' })
        .webp({ quality: 94, alphaQuality: 100, effort: 5 }).toFile(destination);
      const meta = await sharp(destination).metadata();
      if (!meta.hasAlpha) throw new Error(`${destination}: missing alpha`);
      audit.push({ motif, name, file: destination, width: meta.width, height: meta.height, bytes: fs.statSync(destination).size });
    }
  }
  fs.writeFileSync('packages/proveedores/assets/button-assets-audit.json', JSON.stringify(audit, null, 2) + '\n');
  console.log(JSON.stringify({ themes: manifest.length, assets: audit.length }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

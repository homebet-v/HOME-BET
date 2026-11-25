// Pack the blank imagegen plaques; game names remain live, accessible HTML text.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
async function main() {
  const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const directory = 'apps/web/public/images/slots/titles';
  fs.mkdirSync(directory, { recursive: true });
  const audit = [];
  for (const { motif, source } of manifest) {
    const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 3; i < data.length; i += 4) if (data[i] < 12) data[i] = 0;
    const normalized = await sharp(data, { raw: info }).png().toBuffer();
    const destination = path.join(directory, `${motif}.webp`);
    await sharp(normalized).trim({ background: '#00000000', threshold: 12 })
      .resize(1350, 300, { fit: 'fill' }).webp({ quality: 92, alphaQuality: 100, effort: 5 }).toFile(destination);
    const meta = await sharp(destination).metadata();
    if (!meta.hasAlpha) throw new Error(`${motif}: missing alpha`);
    audit.push({ motif, file: destination, width: meta.width, height: meta.height, bytes: fs.statSync(destination).size });
  }
  fs.writeFileSync('packages/proveedores/assets/title-assets-audit.json', JSON.stringify(audit, null, 2) + '\n');
  console.log(JSON.stringify({ titleFrames: audit.length }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

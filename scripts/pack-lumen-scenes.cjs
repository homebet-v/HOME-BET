const fs = require('node:fs');
const sharp = require('sharp');
async function main() {
  const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const audit = [];
  for (const { slug, source } of manifest) {
    const directory = `apps/web/public/images/slots/${slug}/skin-v2`;
    fs.mkdirSync(directory, { recursive: true });
    const file = `${directory}/scene.webp`;
    await sharp(source).resize(860, 1474, { fit: 'cover' }).webp({ quality: 89, effort: 5 }).toFile(file);
    const meta = await sharp(file).metadata();
    audit.push({ slug, file, width: meta.width, height: meta.height, bytes: fs.statSync(file).size });
  }
  fs.writeFileSync('packages/proveedores/assets/lumen-polish-scenes-audit.json', JSON.stringify(audit, null, 2) + '\n');
  console.log(JSON.stringify({ portraitScenes: audit.length, bytes: audit.reduce((sum, item) => sum + item.bytes, 0) }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

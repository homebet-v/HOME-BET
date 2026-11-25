const fs = require('node:fs');
const sharp = require('sharp');

async function main() {
  const files = Object.fromEntries(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).map((item) => [item.id, item.source]));
  const directory = 'apps/web/public/images/slots/oraculo-coral/skin-v2';
  fs.mkdirSync(directory, { recursive: true });
  await sharp(files.scene).resize(860, 1474, { fit: 'cover' }).webp({ quality: 89, effort: 5 }).toFile(`${directory}/scene.webp`);
  const normalize = async (source) => {
    const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 3; i < data.length; i += 4) if (data[i] < 12) data[i] = 0;
    return { buffer: await sharp(data, { raw: info }).png().toBuffer(), data, info };
  };
  for (const [id, width, height] of [['title', 1350, 300], ['reels', 768, 768]]) {
    const { buffer } = await normalize(files[id]);
    await sharp(buffer).trim({ background: '#00000000', threshold: 12 }).resize(width, height, { fit: 'fill' })
      .webp({ quality: 94, alphaQuality: 100, effort: 5 }).toFile(`${directory}/${id}.webp`);
  }
  const { buffer, data, info } = await normalize(files.controls);
  const rows = Array(info.height).fill(0);
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 128) rows[y]++;
  let split = Math.floor(info.height * 0.4);
  for (let y = Math.floor(info.height * 0.3); y < info.height * 0.55; y++) if (rows[y] < rows[split]) split = y;
  for (const [name, left, top, width, height, outputWidth, outputHeight] of [
    ['button', 0, 0, info.width, split, 640, 144],
    ['chip', 0, split, Math.floor(info.width / 2), info.height - split, 256, 256],
    ['spin', Math.floor(info.width / 2), split, info.width - Math.floor(info.width / 2), info.height - split, 320, 320],
  ]) {
    const part = await sharp(buffer).extract({ left, top, width, height }).png().toBuffer();
    await sharp(part).trim({ background: '#00000000', threshold: 12 }).resize(outputWidth, outputHeight, { fit: name === 'button' ? 'fill' : 'contain', background: '#00000000' })
      .webp({ quality: 94, alphaQuality: 100, effort: 5 }).toFile(`${directory}/${name}.webp`);
  }
  console.log(JSON.stringify(fs.readdirSync(directory).map((file) => ({ file, bytes: fs.statSync(`${directory}/${file}`).size }))));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

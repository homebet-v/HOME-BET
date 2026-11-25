const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const manifestDirectory = 'packages/proveedores/assets/slot-identity-v3';

async function pack(entry) {
  const matches = [...entry.output_hint.matchAll(/(?:\/[^\s`"']+\.(?:png|webp))/g)].map(m => m[0]);
  const source = matches.find(file => fs.existsSync(file));
  if (!source) throw new Error(`Missing generated source: ${entry.slug} ${entry.kind}: ${entry.output_hint}`);
  const directory = `apps/web/public/images/slots/${entry.slug}/identity-v3`;
  fs.mkdirSync(directory, { recursive: true });
  if (entry.kind === 'cover') {
    // Preserve the entire designed logo, never crop a title to another ratio.
    const file = path.join(directory, 'cover.webp');
    await sharp(source).resize(1200, 800, { fit: 'contain', background: '#07101b' }).webp({ quality: 92, effort: 5 }).toFile(file);
    return [{ slug: entry.slug, kind: entry.kind, file, ...(await sharp(file).metadata()) }];
  }
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Remove faint alpha-matte residue in generated export gutters before trim.
  let cornerAlpha = 0;
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) {
      cornerAlpha = Math.max(cornerAlpha, data[(Math.round(row * info.height / 3 + y) * info.width + Math.round(col * info.width / 3 + x)) * 4 + 3]);
    }
  }
  if (cornerAlpha > 225) throw new Error(`Opaque atlas requires regeneration: ${entry.slug}`);
  const alphaFloor = cornerAlpha > 12 ? Math.max(160, cornerAlpha + 18) : 12;
  for (let i = 3; i < data.length; i += 4) if (data[i] < alphaFloor) data[i] = 0;
  const normalized = await sharp(data, { raw: info }).png().toBuffer();
  // Generated sheets respect ordering but gutters can drift from exact thirds.
  // Locate transparent gutters so ornate tips are never clipped by a fixed grid.
  function gutter(axis, fraction, startY = 0, endY = info.height) {
    const length = axis === 'y' ? info.height : info.width;
    const from = Math.floor(length * (fraction - 0.12));
    const to = Math.ceil(length * (fraction + 0.12));
    let best = Math.round(length * fraction), score = Infinity;
    for (let pos = from; pos < to; pos++) {
      let count = 0;
      if (axis === 'y') {
        for (let x = 0; x < info.width; x++) if (data[(pos * info.width + x) * 4 + 3] > alphaFloor) count++;
      } else {
        for (let y = startY; y < endY; y++) if (data[(y * info.width + pos) * 4 + 3] > alphaFloor) count++;
      }
      const candidate = count * 10000 + Math.abs(pos - length * fraction);
      if (candidate < score) { score = candidate; best = pos; }
    }
    return best;
  }
  const rows = [0, gutter('y', 1 / 3), gutter('y', 2 / 3), info.height];
  const columnsFor = row => [0, gutter('x', 1 / 3, rows[row], rows[row + 1]), gutter('x', 2 / 3, rows[row], rows[row + 1]), info.width];
  const tiles = [
    ['title', 0, 0, 3, 1200, 267],
    ['chip', 0, 1, 1, 256, 256], ['spin', 1, 1, 1, 320, 320], ['button', 2, 1, 1, 640, 144],
    ['prize-1', 0, 2, 1, 256, 256], ['prize-2', 1, 2, 1, 256, 256], ['prize-3', 2, 2, 1, 256, 256],
  ];
  const audit = [];
  for (const [name, col, row, cols, width, height] of tiles) {
    const columns = columnsFor(row);
    const left = cols === 3 ? 0 : columns[col], right = cols === 3 ? info.width : columns[col + 1];
    const top = rows[row], bottom = rows[row + 1];
    const tile = await sharp(normalized).extract({ left, top, width: right - left, height: bottom - top }).png().toBuffer();
    const file = path.join(directory, `${name}.webp`);
    await sharp(tile).trim({ background: '#00000000', threshold: 12 }).resize(width, height, { fit: ['title', 'button'].includes(name) ? 'fill' : 'contain', background: '#00000000', kernel: entry.pixel ? 'nearest' : 'lanczos3' }).webp({ quality: 94, alphaQuality: 100, effort: 5, lossless: !!entry.pixel }).toFile(file);
    const metadata = await sharp(file).metadata();
    if (!metadata.hasAlpha) throw new Error(`Missing transparency: ${file}`);
    audit.push({ slug: entry.slug, kind: name, file, width, height, bytes: fs.statSync(file).size });
  }
  return audit;
}
async function main() {
  const entries = fs.readdirSync(manifestDirectory).filter(file => /-(cover(?:-en)?|controls)\.json$/.test(file)).map(file => JSON.parse(fs.readFileSync(path.join(manifestDirectory, file), 'utf8')));
  const selected = new Map();
  for (const entry of entries) {
    const key = `${entry.slug}:${entry.kind}`;
    if (!selected.has(key) || entry.englishName) selected.set(key, entry);
  }
  const stateFile = path.join(manifestDirectory, 'export-state.json');
  const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
  const audit = [];
  for (const entry of selected.values()) {
    const existing = `apps/web/public/images/slots/${entry.slug}/identity-v3/${entry.kind === 'cover' ? 'cover' : 'title'}.webp`;
    const key = `${entry.slug}:${entry.kind}`;
    if (process.argv.includes('--new-only') && fs.existsSync(existing) && state[key] === entry.output_hint) continue;
    audit.push(...await pack(entry));
    state[key] = entry.output_hint;
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');
  }
  fs.writeFileSync(path.join(manifestDirectory, 'latest-export-audit.json'), JSON.stringify(audit, null, 2) + '\n');
  console.log({ sources: entries.length, exportedAssets: audit.length });
}
module.exports = { pack };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });

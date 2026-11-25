const fs = require('node:fs');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const games = require('../packages/proveedores/src/slot-catalog.ts').slotGames.filter(game => game.batch === 1);
async function main() {
  const exportState = JSON.parse(fs.readFileSync('packages/proveedores/assets/slot-identity-v3/export-state.json', 'utf8'));
  const audit = [];
  const covers = [];
  for (const [index, game] of games.entries()) {
    const englishCover = JSON.parse(fs.readFileSync(`packages/proveedores/assets/slot-identity-v3/${game.slug}-cover-en.json`, 'utf8'));
    assert.equal(englishCover.englishName, game.name, `${game.slug}: cover and catalogue name differ`);
    assert.equal(exportState[`${game.slug}:cover`], englishCover.output_hint, `${game.slug}: English cover not exported`);
    assert.equal(game.banner, game.cover);
    assert.equal(game.loading, game.cover);
    const coverFile = `apps/web/public${game.cover}`;
    const cover = await sharp(coverFile).metadata();
    assert.equal(cover.width, 1200); assert.equal(cover.height, 800);
    const coral = game.slug === 'oraculo-coral';
    const directory = `apps/web/public/images/slots/${game.slug}/${coral ? 'skin-v2' : 'identity-v3'}`;
    const names = coral ? ['title', 'chip', 'spin', 'button', 'prize-pearl', 'prize-star', 'prize-crown'] : ['title', 'chip', 'spin', 'button', 'prize-1', 'prize-2', 'prize-3'];
    for (const name of names) {
      const file = `${directory}/${name}.webp`;
      const meta = await sharp(file).metadata();
      assert(meta.hasAlpha, `${file}: missing alpha`);
      const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let transparent = 0, visible = 0;
      for (let i = 3; i < data.length; i += 4) { if (data[i] === 0) transparent++; if (data[i] > 128) visible++; }
      assert(transparent > info.width * info.height * 0.01, `${file}: no transparent margin`);
      assert(visible > info.width * info.height * 0.02, `${file}: empty art`);
    }
    const thumb = await sharp(coverFile).resize(360, 240).png().toBuffer();
    covers.push({ input: thumb, left: (index % 4) * 360, top: Math.floor(index / 4) * 240 });
    audit.push({ slug: game.slug, cover: game.cover, controls: directory, verified: true });
  }
  await sharp({ create: { width: 1440, height: 1200, channels: 3, background: '#07101b' } }).composite(covers).webp({ quality: 92 }).toFile('packages/proveedores/assets/slot-identity-v3/cover-review.webp');
  fs.writeFileSync('packages/proveedores/assets/slot-identity-v3/asset-audit.json', JSON.stringify(audit, null, 2) + '\n');
  console.log({ games: games.length, covers: covers.length, transparentControls: games.length * 7, verified: true });
}
main().catch(error => { console.error(error); process.exitCode = 1; });

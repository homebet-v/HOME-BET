const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { slotGames, slotEditionIIGames, slotEditionIIIGames, slotPlayableGames, slotGameBySlug, slotThemes } = require('../packages/proveedores/src/slot-catalog.ts');
const { slotVisualProfile } = require('../apps/web/lib/slot-visual-profile.ts');
const { slotEngineProfile } = require('../apps/web/lib/slot-engine-profile.ts');
const { slotDemoGames } = require('../apps/web/lib/slot-editions.ts');
const { catalog } = require('../apps/web/lib/fixtures.ts');
assert.equal(slotGames.length, 80);
assert.equal(slotEditionIIGames.length, 80);
assert.equal(slotEditionIIIGames.length, 80);
assert.equal(slotPlayableGames.length, 240);
assert.equal(slotDemoGames, slotPlayableGames);
assert.equal(new Set(slotPlayableGames.map(game => game.slug)).size, 240);
assert.equal(new Set(slotPlayableGames.map(game => game.name)).size, 240);
const entries = catalog.filter(game => game.providerSlug === 'lumen');
assert.equal(entries.length, 240);
for (const runtime of ['slot-3x3', 'slot-5x3', 'slot-5x5']) assert.equal(entries.filter(game => game.runtime === runtime).length, 80);
const modes = [
  { suffix: 'ii', edition: 'II', engine: '5x3', rows: 3, lines: 25, version: '2.0.0-demo' },
  { suffix: 'iii', edition: 'III', engine: '5x5', rows: 5, lines: 50, version: '3.0.0-demo' },
];
const assets = new Set();
for (const base of slotGames) {
  assert.equal(slotGameBySlug(base.slug), base);
  assert.equal(slotEngineProfile(base).id, '3x3');
  const profile = slotVisualProfile(base, slotThemes[base.slug]);
  for (const mode of modes) {
    const edition = slotGameBySlug(`${base.slug}-${mode.suffix}`);
    assert(edition, `${base.slug}: missing edition ${mode.edition}`);
    assert.equal(edition.themeSlug, base.slug);
    assert.equal(edition.engine, mode.engine);
    assert.equal(edition.name, `${base.name} ${mode.edition}`);
    assert.equal(edition.version, mode.version);
    assert.equal(edition.batch, base.batch);
    assert.equal(edition.symbols, base.symbols);
    assert.equal(edition.artStyle, base.artStyle);
    assert.equal(edition.fanArt, base.fanArt);
    assert.equal(edition.symbols.length, 8);
    for (const field of ['sprite', 'cover', 'banner', 'loading', 'icon']) assert.equal(edition[field], base[field]);
    assert.deepEqual(slotVisualProfile(edition, slotThemes[edition.themeSlug]), profile, `${edition.slug}: artwork drift`);
    const engine = slotEngineProfile(edition);
    assert.equal(engine.id, mode.engine); assert.equal(engine.columns, 5); assert.equal(engine.rows, mode.rows); assert.equal(engine.paylines.length, mode.lines);
    assert.equal(engine.initialGrid.length, 5 * mode.rows);
    const entry = entries.find(game => game.slug === edition.slug);
    assert.equal(entry?.runtime, `slot-${mode.engine}`);
    assert.equal(entry?.artStyle, base.artStyle);
    assert.equal(entry?.fanArt, base.fanArt);
    assert(slotDemoGames.some(game => game.slug === edition.slug));
  }
  for (const asset of [base.sprite, base.icon, base.cover, profile.scene, profile.title, profile.spin, profile.chip, profile.button, ...profile.prizeBadges]) {
    const file = `apps/web/public${asset.split('?')[0]}`;
    assert(fs.existsSync(file), `missing ${file}`); assets.add(file);
  }
}
assert.equal(require('../packages/proveedores/src/slot-engine-5x3.ts').TICKET_COUNT, 2751000000);
assert.equal(require('../packages/proveedores/src/slot-engine-5x5.ts').TICKET_COUNT, 5433200000);
assert.equal(slotGames.filter(game => game.artStyle === 'pixel').length, 20);
assert.equal(slotGames.filter(game => game.batch === 4).length, 20);
assert(slotGames.filter(game => game.batch === 4).every(game => !game.fanArt));
assert.equal(slotGames.filter(game => game.fanArt).length, 1);
assert.equal(slotPlayableGames.filter(game => game.fanArt).length, 3);
const css = require('lightningcss');
for (const file of ['apps/web/components/slot-edition-iii.css','apps/web/components/slot-pixel-skin.css','apps/web/components/slot-pop-skin.css']) css.transform({filename:file,code:fs.readFileSync(file)});
console.log({ themes: 80, editionI: 80, editionII: 80, editionIII: 80, playableEditions: 240, existingAssetsVerified: assets.size, sharedArtwork: true, verified: true });

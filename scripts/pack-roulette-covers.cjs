const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const sharp = require('sharp');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

require.extensions['.css'] = () => {};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, file) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    });
    module._compile(outputText, file);
  };
}

const { rouletteThemes } = require('../packages/proveedores/src/roulette-catalog.ts');
const { default: RoulettePlayer } = require('../packages/proveedores/src/roulette-player.tsx');
const publicPath = path.resolve(__dirname, '../apps/web/public');
const clear = '#00000000';
const directions = require('./roulette-cover-directions.cjs');
const svg = (width, height, contents) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${contents}</svg>`
);
const escapeXml = (value) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[char]);

function wheelSvg(theme) {
  const markup = renderToStaticMarkup(React.createElement(RoulettePlayer, { theme }));
  const wheel = markup.match(/<svg viewBox="0 0 320 320"[^>]*>[\s\S]*?<\/svg>/)?.[0];
  if (!wheel) throw new Error(`Rueda no encontrada: ${theme.slug}`);
  const colors = {
    accent: theme.accent, secondary: theme.secondary, surface: theme.surface,
    'wood-light': theme.woodLight, 'wood-dark': theme.woodDark,
    'metal-light': theme.metalLight, 'metal-dark': theme.metalDark,
  };
  return Buffer.from(wheel
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="960" ')
    .replace(/var\(--rg-([\w-]+)(?:,([^)]+))?\)/g, (_, name, fallback) => colors[name] ?? fallback ?? '#ffffff'));
}

const typefaces = {
  regal: ['Liberation Serif', 'bold', 'normal', 1],
  italic: ['Liberation Serif', 'bold', 'italic', 1],
  serif: ['Liberation Serif', 'bold', 'normal', 7],
  modern: ['Cantarell', '900', 'normal', 4],
  speed: ['Liberation Sans', 'bold', 'italic', 0],
  mono: ['Liberation Mono', 'bold', 'normal', 2],
};

const frames = {
  crest: ['M7 47 12 15 37 13 50 4 63 13 88 15 93 47 88 83 50 95 12 83Z', 'M14 26 50 15 86 26M14 74l36 13 36-13'],
  seal: ['M7 22 21 7h58l14 15v56L79 93H21L7 78Z', 'M13 29V23l12-11h16m18 0h16l12 11v6M13 70v7l12 11h16m18 0h16l12-11v-7'],
  vines: ['M3 50Q17 6 50 8 83 6 97 50 83 94 50 92 17 94 3 50Z', 'M7 50Q19 17 38 17 37 27 25 28M93 50Q81 83 62 83 63 73 75 72M38 88Q23 85 21 74M62 12Q77 15 79 26'],
  arch: ['M5 91V40Q12 25 18 23 33 16 50 3 67 16 82 23 88 25 95 40v51Z', 'M9 86V45Q9 35 29 26L50 12l21 14q20 9 20 19v41M9 85h82'],
  prism: ['M2 31 16 10h72l10 21-14 59H12Z', 'M4 52 21 16h62l13 24M5 74l12 11h63l15-28'],
  orbit: ['M5 50C5-5 95-5 95 50S5 105 5 50Z', 'M1 53Q19 90 58 88 84 87 99 60M1 40Q16 13 42 12 82 10 99 47'],
  marquee: ['M5 50Q5 11 22 11h56q17 0 17 39t-17 39H22Q5 89 5 50Z', 'M10 50Q10 17 24 17h52q14 0 14 33T76 83H24Q10 83 10 50Z'],
  signal: ['M5 18 92 8l5 19-4 57-84 9L3 72Z', 'm8 29 82-9m-79 61 76-9m-75 16 66-7'],
  sunset: ['M5 57Q5 9 50 9t45 48v29H5Z', 'M11 72h78M7 78h86M10 85h80'],
  waves: ['M4 46Q13 13 38 16 50 2 62 16 87 13 96 46L90 74Q73 98 50 87 27 98 10 74Z', 'M9 68q11 14 21 6t20 0 20 0 21-6M18 82q12 3 19-1m26 0q7 4 19 1'],
  terminal: ['M4 8h74l18 21v62H22L4 71Z', 'M10 23h77M10 19h2m4 0h2m4 0h2M28 84h59'],
  hazard: ['M4 33 20 9h60l16 24v34L80 91H20L4 67Z', 'M10 66l13 17h53l14-17M11 34l12-17h53l13 17'],
};

async function makeLine(theme, line, type, maxWidth, height) {
  const [family, weight, style, spacing] = typefaces[type];
  const lettering = (y, paint) =>
    `<text x="1200" y="${y}" text-anchor="middle" font-family="${family}" font-weight="${weight}"
      font-style="${style}" font-size="130" letter-spacing="${spacing}" ${paint}>${escapeXml(line)}</text>`;
  return sharp(svg(2400, 186, `
    <defs><linearGradient id="ink" x2="0" y2="1">
      <stop stop-color="#ffffff"/><stop offset=".42" stop-color="${theme.secondary}"/>
      <stop offset=".57" stop-color="${theme.accent}"/><stop offset="1" stop-color="${theme.secondary}"/>
    </linearGradient></defs>
    ${lettering(147, 'fill="#050711" stroke="#050711" stroke-width="17" stroke-linejoin="round"')}
    ${lettering(139, 'fill="url(#ink)" stroke="#10131a" stroke-width="2" paint-order="stroke"')}
  `)).trim({ background: clear }).resize({ width: maxWidth, height, fit: 'inside' }).png().toBuffer();
}

function drawFrame(theme, direction, titleHeight) {
  const [x, y, width] = direction.title;
  const frame = frames[direction.frame];
  const scaleX = (width + 70) / 100;
  const scaleY = (titleHeight + 122) / 100;
  const left = x - scaleX * 50;
  const top = y - scaleY * 50;
  const ornament = frame ? `
    <g transform="translate(${left} ${top}) scale(${scaleX} ${scaleY})">
      <path d="${frame[0]}" fill="url(#enamel)" stroke="${theme.surface}" stroke-width="13" vector-effect="non-scaling-stroke"/>
      <path d="${frame[0]}" fill="none" stroke="url(#edge)" stroke-width="5" vector-effect="non-scaling-stroke"/>
      <path d="${frame[1]}" fill="none" stroke="${theme.secondary}" stroke-opacity=".7"
        stroke-dasharray="${direction.frame === 'marquee' ? '2 5' : 'none'}" stroke-linecap="round" stroke-width="3" vector-effect="non-scaling-stroke"/>
    </g>` : `<path d="M${x - width * .35} ${y + titleHeight / 2 + 18}h${width * .7}" stroke="${theme.secondary}" stroke-width="4"/>`;
  return svg(1200, 800, `
    <defs>
      <linearGradient id="enamel" x2="0" y2="1"><stop stop-color="${theme.felt}"/>
        <stop offset=".54" stop-color="${theme.surface}"/><stop offset="1" stop-color="#050811"/></linearGradient>
      <linearGradient id="edge" x2="0" y2="1"><stop stop-color="${theme.secondary}"/>
        <stop offset=".55" stop-color="${theme.accent}"/><stop offset="1" stop-color="${theme.secondary}"/></linearGradient>
      <radialGradient id="shadow"><stop stop-color="#030509" stop-opacity=".8"/>
        <stop offset="1" stop-color="#030509" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="${x}" cy="${y}" rx="${width * .77}" ry="${Math.max(160, titleHeight * .94)}" fill="url(#shadow)"/>
    ${ornament}
  `);
}

function drawWheel(theme, direction) {
  const [x, y, width, height, angle] = direction.wheel;
  const wheel = wheelSvg(theme).toString().replace('width="960" height="960"', 'width="320" height="320"');
  return svg(1200, 800, `
    <defs>
      <radialGradient id="bloom"><stop stop-color="${theme.accent}" stop-opacity=".48"/>
        <stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/></radialGradient>
      <radialGradient id="ball" cx=".34" cy=".24"><stop stop-color="white"/>
        <stop offset=".56" stop-color="#fff3d2"/><stop offset="1" stop-color="#857459"/></radialGradient>
    </defs>
    <ellipse cx="${x}" cy="${y}" rx="${width * .68}" ry="${height * .78}" fill="url(#bloom)"/>
    <g transform="translate(${x} ${y}) rotate(${angle})">
      <ellipse cy="27" rx="${width * .51}" ry="${height * .49}" fill="#040609" opacity=".77"/>
      <ellipse cy="14" rx="${width * .493}" ry="${height * .493}" fill="${theme.surface}" stroke="${theme.metalDark}" stroke-width="9"/>
      <ellipse cy="8" rx="${width * .493}" ry="${height * .493}" fill="${theme.metalDark}" stroke="${theme.secondary}" stroke-opacity=".55" stroke-width="4"/>
      <g transform="scale(${width / 320} ${height / 320}) translate(-160 -160)">${wheel}</g>
      <circle cx="${width * .24}" cy="${height * .199}" r="${width * .016}" fill="url(#ball)"/>
    </g>
  `);
}

async function cover(theme, direction) {
  const [x, y, width, lines] = direction.title;
  const words = lines.split('|');
  const tallest = words.length === 1 ? 145 : 113;
  const titles = await Promise.all(words.map(line => makeLine(theme, line.toUpperCase(), direction.type, width, tallest)));
  const sizes = await Promise.all(titles.map(title => sharp(title).metadata()));
  const gap = 8;
  const titleHeight = sizes.reduce((total, size) => total + size.height, 0) + gap * (sizes.length - 1);
  let nextTop = Math.round(y - titleHeight / 2);
  const lettering = titles.map((input, index) => {
    const size = sizes[index];
    const position = { input, left: Math.round(x - size.width / 2), top: nextTop };
    nextTop += size.height + gap;
    return position;
  });
  const background = await sharp(path.join(publicPath, theme.scene))
    .resize(1200, 800, { fit: 'cover', position: 'north' })
    .modulate({ brightness: .86, saturation: 1.1 }).toBuffer();

  await sharp(background).composite([
    { input: drawWheel(theme, direction) },
    { input: drawFrame(theme, direction, titleHeight) },
    ...lettering,
  ]).webp({ quality: 91 }).toFile(path.join(publicPath, path.dirname(theme.scene), 'cover-v2.webp'));
}

async function main() {
  const only = process.argv[2];
  const themes = rouletteThemes.filter(theme => directions[theme.slug] && (!only || theme.slug === only));
  if (!themes.length) throw new Error('No hay portadas para generar.');
  for (const theme of themes) {
    const direction = directions[theme.slug];
    if (!direction) throw new Error(`Falta la dirección de arte de ${theme.slug}`);
    await cover(theme, direction);
  }
  console.log(`Portadas generadas: ${themes.length}`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });

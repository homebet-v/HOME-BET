const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript'),sharp=require('sharp'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),css=require('lightningcss');
require.extensions['.css']=()=>{};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const {rouletteThemes,ROULETTE_LAYOUTS}=require('../packages/proveedores/src/roulette-catalog.ts');
const {default:Player}=require('../packages/proveedores/src/roulette-player.tsx');
const {ROULETTE_SPOTS}=require('../packages/proveedores/src/roulette-engine.ts');
async function main(){
 assert.equal(rouletteThemes.length,40);assert.equal(ROULETTE_LAYOUTS.length,4);assert(ROULETTE_LAYOUTS.every(layout=>rouletteThemes.filter(theme=>theme.layout===layout.id).length===10));
 const covers=[],controls=[],scenes=[],wheels=[],audit=[],seenControls=new Set();
 for(const [i,theme]of rouletteThemes.entries()){
  const html=renderToStaticMarkup(React.createElement(Player,{theme}));assert(html.includes(`data-theme="${theme.slug}"`));assert(html.includes(`data-layout="${theme.layout}"`));assert(html.includes(`${theme.name}, ruleta europea demo`));assert.equal((html.match(/<text /g)||[]).length,37);assert(html.includes('Elegir ficha: 50 fichas'));
  for(let n=0;n<37;n++)assert(html.includes(`fichas a ${n}"`),`${theme.slug}: missing number ${n}`);
  for(const spot of ROULETTE_SPOTS.filter(s=>s.kind==='outside'))assert(html.includes(`fichas a ${spot.label}`));
  if(theme.layout==='alternating'){assert(html.includes('Hacer apuestas'));assert(html.includes('Ver rueda'));assert(html.includes('aria-hidden="true"'));}
  if(theme.layout==='compact')assert(html.includes('Tablero completo ↗'));
  const root=`apps/web/public${theme.artRoot}`;
  const {width:coverWidth,height:coverHeight}=await sharp(`apps/web/public${theme.cover}`).metadata();
  assert.deepEqual([coverWidth,coverHeight],theme.coverFormat==='portrait'?[800,1000]:[1200,800]);
  assert.equal((await sharp(`apps/web/public${theme.scene}`).metadata()).height,1720);
  covers.push({input:await sharp(`apps/web/public${theme.cover}`).resize(240,160,{fit:'contain',background:'#0e1720'}).png().toBuffer(),left:i%5*240,top:Math.floor(i/5)*160});
  scenes.push({input:await sharp(`apps/web/public${theme.scene}`).resize(120,240).png().toBuffer(),left:i%5*120,top:Math.floor(i/5)*240});
  const controlRow=seenControls.size;if(!seenControls.has(root))for(const [j,name]of ['undo-v2','spin-v2','repeat-v2','chip-0-v2','chip-1-v2','chip-2-v2','chip-3-v2'].entries()){
   const file=`${root}/${name}.webp`,meta=await sharp(file).metadata(),stats=await sharp(file).stats();assert(meta.hasAlpha);assert.equal(stats.channels[3].min,0);assert(stats.channels[3].max>200);
   controls.push({input:await sharp(file).resize(180,130,{fit:'contain',background:'#0e1720'}).png().toBuffer(),left:j*180,top:controlRow*130});
  }
  seenControls.add(root);
  let svg=html.slice(html.indexOf('<svg viewBox="0 0 320 320"'),html.indexOf('</svg>',html.indexOf('<svg viewBox="0 0 320 320"'))+6);
  const variables={'--rg-wood-light':theme.woodLight,'--rg-wood-dark':theme.woodDark,'--rg-metal-light':theme.metalLight,'--rg-metal-dark':theme.metalDark,'--rg-accent':theme.accent,'--rg-secondary':theme.secondary};svg=svg.replace(/var\((--[\w-]+)(?:,([^)]+))?\)/g,(_,key,fallback)=>variables[key]??fallback??'#fff').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
  wheels.push({input:await sharp(Buffer.from(svg)).resize(160,160).png().toBuffer(),left:i%5*160,top:Math.floor(i/5)*160});
  audit.push({slug:theme.slug,layout:theme.layout,assets:9,rendered:true});
 }
 const folder='packages/proveedores/assets/roulette-themes-v2';for(const [file,width,height,items]of [['collection-covers-review.webp',1200,1280,covers],['family-controls-review.webp',1260,520,controls],['collection-scenes-review.webp',600,1920,scenes],['collection-wheels-review.webp',800,1280,wheels]])await sharp({create:{width,height,channels:3,background:'#0e1720'}}).composite(items).webp({quality:94}).toFile(`${folder}/${file}`);
 for(const file of ['roulette-player.css','roulette-royal-skin.css','roulette-layouts.css'])css.transform({filename:file,code:fs.readFileSync(`packages/proveedores/src/${file}`),errorRecovery:false});
 fs.writeFileSync(`${folder}/asset-audit.json`,JSON.stringify({themes:audit,usedAssets:108,plannedThemes:40,plannedPerLayout:10,verified:true},null,2));console.log({themes:40,layouts:4,usedAssets:108,rendered:true,css:true,verified:true});
}
main().catch(e=>{console.error(e);process.exitCode=1});

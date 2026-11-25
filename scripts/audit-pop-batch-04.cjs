const fs=require('node:fs');
const assert=require('node:assert/strict');
const sharp=require('sharp');
const ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const directory='packages/proveedores/assets/pop-batch-04';
async function main(){
 const {slotBatch04Games:games,slotBatch04Themes:themes}=require('../packages/proveedores/src/slot-batch-04.ts');
 assert.equal(games.length,20);assert.equal(Object.keys(themes).length,20);assert.equal(games.filter(game=>game.fanArt).length,0);
 assert.equal(new Set(games.map(game=>game.slug)).size,20);
 const covers=[],symbols=[],controls=[],scenes=[],audit=[];
 for(const[index,game]of games.entries()){
  assert(['jewel','comic','neon'].includes(game.artStyle));assert.equal(game.batch,4);assert.equal(game.symbols.length,8);assert(['sine','triangle','square'].includes(themes[game.slug].voice));assert(themes[game.slug].bonus.symbol>=0&&themes[game.slug].bonus.symbol<6);
  const root=`apps/web/public/images/slots/${game.slug}`;
  const cover=await sharp(`apps/web/public${game.cover}`).metadata();assert.equal(cover.width,1200);assert.equal(cover.height,800);
  const scene=await sharp(`${root}/skin-v2/scene.webp`).metadata();assert.equal(scene.width,860);assert.equal(scene.height,1474);
  assert(fs.existsSync(`apps/web/public${game.icon}`));
  const {data,info}=await sharp(`apps/web/public${game.sprite}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(info.width,1536);assert.equal(info.height,192);
  for(let symbol=0;symbol<8;symbol++){
   let visible=0,transparent=0;
   for(let y=0;y<192;y++)for(let x=0;x<192;x++){
    const alpha=data[(y*1536+symbol*192+x)*4+3];if(alpha>128)visible++;if(alpha===0)transparent++;
    if(x<8||x>=184||y<8||y>=184)assert(alpha<12,`${game.slug} symbol ${symbol}: gutter bleed`);
   }
   assert(visible>192*192*0.02,`${game.slug}: empty symbol ${symbol}`);assert(transparent>192*192*0.2,`${game.slug}: opaque backdrop ${symbol}`);
  }
  covers.push({input:await sharp(`apps/web/public${game.cover}`).resize(360,240).png().toBuffer(),left:index%4*360,top:Math.floor(index/4)*240});
  symbols.push({input:await sharp(`apps/web/public${game.sprite}`).resize(1280,160).png().toBuffer(),left:0,top:index*160});
  scenes.push({input:await sharp(`${root}/skin-v2/scene.webp`).resize(172,295).png().toBuffer(),left:index%5*172,top:Math.floor(index/5)*295});
  for(const[j,name]of ['title','chip','spin','button','prize-1','prize-2','prize-3'].entries()){
   const file=`${root}/identity-v3/${name}.webp`;const metadata=await sharp(file).metadata();assert(metadata.hasAlpha,`${file}: missing alpha`);
   const stats=await sharp(file).stats();assert(stats.channels[3].min===0&&stats.channels[3].max>128,`${file}: missing transparency or art`);
   controls.push({input:await sharp(file).resize(160,120,{fit:'contain',background:'#101b2a'}).png().toBuffer(),left:j*160,top:index*120});
  }
  audit.push({slug:game.slug,name:game.name,artStyle:game.artStyle,fanArt:game.fanArt,symbols:8,controls:7,verified:true});
 }
 for(const[name,items,width,height]of [['covers-review',covers,1440,1200],['symbols-review',symbols,1280,3200],['controls-review',controls,1120,2400],['scenes-review',scenes,860,1180]])await sharp({create:{width,height,channels:3,background:'#101b2a'}}).composite(items).webp({lossless:true}).toFile(`${directory}/${name}.webp`);
 fs.writeFileSync(`${directory}/asset-audit.json`,JSON.stringify({popThemes:20,fanArtThemes:0,originalThemes:20,audit},null,2)+'\n');
 console.log({popThemes:20,fanArtThemes:0,originalThemes:20,symbols:160,controls:140,verified:true});
}
main().catch(error=>{console.error(error);process.exitCode=1;});

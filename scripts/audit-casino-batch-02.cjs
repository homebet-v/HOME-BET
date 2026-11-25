const fs=require('node:fs');
const assert=require('node:assert/strict');
const sharp=require('sharp');
const directory='packages/proveedores/assets/casino-batch-02';
async function main(){
 const ts=require('typescript');
 require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
 const {slotGames:catalogThemes,slotThemes}=require('../packages/proveedores/src/slot-catalog.ts');
 const all=catalogThemes.filter(game=>game.batch<=2);
 const {slotBatch02Games,slotBatch02Themes}=require('../packages/proveedores/src/slot-batch-02.ts');
 const original=all.filter(game=>game.batch===1);
 for(const game of all)assert(slotThemes[game.slug],`${game.slug}: missing runtime theme`);
 assert.equal(original.length,20);assert.equal(slotBatch02Games.length,20);assert.equal(all.length,40);
 assert.equal(new Set(all.map(g=>g.slug)).size,40,'duplicate slug');
 assert.equal(new Set(all.map(g=>g.name)).size,40,'duplicate name');
 const audit=[],covers=[],symbols=[],controls=[],scenes=[];
 for(const game of all){
  for(const asset of [game.cover,game.banner,game.loading,game.sprite,game.icon])assert(fs.existsSync(`apps/web/public${asset}`),`${game.slug}: missing ${asset}`);
  const coral=game.slug==='oraculo-coral';const root=`apps/web/public/images/slots/${game.slug}`;
  const skin=`${root}/${coral?'skin-v2':'identity-v3'}`;
  for(const name of ['title','chip','spin','button',...(coral?['prize-pearl','prize-star','prize-crown']:['prize-1','prize-2','prize-3'])]){
   const file=`${skin}/${name}.webp`;const meta=await sharp(file).metadata();assert(meta.hasAlpha,`${file}: missing alpha`);
  }
  const scene=await sharp(`${root}/skin-v2/scene.webp`).metadata();assert.equal(scene.width,860);assert.equal(scene.height,1474);
  assert.equal(game.symbols.length,8);assert(game.symbols.every(s=>typeof s==='string'&&s.length));
  if(game.batch!==2)continue;
  const theme=slotBatch02Themes[game.slug];assert(theme,`${game.slug}: missing theme`);assert(Number.isInteger(theme.bonus.symbol)&&theme.bonus.symbol>=0&&theme.bonus.symbol<6);
  assert.equal(game.banner,game.cover);assert.equal(game.loading,game.cover);
  const cover=await sharp(`apps/web/public${game.cover}`).metadata();assert.equal(cover.width,1200);assert.equal(cover.height,800);
  const {data,info}=await sharp(`apps/web/public${game.sprite}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,1536);assert.equal(info.height,192);
  for(let symbol=0;symbol<8;symbol++){
   let visible=0,transparent=0;
   for(let y=0;y<192;y++)for(let x=0;x<192;x++){
    const alpha=data[(y*1536+symbol*192+x)*4+3];if(alpha>128)visible++;if(alpha===0)transparent++;
    if(x<8||x>=184||y<8||y>=184)assert(alpha<12,`${game.slug} symbol ${symbol}: gutter bleed`);
   }
   assert(visible>192*192*0.03,`${game.slug}: empty symbol ${symbol}`);assert(transparent>192*192*0.2,`${game.slug}: background rectangle ${symbol}`);
  }
  const index=audit.length;
  covers.push({input:await sharp(`apps/web/public${game.cover}`).resize(360,240).png().toBuffer(),left:index%4*360,top:Math.floor(index/4)*240});
  symbols.push({input:await sharp(`apps/web/public${game.sprite}`).resize(1280,160).png().toBuffer(),left:0,top:index*160});
  scenes.push({input:await sharp(`${root}/skin-v2/scene.webp`).resize(172,295).png().toBuffer(),left:index%5*172,top:Math.floor(index/5)*295});
  for(const [j,name]of ['title','chip','spin','button','prize-1','prize-2','prize-3'].entries())controls.push({input:await sharp(`${skin}/${name}.webp`).resize(160,120,{fit:'contain',background:'#101b2a'}).png().toBuffer(),left:j*160,top:index*120});
  audit.push({slug:game.slug,name:game.name,symbols:8,controls:7,verified:true});
 }
 for(const [name,items,width,height]of [['covers-review',covers,1440,1200],['symbols-review',symbols,1280,3200],['controls-review',controls,1120,2400],['scenes-review',scenes,860,1180]])await sharp({create:{width,height,channels:3,background:'#101b2a'}}).composite(items).webp({quality:92}).toFile(`${directory}/${name}.webp`);
 fs.writeFileSync(`${directory}/asset-audit.json`,JSON.stringify({totalGames:40,batchGames:20,audit},null,2)+'\n');
 console.log({totalGames:40,newGames:20,newSymbols:160,newControls:140,verified:true});
}
main().catch(error=>{console.error(error);process.exitCode=1;});

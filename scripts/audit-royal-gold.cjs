const fs=require('node:fs');
const assert=require('node:assert/strict');
const ts=require('typescript');
const postcss=require('postcss');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
require.extensions['.css']=()=>{};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const {default:Player}=require('../packages/proveedores/src/roulette-player.tsx');
const {EUROPEAN_WHEEL,ROULETTE_SPOTS,rouletteColor}=require('../packages/proveedores/src/roulette-engine.ts');
const {rouletteSpinMotion}=require('../packages/proveedores/src/roulette-motion.ts');
const html=renderToStaticMarkup(React.createElement(Player));
assert(html.includes('Royal Gold, ruleta europea demo'));
assert(html.includes('10.000'));assert(html.includes('Ampliar / combinar'));
assert.equal((html.match(/<text /g)||[]).length,37);
for(let n=0;n<37;n++)assert(html.includes(`fichas a ${n}&quot;`)||html.includes(`fichas a ${n}"`),`missing number ${n}`);
for(let index=0;index<37;index++){
 const n=EUROPEAN_WHEEL[index],step=360/37;
 for(const landing of [0,90,180,270]){
  const motion=rouletteSpinMotion(n,0,0,landing);
  const angle=((index*step+motion.wheelDegrees-motion.ballDegrees)%360+360)%360;
  assert(Math.min(angle,360-angle)<1e-7,`ball alignment ${n} at ${landing}`);
 }
 if(n!==0)assert.notEqual(rouletteColor(n),'green');
}
assert(fs.existsSync('apps/web/app/s/home/juegos/ruleta/page.tsx'));
assert(fs.existsSync('apps/web/public/images/roulette/royal-gold/scene.webp'));
postcss.parse(fs.readFileSync('packages/proveedores/src/roulette-player.css','utf8'));
postcss.parse(fs.readFileSync('packages/proveedores/src/roulette-royal-skin.css','utf8'));
console.log({roulette:'Royal Gold',pockets:37,betTypes:8,betSpots:ROULETTE_SPOTS.length,rendered:true,cssParsed:true,allWheelTargetsAligned:true});
async function auditArtwork(){
 const sharp=require('sharp');
 const root='apps/web/public/images/roulette/royal-gold';
 const names=['title-v2','undo-v2','spin-v2','repeat-v2','chip-0-v2','chip-1-v2','chip-2-v2','chip-3-v2','frame-v2'];
 for(const name of names){
  const image=sharp(`${root}/${name}.webp`),metadata=await image.metadata(),stats=await image.stats();
  assert(metadata.hasAlpha,`${name}: alpha`);assert.equal(stats.channels[3].min,0,`${name}: clear gutters`);assert(stats.channels[3].max>200,`${name}: visible art`);
 }
 const center=await sharp(`${root}/frame-v2.webp`).extract({left:440,top:890,width:20,height:20}).ensureAlpha().raw().toBuffer();
 for(let i=3;i<center.length;i+=4)assert.equal(center[i],0,'frame must not cover gameplay');
 console.log({illustratedAssets:names.length,alphaVerified:true,transparentFrameCenter:true});
}
auditArtwork().catch(error=>{console.error(error);process.exitCode=1});

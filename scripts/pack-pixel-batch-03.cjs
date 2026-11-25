const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { pack: packControls } = require('./pack-slot-identity-v3.cjs');
const manifestDirectory = 'packages/proveedores/assets/pixel-batch-03';

function sourceFor(entry) {
  if (entry.source && fs.existsSync(entry.source)) return entry.source;
  const files = [...entry.output_hint.matchAll(/(?:\/[^\s`"']+\.(?:png|webp))/g)].map(m => m[0]);
  const source = files.find(file => fs.existsSync(file));
  if (!source) throw new Error(`Missing generated source: ${entry.slug} ${entry.kind}`);
  return source;
}
async function packSymbols(entry, source) {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const corners = [];
  for (let row = 0; row < 2; row++) for (let col = 0; col < 4; col++) {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) corners.push(data[(Math.round(row * info.height / 2 + y) * info.width + Math.round(col * info.width / 4 + x)) * 4 + 3]);
  }
  corners.sort((a,b)=>a-b);
  const matte = corners[Math.floor(corners.length / 2)];
  if (matte > 225) throw new Error(`Opaque symbols: ${entry.slug}`);
  const floor = matte > 12 ? Math.max(160, matte + 18) : 12;
  for (let i = 3; i < data.length; i += 4) if (data[i] < floor) data[i] = 0;
  const normalized = await sharp(data, { raw: info }).png().toBuffer();
  function gutter(axis, fraction, yStart=0, yEnd=info.height) {
    const length = axis === 'y' ? info.height : info.width;
    let best = Math.round(length * fraction), score = Infinity;
    for (let pos = Math.floor(length * (fraction - 0.06)); pos < Math.ceil(length * (fraction + 0.06)); pos++) {
      let count=0;
      if(axis==='y') {for(let x=0;x<info.width;x++) if(data[(pos*info.width+x)*4+3]>floor)count++;}
      else {for(let y=yStart;y<yEnd;y++) if(data[(y*info.width+pos)*4+3]>floor)count++;}
      const candidate=count*10000+Math.abs(pos-length*fraction);
      if(candidate<score){score=candidate;best=pos;}
    }
    return best;
  }
  const rows=[0,gutter('y',0.5),info.height];
  const tiles=[];
  const directory=`apps/web/public/images/slots/${entry.slug}`;
  fs.mkdirSync(directory,{recursive:true});
  for(let index=0;index<8;index++) {
    const row=Math.floor(index/4),col=index%4;
    const columns=[0,...[0.25,0.5,0.75].map(f=>gutter('x',f,rows[row],rows[row+1])),info.width];
    const cell=await sharp(normalized).extract({left:columns[col],top:rows[row],width:columns[col+1]-columns[col],height:rows[row+1]-rows[row]}).png().toBuffer();
    const tile=await sharp(cell).trim({background:'#00000000',threshold:12}).resize(176,176,{fit:'contain',background:'#00000000',kernel:'nearest'}).extend({top:8,bottom:8,left:8,right:8,background:'#00000000'}).png().toBuffer();
    const stats=await sharp(tile).stats();
    if(stats.channels[3].max===0)throw new Error(`${entry.slug}: empty symbol ${index}`);
    tiles.push({input:tile,left:index*192,top:0});
    if(index===5)await sharp(tile).webp({quality:94,alphaQuality:100,lossless:true}).toFile(`${directory}/icon${entry.revision ? `-v${entry.revision}` : ""}.webp`);
  }
  const file=`${directory}/symbols-transparent${entry.revision ? `-v${entry.revision}` : ""}.webp`;
  await sharp({create:{width:1536,height:192,channels:4,background:'#00000000'}}).composite(tiles).webp({quality:94,alphaQuality:100,effort:5,lossless:true}).toFile(file);
  return [{slug:entry.slug,kind:'symbols',file,width:1536,height:192}];
}
async function pack(entry) {
  entry = { ...entry, pixel: true };
  const source=sourceFor(entry);
  if(entry.kind==='controls')return packControls(entry);
  if(entry.kind==='symbols')return packSymbols(entry,source);
  const directory=`apps/web/public/images/slots/${entry.slug}/${entry.kind==='scene'?'skin-v2':'identity-v3'}`;
  fs.mkdirSync(directory,{recursive:true});
  const file=path.join(directory,entry.kind==='scene'?'scene.webp':'cover.webp');
  const width=entry.kind==='scene'?860:1200,height=entry.kind==='scene'?1474:800;
  await sharp(source).resize(width,height,{fit:entry.kind==='scene'?'cover':'contain',background:'#07101b',kernel:'nearest'}).webp({quality:92,effort:5,lossless:true}).toFile(file);
  return [{slug:entry.slug,kind:entry.kind,file,width,height}];
}
async function main(){
  const entries=fs.readdirSync(manifestDirectory).filter(file=>/-(cover|symbols|controls|scene)\.json$/.test(file)).map(file=>JSON.parse(fs.readFileSync(path.join(manifestDirectory,file),'utf8')));
  const stateFile=path.join(manifestDirectory,'export-state.json');
  const state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{};
  const audit=[];const errors=[];
  for(const entry of entries){
    const key=`${entry.slug}:${entry.kind}`;
    if(process.argv.includes('--new-only')&&state[key]===entry.output_hint)continue;
    try{audit.push(...await pack(entry));state[key]=entry.output_hint;fs.writeFileSync(stateFile,JSON.stringify(state,null,2)+'\n');}
    catch(error){errors.push({slug:entry.slug,kind:entry.kind,error:String(error)});}
  }
  fs.writeFileSync(path.join(manifestDirectory,'export-audit.json'),JSON.stringify({audit,errors},null,2)+'\n');
  console.log({sources:entries.length,exportedAssets:audit.length,errors});
  if(errors.length)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});

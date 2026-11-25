const fs=require('node:fs');
const sharp=require('sharp');
const folder='packages/proveedores/assets/roulette-pilot';
function source(entry){const paths=[...entry.output_hint.matchAll(/(?:\/[^\s`"']+\.(?:png|webp))/g)].map(x=>x[0]);const file=paths.find(p=>fs.existsSync(p));if(!file)throw Error(`Source missing: ${entry.slug} ${entry.kind}`);return file}
async function main(){
 const files=fs.readdirSync(folder).filter(n=>/-(cover|scene|controls)\.json$/.test(n));
 const audit=[];
 for(const name of files){
  const entry=JSON.parse(fs.readFileSync(`${folder}/${name}`)),input=source(entry),root=`apps/web/public/images/roulette/${entry.slug}`;fs.mkdirSync(root,{recursive:true});
  if(entry.kind==='cover'){await sharp(input).resize(1200,800,{fit:'contain',background:'#070c14'}).webp({quality:93}).toFile(`${root}/cover.webp`);audit.push(`${root}/cover.webp`);continue;}
  if(entry.kind==='scene'){await sharp(input).resize(860,1720,{fit:'cover'}).webp({quality:89}).toFile(`${root}/scene.webp`);audit.push(`${root}/scene.webp`);continue;}
  const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});for(let i=3;i<data.length;i+=4)if(data[i]<32)data[i]=0;
  function gutter(axis,fraction,y0=0,y1=info.height){let best=Math.round((axis==='y'?info.height:info.width)*fraction),score=Infinity;const length=axis==='y'?info.height:info.width;for(let p=Math.floor(length*(fraction-.07));p<Math.ceil(length*(fraction+.07));p++){let current=0;if(axis==='y'){for(let x=0;x<info.width;x++)current+=data[(p*info.width+x)*4+3]}else for(let y=y0;y<y1;y++)current+=data[(y*info.width+p)*4+3];current+=Math.abs(p-length*fraction)*.00001;if(current<score){score=current;best=p}}return best;}
  const middle=gutter('y',.5),upper=[0,gutter('x',1/3,0,middle),gutter('x',2/3,0,middle),info.width],lower=[0,...[.25,.5,.75].map(v=>gutter('x',v,middle,info.height)),info.width];const normalized=await sharp(data,{raw:info}).png().toBuffer();
  const cells=[];for(let i=0;i<3;i++)cells.push({name:['undo-v2','spin-v2','repeat-v2'][i],left:upper[i],top:0,width:upper[i+1]-upper[i],height:middle,outWidth:600,outHeight:260});for(let i=0;i<4;i++)cells.push({name:`chip-${i}-v2`,left:lower[i],top:middle,width:lower[i+1]-lower[i],height:info.height-middle,outWidth:256,outHeight:256});
  for(const c of cells){const tile=await sharp(normalized).extract({left:c.left,top:c.top,width:c.width,height:c.height}).png().toBuffer();const file=`${root}/${c.name}.webp`;await sharp(tile).trim({threshold:15}).resize(c.outWidth-8,c.outHeight-8,{fit:'contain',background:'#00000000'}).extend({top:4,bottom:4,left:4,right:4,background:'#00000000'}).webp({quality:94,alphaQuality:100}).toFile(file);audit.push(file)}
 }
 fs.writeFileSync(`${folder}/export-audit.json`,JSON.stringify({sources:files.length,files:audit},null,2));console.log({sources:files.length,exported:audit.length});
}
main().catch(error=>{console.error(error);process.exitCode=1});

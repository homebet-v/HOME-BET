const fs=require('node:fs');
const sharp=require('sharp');
const root='apps/web/public/images/roulette/royal-gold';
const assets='packages/proveedores/assets/royal-gold';
function source(kind){const entry=JSON.parse(fs.readFileSync(`${assets}/${kind}-prompt.json`));const paths=[...entry.output_hint.matchAll(/(?:\/[^\s`"']+\.(?:png|webp))/g)].map(x=>x[0]);return paths.find(p=>fs.existsSync(p));}
async function main(){
 fs.mkdirSync(root,{recursive:true});
 const {data,info}=await sharp(source('controls-v2')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=3;i<data.length;i+=4)if(data[i]<32)data[i]=0;
 function gutter(axis,fraction,y0=0,y1=info.height){
  const length=axis==='y'?info.height:info.width;let best=Math.round(length*fraction),score=Infinity;
  for(let p=Math.round(length*(fraction-.08));p<Math.round(length*(fraction+.08));p++){
   let current=0;
   if(axis==='y'){for(let x=0;x<info.width;x++)current+=data[(p*info.width+x)*4+3];}
   else{for(let y=y0;y<y1;y++)current+=data[(y*info.width+p)*4+3];}
   current+=Math.abs(p-length*fraction)*.00001;
   if(current<score){score=current;best=p;}
  }return best;
 }
 const rows=[0,gutter('y',1/3),gutter('y',2/3),info.height];
 const normalized=await sharp(data,{raw:info}).png().toBuffer();
 const cells=[{name:'title-v2',x0:0,x1:info.width,y0:0,y1:rows[1],width:1200,height:420}];
 const cols=[0,gutter('x',1/3,rows[1],rows[2]),gutter('x',2/3,rows[1],rows[2]),info.width];
 for(let i=0;i<3;i++)cells.push({name:['undo-v2','spin-v2','repeat-v2'][i],x0:cols[i],x1:cols[i+1],y0:rows[1],y1:rows[2],width:600,height:260});
 for(let i=0;i<4;i++)cells.push({name:`chip-${i}-v2`,x0:Math.round(i*info.width/4),x1:Math.round((i+1)*info.width/4),y0:rows[2],y1:rows[3],width:256,height:256});
 for(const c of cells){const tile=await sharp(normalized).extract({left:c.x0,top:c.y0,width:c.x1-c.x0,height:c.y1-c.y0}).png().toBuffer();await sharp(tile).trim({threshold:15}).resize(c.width-8,c.height-8,{fit:'contain',background:'#00000000'}).extend({top:4,bottom:4,left:4,right:4,background:'#00000000'}).webp({quality:94,alphaQuality:100}).toFile(`${root}/${c.name}.webp`);}
 await sharp(source('frame-v2')).resize(900,1800,{fit:'fill'}).webp({quality:94,alphaQuality:100}).toFile(`${root}/frame-v2.webp`);
 const review=await Promise.all(cells.map(async(c,i)=>({input:await sharp(`${root}/${c.name}.webp`).resize(360,160,{fit:'contain',background:'#23100c'}).png().toBuffer(),left:i%2*360,top:Math.floor(i/2)*160})));
 await sharp({create:{width:720,height:640,channels:3,background:'#23100c'}}).composite(review).webp({quality:94}).toFile(`${assets}/controls-v2-review.webp`);
 console.log({exported:9,rows,buttonsColumns:cols});
}
main().catch(e=>{console.error(e);process.exitCode=1});

const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');

async function main(){
 const [slug,input]=process.argv.slice(2);
 if(!slug||!input||!fs.existsSync(input))throw Error('Uso: node scripts/pack-roulette-theme-scene.cjs <slug> <imagen-generada>');
 if(!/^[a-z0-9-]+$/.test(slug))throw Error(`Slug inválido: ${slug}`);
 const directory=path.join('apps/web/public/images/roulette',slug);
 fs.mkdirSync(directory,{recursive:true});
 const scene=path.join(directory,'scene.webp'),cover=path.join(directory,'cover.webp');
 if(fs.existsSync(scene)||fs.existsSync(cover))throw Error(`Ya existe arte para ${slug}; no se sobrescribe.`);
 await sharp(input).resize(860,1720,{fit:'cover'}).webp({quality:89,effort:5}).toFile(scene);
 await sharp(input).resize(1200,800,{fit:'cover',position:'top'}).webp({quality:92,effort:5}).toFile(cover);
 process.stdout.write(`${slug}: ${scene}, ${cover}\n`);
}
main().catch(error=>{console.error(error);process.exitCode=1});

import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require('sharp');
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
// Lossless compression preserves the supplied illustrations, portraits and client marks.
let saved=0;
for(const directory of ['public/assets/clients','public/assets/team','public/brand']) {
 for(const name of await readdir(directory)) {
  if(!/\.(png|jpg)$/.test(name) || name==='yoo360-og.png') continue;
  const source=directory+'/'+name, output=source.replace(/\.(png|jpg)$/,'.webp');
  const bytes=await sharp(source).webp({lossless:true,effort:6}).toBuffer();
  const size=(await stat(source)).size;
  if(bytes.length>=size) continue;
  await writeFile(output,bytes); saved+=size-bytes.length;
  // Only update source references. Keep legacy assets for previously cached clients.
  const old=source.replace('public',''), next=output.replace('public','');
  const files=['src/lib/team.ts','order-app/components/yoo/app.tsx','order-app/styles.css'];
  for(const file of files){const text=await readFile(file,'utf8');if(text.includes(old))await writeFile(file,text.replaceAll(old,next));}
 }
}
console.log('Lossless image variants save',saved,'bytes across all generated variants.');

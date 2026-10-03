import fs from 'node:fs';
import path from 'node:path';
import catalog from './presentation-catalog.json';
import motionCatalog from './motion-catalog.json';
import type {Manifest} from '@/components/Presentation';

// PACOTES APOSENTADOS
// Legacy packs that cite a client agency or an internal codename: their manifest never reaches the client.
const RETIRED=new Set(['malupe','autoinfracao']);

export function getFramepack(id:string) {
 const item=catalog.find(item=>item.id===id);
 if(!item)return null;
 const manifest=RETIRED.has(id)?({} as Manifest):JSON.parse(fs.readFileSync(path.join(process.cwd(),'public',item.presentationBase,'manifest.json'),'utf8')) as Manifest;
 return {item,manifest};
}
export function framepackIds(publisher?:string){return catalog.filter(p=>!publisher||p.publisher===publisher).map(p=>({slug:p.id}));}

// Share image: the accepted film poster when the product has one, the legacy poster otherwise.
export function publicPoster(id:string,legacy:string){
 const film=motionCatalog.find(f=>f.product===id&&f.kind!=='journey');
 return film?`/motion/${film.id}/poster.png`:RETIRED.has(id)?'/company-brands/welabs-logo.png':legacy;
}

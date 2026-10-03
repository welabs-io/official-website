import type {Metadata} from 'next';
import {notFound,permanentRedirect} from 'next/navigation';
import {ProductPage} from '@/components/InstitutionalSite';
import {getFramepack,framepackIds,publicPoster} from '@/lib/framepacks.server';
import {idFromSlug,publicSlug,retiredSlug} from '@/lib/public-slugs';
// Public slugs replace internal ids in URLs; the old id redirects to the public slug.
export function generateStaticParams(){return framepackIds('Welabs').map(({slug})=>({slug:publicSlug(slug)}));}
export async function generateMetadata({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{lang?:string}>}):Promise<Metadata>{
 const {slug}=await params;const p=getFramepack(idFromSlug(slug));if(!p||p.item.publisher!=='Welabs')return {title:'Apresentação indisponível'};
 const en=(await searchParams).lang==='en';const d=p.item.locales[en?'en':'pt-BR'];
 return {title:`${d.title} | ${p.item.publisher}`,description:d.summary,robots:{index:false,follow:false},icons:{icon:'/company-brands/welabs-favicon.png'},openGraph:{type:'website',siteName:p.item.publisher,title:d.title,description:d.summary,locale:en?'en_US':'pt_BR',images:[{url:publicPoster(p.item.id,d.poster),alt:d.title}]},authors:[{name:p.item.publisher}]};
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const moved=retiredSlug(slug);if(moved)permanentRedirect(`/welabs/produtos/${moved}`);
 const p=getFramepack(idFromSlug(slug));if(!p||p.item.publisher!=='Welabs')notFound();return <ProductPage manifest={p.manifest} item={p.item}/>;
}

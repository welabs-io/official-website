import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {StandalonePresentation} from '@/components/InstitutionalSite';
import {getFramepack,framepackIds} from '@/lib/framepacks.server';
export function generateStaticParams(){return framepackIds();}
export async function generateMetadata({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{lang?:string}>}):Promise<Metadata>{
 const {slug}=await params;const p=getFramepack(slug);if(!p)return {title:'Apresentação indisponível'};
 const en=(await searchParams).lang==='en';const d=p.item.locales[en?'en':'pt-BR'];
 return {title:`${d.title} | ${p.item.publisher}`,description:d.summary,robots:{index:false,follow:false},icons:{icon:p.item.publisher==='Welabs'?'/company-brands/welabs-favicon.png':'/favicon.png'},openGraph:{type:'website',siteName:p.item.publisher,title:d.title,description:d.summary,locale:en?'en_US':'pt_BR',images:[{url:d.poster,alt:d.posterAlt}]},authors:[{name:p.item.publisher}]};
}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=getFramepack(slug);if(!p)notFound();return <StandalonePresentation manifest={p.manifest} item={p.item}/>;}

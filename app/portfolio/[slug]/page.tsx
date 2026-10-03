import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ProductPage,MotionProductPage} from '@/components/InstitutionalSite';
import {getFramepack,framepackIds,publicPoster} from '@/lib/framepacks.server';
import motionProducts from '@/lib/motion-products.json';
// Film-only products have no framepack; they share this route with the presentation pages.
const motionProduct=(slug:string)=>motionProducts.find(p=>p.id===slug);
export function generateStaticParams(){return [...framepackIds('Imagine'),...motionProducts.map(p=>({slug:p.id}))];}
export async function generateMetadata({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{lang?:string}>}):Promise<Metadata>{
 const {slug}=await params;const m=motionProduct(slug);if(m){const en=(await searchParams).lang==='en';return {title:`${m.title} | Imagine`,description:m.summary[en?1:0],robots:{index:false,follow:false},icons:{icon:'/favicon.png'}};}
 const p=getFramepack(slug);if(!p||p.item.publisher!=='Imagine')return {title:'Apresentação indisponível'};
 const en=(await searchParams).lang==='en';const d=p.item.locales[en?'en':'pt-BR'];
 return {title:`${d.title} | ${p.item.publisher}`,description:d.summary,robots:{index:false,follow:false},icons:{icon:'/favicon.png'},openGraph:{type:'website',siteName:p.item.publisher,title:d.title,description:d.summary,locale:en?'en_US':'pt_BR',images:[{url:publicPoster(p.item.id,d.poster),alt:d.title}]},authors:[{name:p.item.publisher}]};
}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const m=motionProduct(slug);if(m)return <MotionProductPage product={m}/>;const p=getFramepack(slug);if(!p||p.item.publisher!=='Imagine')notFound();return <ProductPage manifest={p.manifest} item={p.item}/>;}

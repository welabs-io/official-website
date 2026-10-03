import type {Metadata} from 'next';
import {SolutionsPage} from '@/components/InstitutionalSite';
const copy={"pt": ["Design, software e evolução | Imagine Apps", "Design de produto, software sob medida e evolução conectados ao trabalho."], "en": ["Design, software and evolution | Imagine Apps", "Product design, custom software and evolution connected to the work."]};
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}):Promise<Metadata>{const en=(await searchParams).lang==='en';const [title,description]=copy[en?'en':'pt'];return {title,description,robots:{index:false,follow:false},openGraph:{type:'website',siteName:'Imagine Apps',title,description,locale:en?'en_US':'pt_BR'}};}
export default function Page(){return <SolutionsPage/>;}

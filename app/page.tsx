import type {Metadata} from 'next';
import {ImagineHome} from '@/components/InstitutionalSite';
const copy={"pt": ["Software com contexto de negócio | Imagine Apps", "Software sob medida e design de produto a partir da operação."], "en": ["Software with business context | Imagine Apps", "Custom software and product design shaped around the operation."]};
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}):Promise<Metadata>{const en=(await searchParams).lang==='en';const [title,description]=copy[en?'en':'pt'];return {title,description,robots:{index:false,follow:false},openGraph:{type:'website',siteName:'Imagine Apps',title,description,locale:en?'en_US':'pt_BR'}};}
export default function Page(){return <ImagineHome/>;}

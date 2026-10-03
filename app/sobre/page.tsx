import type {Metadata} from 'next';
import {CompanyAbout} from '@/components/InstitutionalSite';
const copy={"pt": ["Sobre a Imagine | Imagine Apps", "Pessoas, processos e tecnologia: nossa atuação começa pelo contexto da operação."], "en": ["About Imagine | Imagine Apps", "People, processes and technology: our approach starts with the operational context."]};
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}):Promise<Metadata>{const en=(await searchParams).lang==='en';const [title,description]=copy[en?'en':'pt'];return {title,description,robots:{index:false,follow:false},openGraph:{type:'website',siteName:'Imagine Apps',title,description,locale:en?'en_US':'pt_BR'}};}
export default function Page(){return <CompanyAbout/>;}

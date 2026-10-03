import type {Metadata} from 'next';
import {PortfolioIndex} from '@/components/InstitutionalSite';
const copy={"pt": ["Nossos produtos | Welabs", "ERP, Flow, KB, CRM e Ecossistema Monitoramento, com estágio identificado."], "en": ["Our products | Welabs", "ERP, Flow, KB, CRM and Monitoring Ecosystem, with their stage identified."]};
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}):Promise<Metadata>{const en=(await searchParams).lang==='en';const [title,description]=copy[en?'en':'pt'];return {title,description,robots:{index:false,follow:false},openGraph:{type:'website',siteName:'Welabs',title,description,locale:en?'en_US':'pt_BR'}};}
export default function Page(){return <PortfolioIndex publisher="Welabs"/>;}

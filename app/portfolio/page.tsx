import type {Metadata} from 'next';
import {PortfolioIndex} from '@/components/InstitutionalSite';
const copy={"pt": ["Portfólio | Imagine Apps", "Experiências ilustrativas de produtos em diferentes setores."], "en": ["Portfolio | Imagine Apps", "Illustrative product experiences across different sectors."]};
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}):Promise<Metadata>{const en=(await searchParams).lang==='en';const [title,description]=copy[en?'en':'pt'];return {title,description,robots:{index:false,follow:false},openGraph:{type:'website',siteName:'Imagine Apps',title,description,locale:en?'en_US':'pt_BR'}};}
export default function Page(){return <PortfolioIndex/>;}

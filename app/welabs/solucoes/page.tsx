import type {Metadata} from 'next';
import {SolutionsPage} from '@/components/InstitutionalSite';
const copy={"pt": ["Soluções | Welabs", "Um ecossistema de produtos próprios para diferentes contextos de operação."], "en": ["Solutions | Welabs", "An ecosystem of our own products for different operational contexts."]};
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}):Promise<Metadata>{const en=(await searchParams).lang==='en';const [title,description]=copy[en?'en':'pt'];return {title,description,robots:{index:false,follow:false},openGraph:{type:'website',siteName:'Welabs',title,description,locale:en?'en_US':'pt_BR'}};}
export default function Page(){return <SolutionsPage publisher="Welabs"/>;}

import {redirect,notFound} from 'next/navigation';
import {getFramepack} from '@/lib/framepacks.server';
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{lang?:string}>}){const {slug}=await params;const p=getFramepack(slug);if(!p)notFound();const {lang}=await searchParams;redirect((p.item.publisher==='Welabs'?'/welabs/produtos/':'/portfolio/')+slug+(lang==='en'?'?lang=en':''));}

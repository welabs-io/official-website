import type {Metadata} from 'next';
import {MotionIndex} from '@/components/InstitutionalSite';
export const metadata: Metadata = {title: 'Filmes de produto | Imagine Apps', description: 'Jornadas de produto em movimento, com dados ilustrativos.', robots: {index: false, follow: false}};
export default function Page(){return <MotionIndex/>;}

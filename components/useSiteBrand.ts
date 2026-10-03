'use client';
import {usePathname} from 'next/navigation';
import catalog from '@/lib/presentation-catalog.json';
const IMAGINE={name:'Imagine Apps',company:'Imagine',logo:'/imagine-logo.svg',favicon:'/favicon.png',home:'/',collection:'/portfolio',accent:'#0098DA'} as const;
const WELABS={name:'Welabs',company:'Welabs',logo:'/company-brands/welabs-logo.png',favicon:'/company-brands/welabs-favicon.png',home:'/welabs',collection:'/welabs/produtos',accent:'#FF452B'} as const;
export function useSiteBrand(){const pathname=usePathname();const slug=pathname.startsWith('/apresentacoes/')?pathname.slice('/apresentacoes/'.length):pathname.startsWith('/portfolio-preview/')?pathname.slice('/portfolio-preview/'.length):null;return pathname.startsWith('/welabs')||slug==='welabs'||catalog.some(p=>p.id===slug&&p.publisher==='Welabs')?WELABS:IMAGINE;}

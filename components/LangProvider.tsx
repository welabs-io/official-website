'use client';
import {createContext,useCallback,useContext,useMemo,useSyncExternalStore,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {translations,type Lang} from '@/lib/translations';
type Ctx={lang:Lang;setLang:(lang:Lang)=>void;t:(key:string)=>string;switching:boolean};
const LangContext=createContext<Ctx|null>(null);
const CHANGE='portfolio-language-change';let selected:Lang|null=null;
function readLang():Lang{
 if(typeof window==='undefined')return 'pt';
 if(selected)return selected;
 const query=new URLSearchParams(window.location.search).get('lang');if(query==='en'||query==='pt')return query;
 try{const saved=localStorage.getItem('preferredLang');if(saved==='pt'||saved==='en')return saved;}catch{/* Storage is optional. */}
 for(const locale of navigator.languages?.length?navigator.languages:[navigator.language]){const code=locale?.toLowerCase().split('-')[0];if(code==='pt'||code==='en')return code;}
 return 'pt';
}
function langUrl(lang:Lang){const url=new URL(window.location.href);url.searchParams.set('lang',lang);return url.pathname+url.search+url.hash;}
export function localizedHref(href:string,lang:Lang){
 if(!href.startsWith('/')||href.startsWith('//')||/^\/(presentations|presentation-downloads)\//.test(href))return href;
 const url=new URL(href,'http://local.invalid');url.searchParams.set('lang',lang);return url.pathname+url.search+url.hash;
}
export function LangProvider({children,initialLang='pt'}:{children:React.ReactNode;initialLang?:Lang}){
 const router=useRouter();const [switching,startTransition]=useTransition();
 const subscribe=useCallback((notify:()=>void)=>{
  const sync=()=>{const lang=readLang();document.documentElement.lang=lang==='pt'?'pt-BR':'en';notify();};
  const history=()=>{selected=null;sync();};sync();
  window.addEventListener(CHANGE,sync);window.addEventListener('popstate',history);window.addEventListener('storage',history);
  const query=new URLSearchParams(window.location.search).get('lang');if(query!=='en'&&query!=='pt')router.replace(langUrl(readLang()),{scroll:false});
  return()=>{window.removeEventListener(CHANGE,sync);window.removeEventListener('popstate',history);window.removeEventListener('storage',history);};
 },[router]);
 const serverLang=useCallback(()=>initialLang,[initialLang]);
 const lang=useSyncExternalStore(subscribe,readLang,serverLang);
 const setLang=useCallback((value:Lang)=>{selected=value;try{localStorage.setItem('preferredLang',value);}catch{/* Storage is optional. */}window.dispatchEvent(new Event(CHANGE));startTransition(()=>router.replace(langUrl(value),{scroll:false}));},[router]);
 const t=useCallback((key:string)=>translations[lang][key]??key,[lang]);const context=useMemo(()=>({lang,setLang,t,switching}),[lang,setLang,t,switching]);
 return <LangContext.Provider value={context}>{children}</LangContext.Provider>;
}
export function useT(){const context=useContext(LangContext);if(!context)throw Error('useT must be used inside LangProvider');return context;}

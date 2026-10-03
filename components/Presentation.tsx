'use client';
import {useRef,useState,type KeyboardEvent} from 'react';
import {useT} from './LangProvider';
import styles from './Presentation.module.css';
export type Manifest={id:string;productName:string;assets:{id:string;path:string}[];locales:Record<string,{title:string;summary:string;audience:string;disclaimer:string;transcript:string;poster:{assetId:string;alt:string};scenes:{id:string;title:string;summary:string;assetId:string;alt:string}[];player?:{assetId:string;mode:string}}>};
export function Presentation({manifest,baseUrl}:{manifest:Manifest;baseUrl:string}){
 const {lang}=useT();const en=lang==='en',locale=en?'en':'pt-BR',content=manifest.locales[locale];
 const [index,setIndex]=useState(0),[expanded,setExpanded]=useState(false),[playerOpen,setPlayerOpen]=useState(false),[failedSrc,setFailedSrc]=useState<string|null>(null);
 const zoom=useRef<HTMLDialogElement>(null),viewer=useRef<HTMLElement>(null);const scene=content.scenes[Math.min(index,content.scenes.length-1)];
 const resolve=(id:string)=>{const asset=manifest.assets.find(a=>a.id===id);if(!asset)throw Error('Missing presentation asset');return `${baseUrl}/${asset.path}`;};
 const src=resolve(expanded?scene.assetId:content.poster.assetId),last=content.scenes.length-1;
 const select=(next:number)=>{setIndex(Math.max(0,Math.min(last,next)));setExpanded(true);setPlayerOpen(false);};
 const explore=()=>{setExpanded(true);requestAnimationFrame(()=>viewer.current?.focus({preventScroll:true}));};
 const keys=(event:KeyboardEvent<HTMLElement>)=>{if(playerOpen)return;if(event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();select(index+1);}if(event.key==='ArrowLeft'){event.preventDefault();event.stopPropagation();select(index-1);}};
 return <section ref={viewer} tabIndex={-1} className={styles.presentation} aria-label={content.title} onKeyDown={keys}>
  <div className={styles.topbar}><div><span className={styles.label}>{en?'PRODUCT EXPERIENCE':'EXPERIÊNCIA DE PRODUTO'}</span><p>{content.title}</p></div><span className={styles.counter}>{playerOpen?<span>{en?'Independent player':'Player independente'}</span>:<>{String(expanded?index+1:1).padStart(2,'0')} <span>/ {String(content.scenes.length).padStart(2,'0')}</span></>}</span></div>
  <div className={styles.stage}>
   {playerOpen&&content.player?<iframe key={locale} src={resolve(content.player.assetId)} title={`${content.title} — ${en?'independent presentation':'apresentação independente'}`} sandbox="allow-scripts" referrerPolicy="no-referrer" loading="lazy"/>:failedSrc===src?<div className={styles.fallback}><h3>{scene.title}</h3><p>{scene.summary}</p><span>{en?'The image is unavailable. The story remains available below.':'A imagem está indisponível. A experiência continua disponível em texto abaixo.'}</span></div>:<button className={styles.frame} type="button" onClick={()=>zoom.current?.showModal()} aria-label={en?'Enlarge the illustrative scene':'Ampliar a cena ilustrativa'}><img src={src} alt={expanded?scene.alt:content.poster.alt} width={1200} height={860} onError={()=>setFailedSrc(src)}/><span className={styles.zoomHint} aria-hidden="true">{en?'Enlarge':'Ampliar'} ↗</span></button>}
  </div>
  {expanded&&!playerOpen&&<div className={styles.sceneContent} aria-live="polite" aria-atomic="true"><span className={styles.label}>{en?'SCENE':'CENA'} {String(index+1).padStart(2,'0')}</span><h3>{scene.title}</h3><p>{scene.summary}</p></div>}
  <div className={styles.toolbar}>
   <span className={styles.disclaimer}>{content.disclaimer}</span>
   {!expanded?<button className={styles.primary} type="button" aria-expanded={false} onClick={explore}>{en?'Explore presentation':'Explorar apresentação'} <span aria-hidden="true">→</span></button>:playerOpen?<button className={styles.returnGallery} type="button" onClick={()=>setPlayerOpen(false)}>{en?'Back to gallery':'Voltar à galeria'} ←</button>:<nav className={styles.navigation} aria-label={en?'Scene navigation':'Navegação de cenas'}><button type="button" onClick={()=>{if(index>0)select(index-1);}} aria-disabled={index===0} aria-label={en?'Previous scene':'Cena anterior'}>←</button><span>{index+1} / {content.scenes.length}</span><button type="button" onClick={()=>{if(index<last)select(index+1);}} aria-disabled={index===last} aria-label={en?'Next scene':'Próxima cena'}>→</button></nav>}
  </div>
  {expanded&&!playerOpen&&<div className={styles.scenePicker} role="group" aria-label={en?'Choose a scene':'Escolher uma cena'}>{content.scenes.map((entry,i)=><button key={entry.id} type="button" aria-pressed={index===i&&!playerOpen} onClick={()=>select(i)}><span className={styles.sceneNumber}>{String(i+1).padStart(2,'0')}</span><span>{entry.title}</span><span aria-hidden="true">↗</span></button>)}</div>}
  <div className={styles.reading}>
   <details><summary>{en?'Read the complete story':'Ler a experiência completa'}</summary><ol>{content.scenes.map((entry,i)=><li key={entry.id}><div><span className={styles.label}>{String(i+1).padStart(2,'0')}</span><h3>{entry.title}</h3><p>{entry.summary}</p></div><img src={resolve(entry.assetId)} alt={entry.alt} width={1200} height={860} loading="lazy"/></li>)}</ol></details>
   {expanded&&<div className={styles.options}><button type="button" onClick={()=>{setExpanded(false);setPlayerOpen(false);setIndex(0);requestAnimationFrame(()=>viewer.current?.focus({preventScroll:true}));}}>{en?'Back to cover':'Voltar à capa'}</button>{content.player&&<button type="button" aria-expanded={playerOpen} onClick={()=>setPlayerOpen(v=>!v)}>{playerOpen?(en?'Back to scenes':'Voltar às cenas'):(en?'Independent player':'Player independente')} ↗</button>}</div>}
  </div>
  <dialog className={styles.dialog} ref={zoom} aria-label={en?'Enlarged illustrative scene':'Cena ilustrativa ampliada'} onKeyDown={keys}><div className={styles.dialogTop}><span>{content.title} / {expanded?scene.title:content.scenes[0].title}</span><button type="button" onClick={()=>zoom.current?.close()} aria-label={en?'Close enlarged scene':'Fechar cena ampliada'}>✕</button></div><img src={src} alt={expanded?scene.alt:content.poster.alt} width={1200} height={860}/><p>{content.disclaimer}</p></dialog>
 </section>;
}

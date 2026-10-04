'use client';
import NextLink from 'next/link';
import type {ComponentProps,MouseEvent} from 'react';
import {localizedHref,useT} from './LangProvider';
import {useNav} from './Chrome';
// Plain left clicks go through the shared navigator so page changes get the view transition;
// NextLink keeps prefetching and every modified click (new tab, etc.).
export default function LangLink({href,onClick,...props}:ComponentProps<typeof NextLink>){
 const {lang}=useT();const {navigate}=useNav();
 const destination=typeof href==='string'?localizedHref(href,lang):href;
 const handle=(event:MouseEvent<HTMLAnchorElement>)=>{
  onClick?.(event);
  if(event.defaultPrevented||typeof destination!=='string'||!destination.startsWith('/'))return;
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||(props.target&&props.target!=='_self'))return;
  if(destination.startsWith('/#')||/^\/(presentations|presentation-downloads)\//.test(destination))return;
  event.preventDefault();navigate(destination);
 };
 return <NextLink {...props} href={destination} onClick={handle}/>;
}

'use client';
import NextLink from 'next/link';
import type {ComponentProps} from 'react';
import {localizedHref,useT} from './LangProvider';
export default function LangLink({href,...props}:ComponentProps<typeof NextLink>){const {lang}=useT();return <NextLink {...props} href={typeof href==='string'?localizedHref(href,lang):href}/>;}

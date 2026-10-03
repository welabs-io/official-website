'use client';
import type { CSSProperties } from 'react';
import { useSiteBrand } from './useSiteBrand';
import { InstitutionalData } from './InstitutionalData';
import { Header } from './Header';
import { Footer } from './Footer';
import { PreloaderProvider, CustomCursor, ScrollTop, RevealOnScroll } from './Chrome';
import {usePathname} from 'next/navigation';

export function ClientChrome({ children }: { children: React.ReactNode }) {
  const brand = useSiteBrand();
  const standalone=usePathname().startsWith('/apresentacoes/');
  return (
    <div data-site-brand={brand.company} style={{ "--accent": brand.accent } as CSSProperties}>
    <InstitutionalData />
    <PreloaderProvider>
      <a className="skip-link" href="#main-content">Ir para o conteúdo / Skip to content</a>
        <CustomCursor />
        <ScrollTop />
        <RevealOnScroll />
        {!standalone&&<Header />}
        <main id="main-content">{children}</main>
        {!standalone&&<Footer />}

    </PreloaderProvider>
    </div>
  );
}

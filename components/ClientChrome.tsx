'use client';
import { useSiteBrand } from './useSiteBrand';
import { InstitutionalData } from './InstitutionalData';
import { Header } from './Header';
import { Footer } from './Footer';
import { PreloaderProvider, ScrollTop } from './Chrome';
import { MotionLayer } from './MotionLayer';
import {usePathname} from 'next/navigation';

// MOLDURA DO SITE
// The brand palette comes from [data-site-brand] tokens in redesign.css; the motion layer
// (threads, reveals, depth, magnetic controls) sits behind the content of every page.
export function ClientChrome({ children }: { children: React.ReactNode }) {
  const brand = useSiteBrand();
  const standalone=usePathname().startsWith('/apresentacoes/');
  return (
    <div className="site-frame" data-site-brand={brand.company}>
    <InstitutionalData />
    <PreloaderProvider>
      <a className="skip-link" href="#main-content">Ir para o conteúdo / Skip to content</a>
        <ScrollTop />
        {!standalone&&<MotionLayer />}
        {!standalone&&<Header />}
        <main id="main-content">{children}</main>
        {!standalone&&<Footer />}
    </PreloaderProvider>
    </div>
  );
}

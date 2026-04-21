'use client';
import { Header } from './Header';
import { Footer } from './Footer';
import { PreloaderProvider, CustomCursor, ScrollTop, RevealOnScroll } from './Chrome';
import { ProjectModalProvider } from './ProjectModal';

export function ClientChrome({ children }: { children: React.ReactNode }) {
  return (
    <PreloaderProvider>
      <ProjectModalProvider>
        <CustomCursor />
        <ScrollTop />
        <RevealOnScroll />
        <Header />
        <main>{children}</main>
        <Footer />
      </ProjectModalProvider>
    </PreloaderProvider>
  );
}

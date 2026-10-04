import type { Metadata,Viewport } from 'next';
import { Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';
import {headers} from 'next/headers';
import { LangProvider } from '@/components/LangProvider';
import { ClientChrome } from '@/components/ClientChrome';
import './globals.css';
import './redesign.css';

// TIPOGRAFIA
// One sober sans for UI, body and headings; a mono only for indexes, labels and metadata.
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans-face', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono-face', display: 'swap' });

export const viewport:Viewport={themeColor:'#0b0d0e',colorScheme:'dark'};
export const metadata: Metadata = {
  title: 'Imagine Apps',
  description:
    'Criamos soluções digitais que entregam resultados reais. Desenvolvimento de software sob medida, cloud, DevOps e design de produto para escalar seu negócio.',
  metadataBase: new URL('http://localhost:3000'),
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.png' },
  openGraph: {
    type: 'website',
    siteName: 'Imagine Apps',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang=(await headers()).get('x-portfolio-language')==='en'?'en':'pt';
  return (
    // The inline script marks JS before first paint so reveal states never hide content without JS.
    <html lang={lang==='en'?'en':'pt-BR'} className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:"document.documentElement.classList.add('js')"}}/>
      </head>
      <body className="dark-theme">
        <LangProvider initialLang={lang}>
          <ClientChrome>{children}</ClientChrome>
        </LangProvider>
      </body>
    </html>
  );
}

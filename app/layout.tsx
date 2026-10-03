import type { Metadata,Viewport } from 'next';
import { Inter } from 'next/font/google';
import {headers} from 'next/headers';
import { LangProvider } from '@/components/LangProvider';
import { ClientChrome } from '@/components/ClientChrome';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const viewport:Viewport={themeColor:'#0098DA'};
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
    <html lang={lang==='en'?'en':'pt-BR'} className={inter.variable}>
      <head>
        <noscript><style>{`#preloader,.cursor,.cursor-follower{display:none!important}body{cursor:auto!important}.reveal{opacity:1!important;transform:none!important}`}</style></noscript>

      </head>
      <body className="dark-theme">
        <LangProvider initialLang={lang}>
          <ClientChrome>{children}</ClientChrome>
        </LangProvider>
      </body>
    </html>
  );
}

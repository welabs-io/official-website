import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LangProvider } from '@/components/LangProvider';
import { ClientChrome } from '@/components/ClientChrome';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Imagine Apps',
  description:
    'Criamos soluções digitais que entregam resultados reais. Desenvolvimento de software sob medida, cloud, DevOps e design de produto para escalar seu negócio.',
  metadataBase: new URL('https://imagineapps.com.br'),
  icons: { icon: '/favicon.png' },
  openGraph: {
    type: 'website',
    siteName: 'Imagine Apps',
    url: 'https://imagineapps.com.br/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#0098DA" />
        <meta name="author" content="Imagine Apps" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Imagine Apps',
              legalName: 'Imagine Apps',
              url: 'https://imagineapps.com.br/',
              logo: 'https://imagineapps.com.br/imagine-logo.svg',
              foundingDate: '2014',
              description: 'Desenvolvimento de software sob medida, cloud, DevOps e design de produto.',
              email: 'contato@imagineapps.com.br',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Av. Conselheiro Aguiar, 2738 - Sala 402',
                addressLocality: 'Recife',
                addressRegion: 'PE',
                addressCountry: 'BR',
              },
              sameAs: [
                'https://www.linkedin.com/company/imagine-apps/',
                'https://instagram.com/imagineapps.br',
              ],
              taxID: '20.511.064/0001-64',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Imagine Apps',
              url: 'https://imagineapps.com.br/',
              inLanguage: ['pt-BR', 'en'],
            }),
          }}
        />
      </head>
      <body className="dark-theme">
        <LangProvider>
          <ClientChrome>{children}</ClientChrome>
        </LangProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Desenvolvimento de Software Sob Medida | Imagine Apps',
  description:
    'Criamos soluções digitais que entregam resultados reais. Desenvolvimento de software sob medida, cloud, DevOps e design de produto para escalar seu negócio.',
  alternates: {
    canonical: 'https://imagineapps.com.br/',
    languages: {
      'pt-BR': 'https://imagineapps.com.br/',
      en: 'https://imagineapps.com.br/?lang=en',
      'x-default': 'https://imagineapps.com.br/',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Imagine Apps',
    url: 'https://imagineapps.com.br/',
    title: 'Desenvolvimento de Software Sob Medida | Imagine Apps',
    description:
      'Criamos soluções digitais que entregam resultados reais. Software sob medida, cloud, DevOps e design de produto para escalar seu negócio.',
    locale: 'pt_BR',
    alternateLocale: ['en_US'],
    images: [
      { url: '/assets/og-image.png', width: 1200, height: 630, alt: 'Imagine Apps — Desenvolvimento de Software Sob Medida' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desenvolvimento de Software Sob Medida | Imagine Apps',
    description:
      'Criamos soluções digitais que entregam resultados reais. Software sob medida, cloud, DevOps e design de produto para escalar seu negócio.',
    images: ['/assets/og-image.png'],
  },
};

export default function Page() {
  return <HomeClient />;
}

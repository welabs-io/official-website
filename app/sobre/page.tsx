import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'Sobre Nós | Imagine Apps — Software Sob Medida',
  description:
    'Conheça a Imagine Apps: desde 2014 transformando complexidade em simplicidade operacional com software sob medida, cloud e foco em ESG.',
  alternates: {
    canonical: 'https://imagineapps.com.br/sobre',
    languages: {
      'pt-BR': 'https://imagineapps.com.br/sobre',
      en: 'https://imagineapps.com.br/sobre?lang=en',
      'x-default': 'https://imagineapps.com.br/sobre',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Imagine Apps',
    url: 'https://imagineapps.com.br/sobre',
    title: 'Sobre Nós | Imagine Apps — Software Sob Medida',
    description:
      'Desde 2014 transformando complexidade em simplicidade operacional com software sob medida, cloud e foco em ESG.',
    locale: 'pt_BR',
    alternateLocale: ['en_US'],
    images: [
      { url: '/assets/og-image-about.png', width: 1200, height: 630, alt: 'Imagine Apps — Sobre Nós' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre Nós | Imagine Apps — Software Sob Medida',
    description:
      'Desde 2014 transformando complexidade em simplicidade operacional com software sob medida, cloud e foco em ESG.',
    images: ['/assets/og-image-about.png'],
  },
};

export default function Page() {
  return <AboutClient />;
}

'use client';
import { useSiteBrand } from './useSiteBrand';

export function InstitutionalData() {
  const brand = useSiteBrand();
  const data = brand.company === 'Welabs' ? {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'Welabs',
    description: 'Produtos próprios para gestão, conhecimento, relacionamento e automação.',
  } : {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'Imagine Apps', legalName: 'Imagine Apps',
    url: 'https://imagineapps.com.br/', logo: 'https://imagineapps.com.br/imagine-logo.svg',
    description: 'Desenvolvimento de software sob medida, cloud, DevOps e design de produto.', email: 'contato@imagineapps.com.br',
    address: { '@type': 'PostalAddress', streetAddress: 'Av. Conselheiro Aguiar, 2738 - Sala 402', addressLocality: 'Recife', addressRegion: 'PE', addressCountry: 'BR' },
    taxID: '20.511.064/0001-64',
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', '\\u003c') }} />
    {brand.company === 'Imagine' && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Imagine Apps', url: 'https://imagineapps.com.br/', inLanguage: ['pt-BR', 'en'] }) }} />}
  </>;
}

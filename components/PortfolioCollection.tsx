'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useT } from './LangProvider';
import { portfolio, type PortfolioProduct } from '@/lib/portfolio';
import styles from './PortfolioCollection.module.css';
import { getPortfolioCopy } from '@/lib/portfolio-copy';

const categories = [
  ['all', 'Todos os setores', 'All sectors'],
  ['construction', 'Construção', 'Construction'],
  ['business', 'Negócios', 'Business'],
  ['sustainability', 'Sustentabilidade', 'Sustainability'],
  ['public', 'Ambiental e processos', 'Environment & processes'],
] as const;

export function PortfolioCover({ product, priority = false }: { product: PortfolioProduct; priority?: boolean }) {
  return <img className={styles.cover} src={product.cover} width="1200" height="860" loading={priority ? 'eager' : 'lazy'} alt={`${product.title} — illustrative concept / dados fictícios`} />;
}

export function PortfolioCollection({ brand = "Imagine" }: { brand?: "Imagine" | "Welabs" }) {
  const { lang } = useT();
  const en = lang === 'en';
  const welabs = brand === "Welabs";
  const [category, setCategory] = useState('all');
  const entries = portfolio.filter((product) => product.brand === brand && (brand === 'Welabs' || category === 'all' || product.category === category));
  return <div className={styles.page}>
    <div className={styles.container}>
      <div className={styles.breadcrumb}><Link href={welabs ? "/portfolio-preview/welabs" : "/"}>{welabs ? "Welabs" : en ? "Home" : "Início"}</Link><span>/</span><span>{en ? 'Portfolio study' : 'Estudo de portfólio'}</span></div>
      <header className={styles.intro}>
        <div className={styles.eyebrow}>{welabs ? (en ? 'WELABS · OUR PRODUCTS' : 'WELABS · NOSSOS PRODUTOS') : (en ? 'PRODUCTS AND EXPERIENCES' : 'PRODUTOS E EXPERIÊNCIAS')}</div>
        <h1>{welabs ? (en ? 'We build products.' : 'Nós criamos produtos.') : (en ? 'Technology shaped' : 'Tecnologia com')}<br /><span>{welabs ? (en ? 'We connect operations.' : 'Conectamos operações.') : (en ? 'around the operation.' : 'contexto de negócio.')}</span></h1>
        <div className={styles.introBottom}>
          <p>{welabs ? (en ? 'We are Welabs. Our ecosystem brings management, knowledge, relationships and automation together through our own products.' : 'Somos a Welabs. Nosso ecossistema aproxima gestão, conhecimento, relacionamento e automação por meio de produtos próprios.') : (en ? 'Different sectors. Real challenges. A collection of digital experiences that connect people, processes and operations.' : 'Setores diferentes. Desafios concretos. Uma coleção de experiências digitais que conectam pessoas, processos e operações.')}</p>
          <span className={styles.collectionNote}>{welabs ? (en ? 'Our company. Our ecosystem.' : 'Nossa empresa. Nosso ecossistema.') : (en ? 'Client product experiences' : 'Experiências de produtos para clientes')}<br />{brand} <span>↗</span></span>
        </div>
      </header>
      <div className={styles.brandRow}>
        <div className={styles.brandTabs} aria-label={en ? 'Choose brand' : 'Escolher marca'}>
          {(['Imagine', 'Welabs'] as const).map((entry) => <Link key={entry} href={entry === "Welabs" ? "/portfolio-preview/welabs" : "/portfolio-preview"} aria-current={entry === brand ? "page" : undefined} className={entry === brand ? styles.activeBrand : ""}>{entry}<span>{portfolio.filter((product) => product.brand === entry).length.toString().padStart(2, '0')}</span></Link>)}
        </div>
        <p>{brand === 'Imagine' ? (en ? 'Client product experiences' : 'Experiências de produtos para clientes') : (en ? 'Our products · development stages indicated' : 'Produtos próprios · estágios indicados')}</p>
      </div>
      {brand === 'Imagine' && <div className={styles.filters} aria-label={en ? 'Filter by sector' : 'Filtrar por setor'}>{categories.map(([id, pt, english]) => <button key={id} aria-pressed={category === id} className={category === id ? styles.activeFilter : ''} onClick={() => setCategory(id)}>{en ? english : pt}</button>)}</div>}
      <div id="produtos" className={styles.grid}>
        {entries.map((product, index) => { const copy = getPortfolioCopy(product, en); return <article key={product.slug} className={`${styles.card} ${index === 0 && category === 'all' && brand === 'Imagine' ? styles.featured : ''}`}>
          <Link href={`/portfolio-preview/${product.slug}`} className={styles.artLink} aria-label={`${en ? 'Explore' : 'Conhecer'} ${product.title}`}><PortfolioCover product={product} priority={index === 0} /><span className={styles.viewArrow} aria-hidden="true">↗</span></Link>
          <div className={styles.cardText}>
            <div className={styles.cardMeta}><span>{copy.sector}</span>{copy.stage !== 'Case' && <span className={styles.stage}>{copy.stage}</span>}</div>
            <Link href={`/portfolio-preview/${product.slug}`}><h2>{product.title}</h2></Link>
            <p>{copy.summary}</p>
            <div className={styles.surfaces}>{copy.surfaces.map((surface) => <span key={surface}>{surface}</span>)}</div>
            <Link href={`/portfolio-preview/${product.slug}`} className={styles.textLink}>{en ? 'Explore the product' : 'Conhecer o produto'} <span aria-hidden="true">↗</span></Link>
          </div>
        </article>; })}
      </div>
      <div className={styles.visualNote}><span aria-hidden="true">◇</span><p>{en ? 'The visuals are illustrative recreations with fictional data. They communicate the product context and do not reproduce live system screens.' : 'As imagens são recriações ilustrativas com dados fictícios. Apresentam o contexto de cada produto e não reproduzem telas de sistemas em produção.'}</p></div>
      <section id={welabs ? "welabs-company" : undefined} className={styles.endnote}><div className={styles.eyebrow}>{welabs ? 'WELABS' : en ? 'FROM CONTEXT TO PRODUCT' : 'DO CONTEXTO AO PRODUTO'}</div><h2>{welabs ? (en ? 'One company.' : 'Uma empresa.') : en ? 'Every operation has' : 'Cada operação tem'}<br />{welabs ? (en ? 'A connected ecosystem.' : 'Um ecossistema conectado.') : en ? 'its own next step.' : 'seu próximo passo.'}</h2>{welabs && <p className={styles.companyText}>{en ? 'We are Welabs. We build our own products to bring management, knowledge, relationships and automation into the same operational context.' : 'Somos a Welabs. Desenvolvemos nossos próprios produtos para aproximar gestão, conhecimento, relacionamento e automação no mesmo contexto operacional.'}</p>}<Link className={styles.cta} href={welabs ? '#produtos' : '/#contato'}>{welabs ? (en ? 'Explore our products' : 'Explorar nossos produtos') : en ? 'Talk about your product' : 'Conversar sobre seu produto'} <span aria-hidden="true">↗</span></Link></section>
    </div>
  </div>;
}

export function PortfolioDetail({ product }: { product: PortfolioProduct }) {
  const { lang } = useT();
  const en = lang === 'en';
  const copy = getPortfolioCopy(product, en);
  const nextProducts = portfolio.filter((item) => item.brand === product.brand && item.slug !== product.slug).slice(0, 2);
  return <div className={styles.page}><div className={styles.container}>
    <div className={styles.breadcrumb}><Link href={product.brand === "Welabs" ? "/portfolio-preview/welabs" : "/portfolio-preview"}>{product.brand === "Welabs" ? "Welabs" : en ? "Portfolio" : "Portfólio"}</Link><span>/</span><span>{product.title}</span></div>
    <header className={styles.detailIntro}><div className={styles.eyebrow}>{copy.sector} · {product.brand}</div><h1>{product.title}</h1><p>{copy.summary}</p>{copy.stage !== 'Case' && <span className={styles.stage}>{copy.stage}</span>}</header>
    <figure className={styles.detailVisual}><PortfolioCover product={product} priority /><figcaption>{en ? 'Illustrative recreation · fictional data' : 'Recriação ilustrativa · dados fictícios'}</figcaption></figure>
    <section className={styles.story}><div className={styles.eyebrow}>01 / {en ? 'THE CONTEXT' : 'O CONTEXTO'}</div><div><h2>{en ? 'A product starts' : 'Um produto começa'}<br />{en ? 'with its operation.' : 'pela sua operação.'}</h2><p>{copy.challenge}</p></div></section>
    <div className={styles.facts}><div><span>{en ? 'WHO IT SERVES' : 'PARA QUEM'}</span><p>{copy.audience}</p></div><div><span>{en ? 'EXPERIENCES' : 'EXPERIÊNCIAS'}</span><p>{copy.surfaces.join(' · ')}</p></div><div><span>{en ? 'CONTEXT' : 'CONTEXTO'}</span><p>{copy.sector}</p></div></div>
    <section className={styles.capabilities}><div className={styles.eyebrow}>02 / {en ? 'THE SOLUTION' : 'A SOLUÇÃO'}</div><h2>{en ? 'Different journeys.' : 'Jornadas diferentes.'}<br /><span>{en ? 'One product context.' : 'Um contexto conectado.'}</span></h2><div className={styles.capabilityGrid}>{copy.capabilities.map((capability, index) => <article key={capability}><span>{String(index + 1).padStart(2, '0')}</span><h3>{capability}</h3></article>)}</div></section>
    <div className={styles.visualNote}><span aria-hidden="true">◇</span><p>{en ? 'This is a conceptual product presentation. Illustrations use fictional records; no customer screenshots or operational metrics are reproduced.' : 'Esta é uma apresentação conceitual do produto. As ilustrações usam registros fictícios; não há reprodução de prints de clientes ou de indicadores operacionais.'}</p></div>
    <section className={styles.related}><div className={styles.eyebrow}>{en ? 'EXPLORE THE COLLECTION' : 'CONTINUE PELA COLEÇÃO'}</div><div className={styles.grid}>{nextProducts.map((item) => <Link key={item.slug} href={`/portfolio-preview/${item.slug}`} className={styles.relatedCard}><PortfolioCover product={item}/><div><h3>{item.title}</h3><span aria-hidden="true">↗</span></div></Link>)}</div></section>
  </div></div>;
}

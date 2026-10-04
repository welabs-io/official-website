'use client';

import {useState, type CSSProperties} from 'react';
import Link from './LangLink';
import {useT} from './LangProvider';
import catalog from '@/lib/presentation-catalog.json';
import visuals from '@/lib/presentation-visuals.json';
import emphasis from '@/lib/emphasis.json';
import {coverFilm} from './MotionFilm';
import {publicSlug} from '@/lib/public-slugs';
import styles from './PortfolioShowcase.module.css';

type Item = (typeof catalog)[number];
type Locale = 'pt-BR' | 'en';
type Publisher = 'Imagine' | 'Welabs';
type Sector = 'construction' | 'business' | 'sustainability' | 'public';
type Art = {purpose: [string, string]; scene: number; composition: 'board' | 'paper' | 'network' | 'journey'};

const sectors: Record<Sector, [string, string]> = {
  construction: ['Construção', 'Construction'],
  business: ['Negócios', 'Business'],
  sustainability: ['Sustentabilidade', 'Sustainability'],
  public: ['Ambiental e processos', 'Environment & processes'],
};
const categories: Record<string, Sector> = {
  stant: 'construction', tabela: 'business', 'kiosk-brands': 'business',
  'central-esg': 'sustainability', 'light-recicla': 'sustainability', ecoenel: 'sustainability', neoenergia: 'sustainability',
  wego: 'public', autoinfracao: 'public', docgo: 'public', signgo: 'public', sgors: 'sustainability', licenciamento: 'public', 'sistema-ima': 'public',
  sgici: 'business',
};
// Short editorial labels describe the same concepts as the public catalogue.
const art: Record<string, Art> = {
  stant: {purpose: ['A obra em perspectiva.', 'The worksite in view.'], scene: 0, composition: 'board'},
  tabela: {purpose: ['Da unidade à proposta.', 'From unit to proposal.'], scene: 0, composition: 'board'},
  'central-esg': {purpose: ['Indicadores. Contexto. Comunicação.', 'Indicators. Context. Communication.'], scene: 1, composition: 'board'},
  'light-recicla': {purpose: ['Cada material, uma jornada.', 'Every material, a journey.'], scene: 2, composition: 'journey'},
  ecoenel: {purpose: ['Reciclagem em contexto.', 'Recycling in context.'], scene: 0, composition: 'board'},
  neoenergia: {purpose: ['Programas em perspectiva.', 'Programmes in view.'], scene: 1, composition: 'paper'},
  'kiosk-brands': {purpose: ['Marcas e oportunidades.', 'Brands and opportunities.'], scene: 0, composition: 'board'},
  wego: {purpose: ['Documentos e processos.', 'Documents and processes.'], scene: 2, composition: 'journey'},
  autoinfracao: {purpose: ['Do registro ao acompanhamento.', 'From record to follow-up.'], scene: 0, composition: 'paper'},
  erp: {purpose: ['Documentos. Visão de gestão.', 'Documents. Management view.'], scene: 1, composition: 'board'},
  flow: {purpose: ['O próximo passo do trabalho.', 'The next step of work.'], scene: 1, composition: 'journey'},
  wekb: {purpose: ['Fontes e contexto.', 'Sources and context.'], scene: 1, composition: 'network'},
  'welabs-crm': {purpose: ['O contexto de cada relação.', 'The context of every relationship.'], scene: 0, composition: 'board'},
  malupe: {purpose: ['Eventos em acompanhamento.', 'Events in view.'], scene: 0, composition: 'board'},
  sgors: {purpose: ['Do resíduo gerado ao destino final.', 'From waste generated to final destination.'], scene: 0, composition: 'journey'},
  sgici: {purpose: ['Importação e financeiro em ordem.', 'Imports and finance in order.'], scene: 0, composition: 'paper'},
};

function productHref(item: Item) {
  return item.publisher === 'Welabs' ? `/welabs/produtos/${publicSlug(item.id)}` : `/portfolio/${publicSlug(item.id)}`;
}

function stage(item: Item, en: boolean) {
  if (item.maturity === 'alpha') return 'Alpha';
  if (item.maturity === 'development') return en ? 'In development' : 'Em desenvolvimento';
  if (item.maturity === 'historical-pending') return en ? 'Historical · pending review' : 'Histórico · pendente';
  if (item.status === 'reservado') return en ? 'Reserved concept' : 'Conceito reservado';
  if (item.status === 'modulo') return en ? 'Concept module' : 'Módulo conceitual';
  return en ? 'Concept presentation' : 'Apresentação conceitual';
}

export function ProductCard({item, locale, featured = false}: {item: Item; locale: Locale; featured?: boolean}) {
  const en = locale === 'en';
  const copy = item.locales[locale];
  const visual = (visuals as Record<string, (typeof visuals)[keyof typeof visuals]>)[item.id];
  const direction = art[item.id] ?? {purpose: [visual.scenes['pt-BR'][0].title, visual.scenes.en[0].title], scene: 0, composition: 'paper'};
  // Cards use the accepted business film frame as cover; legacy scenes stay as fallback.
  const film = coverFilm(item.id);
  const scene = film ? {src: `/motion/${film.id}/poster.png`} : visual.scenes[locale][direction.scene];
  const sector = categories[item.id];
  const support = item.publisher === 'Welabs' ? 'welabs' : sector ?? 'public';
  const vars = {'--cover-accent': item.brand.palette.accent} as CSSProperties;
  return <article className={`${styles.card} ${featured ? styles.featured : ''}`} data-product={item.id} style={vars}>
    <Link href={productHref(item)} className={styles.cardLink}>
      <div className={`${styles.cover} ${styles[support]} ${styles[direction.composition]}`}>
        <div className={styles.coverTop}>
          {visual.logo ? <span className={`${styles.logoPlate} ${visual.logoPlate === 'light' ? styles.lightPlate : styles.darkPlate}`}>
            <img src={visual.logo} alt={item.brand.name} width="180" height="64" loading="lazy" />
          </span> : <span className={styles.contextLabel}>{en ? 'Product context' : 'Contexto de produto'}</span>}
          <span className={styles.publisher}>{item.publisher}</span>
        </div>
        <p className={styles.purpose}>{direction.purpose[en ? 1 : 0]}</p>
        <div className={`${styles.sceneCrop} ${film ? styles.filmCrop : ''}`}>
          <img src={scene.src} alt="" aria-hidden="true" width="1200" height="860" loading="lazy" />
        </div>
        <span className={styles.coverNotice}>{en ? 'Illustrative recreation · fictional data' : 'Recriação ilustrativa · dados fictícios'}</span>
        <span className={styles.openArrow} aria-hidden="true">↗</span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.metadata}>
          <span>{item.publisher === 'Welabs' ? (en ? 'Welabs product' : 'Produto Welabs') : sector ? sectors[sector][en ? 1 : 0] : (en ? 'Product context' : 'Contexto de produto')}</span>
          <span className={styles.stage}>{stage(item, en)}</span>
        </div>
        <h2>{copy.title}</h2>
        <p className={styles.summary}>{copy.summary}</p>
        <span className={styles.explore}>{en ? 'Explore the presentation' : 'Explorar a apresentação'} <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  </article>;
}

export function PortfolioCollection({publisher}: {publisher: Publisher}) {
  const {lang} = useT();
  const en = lang === 'en';
  const locale: Locale = en ? 'en' : 'pt-BR';
  const [filter, setFilter] = useState<Sector | 'all'>('all');
  // Order follows the emphasis ranking; unranked items keep catalog order at the end.
  const order = emphasis[publisher === 'Welabs' ? 'welabs' : 'imagine'];
  const rank = (id: string) => { const i = order.indexOf(id); return i < 0 ? order.length : i; };
  const collection = catalog.filter(item => item.publisher === publisher && (publisher === 'Welabs' || item.status === 'selecionado')).sort((a, b) => rank(a.id) - rank(b.id));
  const entries = collection.filter(item => publisher === 'Welabs' || filter === 'all' || categories[item.id] === filter);
  return <div className={styles.collection}>
    <div className={styles.collectionToolbar}>
      {publisher === 'Imagine' ? <nav className={styles.filters} aria-label={en ? 'Filter portfolio by sector' : 'Filtrar portfólio por setor'}>
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>{en ? 'All sectors' : 'Todos os setores'} <span>{collection.length}</span></button>
        {(Object.entries(sectors) as [Sector, [string, string]][]).map(([key, labels]) => <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{labels[en ? 1 : 0]}</button>)}
      </nav> : <p className={styles.collectionLabel}>{en ? 'Our product ecosystem' : 'Nosso ecossistema de produtos'}</p>}
      <p className={styles.count} role="status">{entries.length} {en ? (entries.length === 1 ? 'presentation' : 'presentations') : (entries.length === 1 ? 'apresentação' : 'apresentações')}</p>
    </div>
    <div className={styles.grid}>{entries.map((item, index) => <ProductCard key={item.id} item={item} locale={locale} featured={index === 0 && (publisher === 'Welabs' || filter === 'all')} />)}</div>
    <p className={styles.collectionNote}>{en ? 'Illustrative recreations with fictional data. The stage of each presentation is identified in the collection.' : 'Recriações ilustrativas com dados fictícios. O estágio de cada apresentação está identificado na coleção.'}</p>
  </div>;
}

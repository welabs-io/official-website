import type {CSSProperties} from 'react';
import Link from './LangLink';
import catalog from '@/lib/presentation-catalog.json';
import visuals from '@/lib/presentation-visuals.json';
import styles from './CompanyHero.module.css';
import {publicSlug} from '@/lib/public-slugs';

type Publisher = 'Imagine' | 'Welabs';
type Locale = 'pt-BR' | 'en';
type ProductId = keyof typeof visuals;

const words = {
  'pt-BR': {
    imagineLabel: 'Software e design de produto',
    imagineTitle: ['O trabalho muda.', 'O software acompanha.'],
    imagineCopy: 'Design e tecnologia a partir de quem usa. Conheça contextos de produto em obras, negócios e sustentabilidade.',
    imagineCta: 'Explorar o portfólio', imagineSecondary: 'Nossa atuação',
    welabsLabel: 'Nossa empresa. Nossos produtos.',
    welabsTitle: ['Ideias que viram', 'ferramentas de trabalho.'],
    welabsCopy: 'Somos a Welabs. Criamos produtos próprios para gestão, conhecimento, relacionamento e automação, com espaço para cada contexto.',
    welabsCta: 'Conhecer os produtos', welabsSecondary: 'A Welabs',
    selection: 'Um recorte do portfólio', ecosystem: 'Produtos Welabs',
    disclaimer: 'Recriação ilustrativa · dados fictícios', concept: 'Conceito', development: 'Em desenvolvimento',
    table: 'Consulta de unidades', site: 'Acompanhamento de obras', recycling: 'Ciclo de resíduos e reciclagem',
    flow: 'O próximo passo, em contexto.', intake: 'Entrada', work: 'Execução', review: 'Revisão',
    demo: 'Projeto demonstração', unit: 'Unidade DEMO', task: 'Tarefa DEMO', record: 'Registro DEMO',
    materials: ['Papel', 'Plástico', 'Metal'],
    purposes: {erp: 'Gestão', wekb: 'Conhecimento', 'welabs-crm': 'Relacionamento', malupe: 'Eventos'},
    illustration: 'Composição conceitual de produtos, com exemplos fictícios',
  },
  en: {
    imagineLabel: 'Software and product design',
    imagineTitle: ['Work evolves.', 'Software follows.'],
    imagineCopy: 'Design and technology shaped around the people who use them. Explore product contexts in construction, business and sustainability.',
    imagineCta: 'Explore the portfolio', imagineSecondary: 'Our approach',
    welabsLabel: 'Our company. Our products.',
    welabsTitle: ['Ideas that become', 'tools for work.'],
    welabsCopy: 'We are Welabs. We build our own products for management, knowledge, relationships and automation, with room for each context.',
    welabsCta: 'Explore the products', welabsSecondary: 'About Welabs',
    selection: 'A selection from the portfolio', ecosystem: 'Welabs products',
    disclaimer: 'Illustrative recreation · fictional data', concept: 'Concept', development: 'In development',
    table: 'Browse units', site: 'Construction follow-up', recycling: 'Waste and recycling cycle',
    flow: 'The next step, in context.', intake: 'Intake', work: 'Execution', review: 'Review',
    demo: 'Demonstration project', unit: 'DEMO unit', task: 'DEMO task', record: 'DEMO record',
    materials: ['Paper', 'Plastic', 'Metal'],
    purposes: {erp: 'Management', wekb: 'Knowledge', 'welabs-crm': 'Relationships', malupe: 'Events'},
    illustration: 'Concept product composition with fictional examples',
  },
};

function Arrow() {return <span className={styles.arrow} aria-hidden="true">↗</span>;}

function Logo({id}: {id: ProductId}) {
  const visual = visuals[id];
  const product = catalog.find(item => item.id === id)!;
  return <span className={`${styles.logoPlate} ${visual.logoPlate === 'light' ? styles.lightPlate : ''}`}>
    <img src={visual.logo!} alt={product.brand.name} width="132" height="38"/>
  </span>;
}

function ImagineProducts({locale}: {locale: Locale}) {
  const t = words[locale];
  return <div className={styles.imagineProducts}>
    <Link href="/portfolio/tabela" className={`${styles.product} ${styles.tableProduct}`}>
      <div className={styles.productTop}><Logo id="tabela"/><Arrow/></div>
      <div className={styles.productTitle}><strong>Tabe.la</strong><span>{t.table}</span></div>
      <div className={styles.unitMatrix} aria-hidden="true">{['A', 'B', 'C', 'D', 'E', 'F'].map((letter, i) =>
        <div className={styles.unit} key={letter}><span>{t.unit}</span><b>{letter}</b><i className={i === 1 ? styles.selectedUnit : ''}/></div>
      )}</div>
      <div className={styles.productBottom}><span>{t.concept}</span><span aria-hidden="true">DEMO</span></div>
    </Link>
    <Link href="/portfolio/stant" className={`${styles.product} ${styles.siteProduct}`}>
      <div className={styles.productTop}><Logo id="stant"/><Arrow/></div>
      <div className={styles.productTitle}><strong>Stant</strong><span>{t.site}</span></div>
      <div className={styles.siteDiagram} aria-hidden="true"><span>{t.demo}</span><div className={styles.taskRows}>
        {[0, 1, 2].map(row => <div key={row}><i/><span>{t.task}</span><b>↗</b></div>)}
      </div></div>
      <div className={styles.productBottom}><span>{t.concept}</span><span aria-hidden="true">DEMO</span></div>
    </Link>
    {/* Recycling is presented inside the waste management system; Light stays a client (decision of 2026-10-02) */}
    <Link href={`/portfolio/${publicSlug('sgors')}`} className={`${styles.product} ${styles.recycleProduct}`}>
      <div className={styles.productTop}><Logo id="sgors"/><Arrow/></div>
      <div className={styles.productTitle}><strong>{catalog.find(item => item.id === 'sgors')!.productName}</strong><span>{t.recycling}</span></div>
      <div className={styles.materials} aria-hidden="true">{t.materials.map((material, i) => <div key={material}>
        <svg viewBox="0 0 40 40" fill="none"><path d={i === 0 ? 'M12 8h12l6 6v19H12V8Zm12 0v7h6M17 21h8M17 26h8' : i === 1 ? 'M17 7h6v7l5 6v13H12V20l5-6V7Zm-5 16h16M17 11h6' : 'M12 11h16v22H12V11Zm0 5h16M16 7h8M17 20v9M23 20v9'} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
        <span>{material}</span>
      </div>)}</div>
      <div className={styles.productBottom}><span>{t.concept}</span><span aria-hidden="true">DEMO</span></div>
    </Link>
  </div>;
}

function WelabsProducts({locale}: {locale: Locale}) {
  const t = words[locale];
  const products = ['erp', 'wekb', 'welabs-crm', 'malupe'] as const;
  return <div className={styles.welabsProducts}>
    <Link href="/welabs/produtos/flow" className={`${styles.product} ${styles.flowProduct}`}>
      <div className={styles.productTop}><span className={styles.flowMark} aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M6 10h18m-5-5 5 5-5 5M30 26H12m5-5-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span className={styles.stage}>{t.development}</span><Arrow/></div>
      <div className={styles.productTitle}><strong>Flow</strong><span>{t.flow}</span></div>
      <div className={styles.flowBoard} aria-hidden="true">{[t.intake, t.work, t.review].map((stage, i) => <div key={stage}>
        <span className={styles.boardHeading}><i/>{stage}</span><div className={styles.boardTask}><span>{t.task}</span><b/><b/>{i === 1 && <em>↗</em>}</div>
      </div>)}</div>
    </Link>
    {products.map(id => {
      const product = catalog.find(item => item.id === id)!;
      return <Link key={id} href={`/welabs/produtos/${publicSlug(id)}`} className={`${styles.product} ${styles.ecosystemProduct}`}>
        <div className={styles.productTop}><span className={styles.purpose}>{t.purposes[id]}</span><Arrow/></div>
        <div className={styles.productTitle}><strong>{product.productName}</strong></div>
        <div className={`${styles.motif} ${styles[id === 'erp' ? 'managementMotif' : id === 'wekb' ? 'knowledgeMotif' : id === 'welabs-crm' ? 'relationshipMotif' : 'eventMotif']}`} aria-hidden="true"><i/><i/><i/><i/></div>
        <span className={styles.stage}>{product.maturity === 'alpha' ? 'Alpha' : t.development}</span>
      </Link>;
    })}
  </div>;
}

export function CompanyHero({publisher, locale}: {publisher: Publisher; locale: Locale}) {
  const we = publisher === 'Welabs';
  const t = words[locale];
  const title = we ? t.welabsTitle : t.imagineTitle;
  return <section className={`${styles.hero} ${we ? styles.welabs : ''}`} style={{'--hero-accent': we ? '#ff6954' : '#46bdf0'} as CSSProperties}>
    <div className={styles.layout}>
      <div className={styles.copy}>
        <img className={`${styles.companyLogo} ${we ? styles.welabsLogo : ''}`} src={we ? '/company-brands/welabs-logo.png' : '/imagine-logo.svg'} alt={publisher} width={we ? 168 : 152} height={we ? 47 : 44}/>
        <p className={styles.eyebrow}>{we ? t.welabsLabel : t.imagineLabel}</p>
        <h1>{title[0]}<br/><span>{title[1]}</span></h1>
        <p className={styles.description}>{we ? t.welabsCopy : t.imagineCopy}</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href={we ? '/welabs/produtos' : '/portfolio'}>{we ? t.welabsCta : t.imagineCta}<Arrow/></Link>
          <Link className={styles.secondary} href={we ? '/welabs/sobre' : '/servicos'}>{we ? t.welabsSecondary : t.imagineSecondary}<Arrow/></Link>
        </div>
      </div>
      <figure className={styles.exhibit} aria-label={t.illustration}>
        <div className={styles.exhibitHeading}><span><i aria-hidden="true"/>{we ? t.ecosystem : t.selection}</span><span aria-hidden="true">{we ? 'W / 05' : 'I / 03'}</span></div>
        {we ? <WelabsProducts locale={locale}/> : <ImagineProducts locale={locale}/>}
        <figcaption className={styles.disclaimer}><span aria-hidden="true">◇</span>{t.disclaimer}</figcaption>
      </figure>
    </div>
  </section>;
}

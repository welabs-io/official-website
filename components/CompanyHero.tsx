import Link from "./LangLink";
import catalog from "@/lib/presentation-catalog.json";
import styles from "./CompanyHero.module.css";
import { publicSlug } from "@/lib/public-slugs";

type Publisher = "Imagine" | "Welabs";
type Locale = "pt-BR" | "en";

const words = {
  "pt-BR": {
    imagineLabel: "Software e design de produto",
    imagineTitle: ["O trabalho muda.", "O software acompanha."],
    imagineCopy:
      "Design, software, integração e IA a partir de quem usa. Do processo ao produto, e do produto à operação que não para.",
    imagineCta: "Conhecer nossa atuação",
    imagineSecondary: "Portfólio",
    knowhow: "O que sabemos fazer",
    capabilityNote: "Capacidades aplicadas em produtos próprios e de clientes",
    capabilities: {
      integration: [
        "Integração e automação",
        "Processos desenhados, executados com recibo e retomados de onde pararam.",
      ],
      ai: ["Conhecimento", "IA com fonte"],
      product: ["Produto", "Software sob medida"],
      channels: ["Canais", "Atendimento e relacionamento"],
      platform: ["Plataforma", "Infraestrutura e cloud"],
    },
    welabsLabel: "Nossa empresa. Nossos produtos.",
    welabsTitle: ["Ideias que viram", "ferramentas de trabalho."],
    welabsCopy:
      "Somos a Welabs. Criamos produtos próprios para gestão, conhecimento, relacionamento e automação, com espaço para cada contexto.",
    welabsCta: "Conhecer os produtos",
    welabsSecondary: "A Welabs",
    selection: "Um recorte do portfólio",
    ecosystem: "Produtos Welabs",
    disclaimer: "Recriação ilustrativa · dados fictícios",
    concept: "Conceito",
    development: "Em desenvolvimento",
    table: "Consulta de unidades",
    site: "Acompanhamento de obras",
    recycling: "Ciclo de resíduos e reciclagem",
    flow: "O próximo passo, em contexto.",
    intake: "Entrada",
    work: "Execução",
    review: "Revisão",
    demo: "Projeto demonstração",
    unit: "Unidade DEMO",
    task: "Tarefa DEMO",
    record: "Registro DEMO",
    materials: ["Papel", "Plástico", "Metal"],
    purposes: {
      erp: "Gestão",
      wekb: "Conhecimento",
      "welabs-crm": "Relacionamento",
      malupe: "Eventos",
    },
    illustration: "Composição conceitual de produtos, com exemplos fictícios",
  },
  en: {
    imagineLabel: "Software and product design",
    imagineTitle: ["Work evolves.", "Software follows."],
    imagineCopy:
      "Design, software, integration and AI shaped around the people who use them. From process to product, and from product to an operation that keeps running.",
    imagineCta: "See how we work",
    imagineSecondary: "Portfolio",
    knowhow: "What we know how to do",
    capabilityNote: "Capabilities applied in our own and in client products",
    capabilities: {
      integration: [
        "Integration and automation",
        "Processes designed, run with receipts and resumed where they stopped.",
      ],
      ai: ["Knowledge", "AI with sources"],
      product: ["Product", "Custom software"],
      channels: ["Service", "Service and relationships"],
      platform: ["Platform", "Infrastructure and cloud"],
    },
    welabsLabel: "Our company. Our products.",
    welabsTitle: ["Ideas that become", "tools for work."],
    welabsCopy:
      "We are Welabs. We build our own products for management, knowledge, relationships and automation, with room for each context.",
    welabsCta: "Explore the products",
    welabsSecondary: "About Welabs",
    selection: "A selection from the portfolio",
    ecosystem: "Welabs products",
    disclaimer: "Illustrative recreation · fictional data",
    concept: "Concept",
    development: "In development",
    table: "Browse units",
    site: "Construction follow-up",
    recycling: "Waste and recycling cycle",
    flow: "The next step, in context.",
    intake: "Intake",
    work: "Execution",
    review: "Review",
    demo: "Demonstration project",
    unit: "DEMO unit",
    task: "DEMO task",
    record: "DEMO record",
    materials: ["Paper", "Plastic", "Metal"],
    purposes: {
      erp: "Management",
      wekb: "Knowledge",
      "welabs-crm": "Relationships",
      malupe: "Events",
    },
    illustration: "Concept product composition with fictional examples",
  },
};

function Arrow() {
  return (
    <span className={styles.arrow} aria-hidden="true">
      ↗
    </span>
  );
}

// CAPACIDADES DA IMAGINE
// The Imagine home shows know-how, not presentations: integration orchestrates the other four
// capabilities, so the hero thread goes title → integration → each capability.
function ImagineCapabilities({ locale }: { locale: Locale }) {
  const t = words[locale];
  const c = t.capabilities;
  const small = [
    ["ai", "knowledgeMotif"],
    ["product", "managementMotif"],
    ["channels", "relationshipMotif"],
    ["platform", "eventMotif"],
  ] as const;
  return (
    <div className={styles.welabsProducts}>
      <Link
        href="/servicos#integration"
        className={`${styles.product} ${styles.flowProduct}`}
        data-hero-node="integration"
        data-hero-links={small.map(([id]) => id).join(" ")}
      >
        <div className={styles.productTop}>
          <span className={styles.flowMark} aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <path
                d="M6 10h18m-5-5 5 5-5 5M30 26H12m5-5-5 5 5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.stage}>01</span>
          <Arrow />
        </div>
        <div className={styles.productTitle}>
          <strong>{c.integration[0]}</strong>
          <span>{c.integration[1]}</span>
        </div>
        <div className={styles.flowBoard} aria-hidden="true">
          {[t.intake, t.work, t.review].map((stage, i) => (
            <div key={stage}>
              <span className={styles.boardHeading}>
                <i />
                {stage}
              </span>
              <div className={styles.boardTask}>
                <span>{t.task}</span>
                <b />
                <b />
                {i === 1 && <em>↗</em>}
              </div>
            </div>
          ))}
        </div>
      </Link>
      {small.map(([id, motif], i) => (
        <Link
          key={id}
          href={`/servicos#${id}`}
          className={`${styles.product} ${styles.ecosystemProduct}`}
          data-hero-node={id}
        >
          <div className={styles.productTop}>
            <span className={styles.purpose}>{c[id][0]}</span>
            <Arrow />
          </div>
          <div className={styles.productTitle}>
            <strong>{c[id][1]}</strong>
          </div>
          <div
            className={`${styles.motif} ${styles[motif]}`}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className={styles.stage}>0{i + 2}</span>
        </Link>
      ))}
    </div>
  );
}

function WelabsProducts({ locale }: { locale: Locale }) {
  const t = words[locale];
  const products = ["erp", "wekb", "welabs-crm", "malupe"] as const;
  return (
    <div className={styles.welabsProducts}>
      {/* Hero graph: Magneto orchestrates the other products, so it links to each of them */}
      <Link
        href={`/welabs/produtos/${publicSlug("flow")}`}
        className={`${styles.product} ${styles.flowProduct}`}
        data-thread="flow"
        data-hero-node="flow"
        data-hero-links={products.join(" ")}
      >
        <div className={styles.productTop}>
          <span className={styles.flowMark} aria-hidden="true">
            {/* Official Magneto symbol (brand/welabs-produtos/svg/flow-mark-dark.svg), one color on the amber tile */}
            <svg viewBox="0 0 64 64" fill="none">
              <path
                d="M11.7 54V24.85A10.15 10.15 0 0 1 32 24.85V54M32 24.85A10.15 10.15 0 0 1 52.3 24.85V38"
                stroke="currentColor"
                strokeWidth="9.4"
              />
              <rect
                x="47.6"
                y="38"
                width="9.4"
                height="16"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className={styles.stage}>{t.development}</span>
          <Arrow />
        </div>
        <div className={styles.productTitle}>
          <strong>Magneto</strong>
          <span>{t.flow}</span>
        </div>
        <div className={styles.flowBoard} aria-hidden="true">
          {[t.intake, t.work, t.review].map((stage, i) => (
            <div key={stage}>
              <span className={styles.boardHeading}>
                <i />
                {stage}
              </span>
              <div className={styles.boardTask}>
                <span>{t.task}</span>
                <b />
                <b />
                {i === 1 && <em>↗</em>}
              </div>
            </div>
          ))}
        </div>
      </Link>
      {products.map((id) => {
        const product = catalog.find((item) => item.id === id)!;
        return (
          <Link
            key={id}
            href={`/welabs/produtos/${publicSlug(id)}`}
            className={`${styles.product} ${styles.ecosystemProduct}`}
            data-hero-node={id}
          >
            <div className={styles.productTop}>
              <span className={styles.purpose}>{t.purposes[id]}</span>
              <Arrow />
            </div>
            <div className={styles.productTitle}>
              <strong>{product.productName}</strong>
            </div>
            <div
              className={`${styles.motif} ${styles[id === "erp" ? "managementMotif" : id === "wekb" ? "knowledgeMotif" : id === "welabs-crm" ? "relationshipMotif" : "eventMotif"]}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className={styles.stage}>
              {product.maturity === "alpha" ? "Alpha" : t.development}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

// ABERTURA DAS HOMES
// Signature moment: the title rises line by line, the product cards settle, then a thread leaves
// the title and draws the graph (Imagine: integration → the other four capabilities, no product
// presentation on that home; Welabs: Magneto → every product). The heading also starts the page spine drawn by MotionLayer.
export function CompanyHero({
  publisher,
  locale,
}: {
  publisher: Publisher;
  locale: Locale;
}) {
  const we = publisher === "Welabs";
  const t = words[locale];
  const title = we ? t.welabsTitle : t.imagineTitle;
  const first = we ? "flow" : "integration";
  return (
    <section className={`${styles.hero} ${we ? styles.welabs : ""}`}>
      <div className={styles.field} data-depth="0.08" aria-hidden="true" />
      <div className={styles.layout}>
        <div className={styles.copy}>
          <img
            className={`${styles.companyLogo} ${we ? styles.welabsLogo : ""}`}
            src={
              we ? "/brands/welabs/welabs-logo-dark.svg" : "/imagine-logo.svg"
            }
            alt={publisher}
            width={we ? 153 : 152}
            height={we ? 36 : 44}
          />
          <p className={styles.eyebrow}>
            {we ? t.welabsLabel : t.imagineLabel}
          </p>
          {/* The title is the origin of the hero graph: the thread crosses the empty gutter, never the copy */}
          <h1 data-hero-node="title" data-hero-links={first}>
            <span className={styles.line}>
              <span>{title[0]}</span>
            </span>{" "}
            <span className={`${styles.line} ${styles.muted}`}>
              <span>{title[1]}</span>
            </span>
          </h1>
          <p className={styles.description}>
            {we ? t.welabsCopy : t.imagineCopy}
          </p>
          <div className={styles.actions}>
            <Link
              className={styles.primary}
              href={we ? "/welabs/produtos" : "/servicos"}
              data-magnetic=""
            >
              {we ? t.welabsCta : t.imagineCta}
              <Arrow />
            </Link>
            <Link
              className={styles.secondary}
              href={we ? "/welabs/sobre" : "/portfolio"}
            >
              {we ? t.welabsSecondary : t.imagineSecondary}
              <Arrow />
            </Link>
          </div>
        </div>
        <figure className={styles.exhibit} aria-label={t.illustration}>
          <div className={styles.exhibitHeading}>
            <span>
              <i aria-hidden="true" />
              {we ? t.ecosystem : t.knowhow}
            </span>
            <span aria-hidden="true">{we ? "W / 05" : "I / 05"}</span>
          </div>
          {we ? (
            <WelabsProducts locale={locale} />
          ) : (
            <ImagineCapabilities locale={locale} />
          )}
          <figcaption className={styles.disclaimer}>
            {we ? t.disclaimer : t.capabilityNote}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

import Link from "./LangLink";
import catalog from "@/lib/presentation-catalog.json";
import styles from "./CompanyHero.module.css";
import { publicSlug } from "@/lib/public-slugs";

type Locale = "pt-BR" | "en";

const words = {
  "pt-BR": {
    welabsLabel: "Nossa empresa. Nossos produtos.",
    welabsTitle: ["Ideias que viram", "ferramentas de trabalho."],
    welabsCopy:
      "Somos a Welabs. Criamos produtos próprios para gestão, conhecimento, relacionamento e automação, com espaço para cada contexto.",
    welabsCta: "Conhecer os produtos",
    welabsSecondary: "A Welabs",
    ecosystem: "Produtos Welabs",
    disclaimer: "Recriação ilustrativa · dados fictícios",
    development: "Em desenvolvimento",
    flow: "O próximo passo, em contexto.",
    intake: "Entrada",
    work: "Execução",
    review: "Revisão",
    task: "Tarefa DEMO",
    purposes: {
      erp: "Gestão",
      wekb: "Conhecimento",
      "welabs-crm": "Relacionamento",
      malupe: "Eventos",
    },
    illustration: "Composição conceitual de produtos, com exemplos fictícios",
  },
  en: {
    welabsLabel: "Our company. Our products.",
    welabsTitle: ["Ideas that become", "tools for work."],
    welabsCopy:
      "We are Welabs. We build our own products for management, knowledge, relationships and automation, with room for each context.",
    welabsCta: "Explore the products",
    welabsSecondary: "About Welabs",
    ecosystem: "Welabs products",
    disclaimer: "Illustrative recreation · fictional data",
    development: "In development",
    flow: "The next step, in context.",
    intake: "Intake",
    work: "Execution",
    review: "Review",
    task: "DEMO task",
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

// PRODUTOS DA WELABS NA ABERTURA
// Magneto orchestrates the other products, so the hero thread goes title → Magneto → each product.
function WelabsProducts({ locale }: { locale: Locale }) {
  const t = words[locale];
  const products = ["erp", "wekb", "welabs-crm", "malupe"] as const;
  return (
    <div className={styles.welabsProducts}>
      {/* Hero graph: Magneto orchestrates the other products, so it links to each of them */}
      <Link
        href={`/produtos/${publicSlug("flow")}`}
        className={`${styles.product} ${styles.flowProduct}`}
        data-thread="flow"
        data-hero-node="flow"
        data-hero-links={products.join(" ")}
      >
        <div className={styles.productTop}>
          <span className={styles.stage}>{t.development}</span>
          <Arrow />
        </div>
        <div className={styles.productTitle}>
          {/* Whole endorsed Magneto logo (symbol + name + "by welabs") replaces the symbol tile + name text */}
          <img
            className={styles.productLogo}
            src="/brands/welabs/products/magneto-dark-endorsed.svg"
            alt="Magneto"
            width="160"
            height="56"
          />
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
            href={`/produtos/${publicSlug(id)}`}
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

// ABERTURA DA HOME
// Signature moment: the title rises line by line, the product cards settle, then a thread leaves
// the title and draws the graph (Magneto → every product). The heading also starts the page spine
// drawn by MotionLayer. The Imagine opening left with the Imagine site on 2026-10-07.
export function CompanyHero({ locale }: { locale: Locale }) {
  const t = words[locale];
  const title = t.welabsTitle;
  return (
    <section className={`${styles.hero} ${styles.welabs}`}>
      <div className={styles.field} data-depth="0.08" aria-hidden="true" />
      <div className={styles.layout}>
        <div className={styles.copy}>
          <img
            className={`${styles.companyLogo} ${styles.welabsLogo}`}
            src="/brands/welabs/welabs-logo-dark.svg"
            alt="Welabs"
            width={153}
            height={36}
          />
          <p className={styles.eyebrow}>{t.welabsLabel}</p>
          {/* The title is the origin of the hero graph: the thread crosses the empty gutter, never the copy */}
          <h1 data-hero-node="title" data-hero-links="flow">
            <span className={styles.line}>
              <span>{title[0]}</span>
            </span>{" "}
            <span className={`${styles.line} ${styles.muted}`}>
              <span>{title[1]}</span>
            </span>
          </h1>
          <p className={styles.description}>{t.welabsCopy}</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/produtos" data-magnetic="">
              {t.welabsCta}
              <Arrow />
            </Link>
            <Link className={styles.secondary} href="/sobre">
              {t.welabsSecondary}
              <Arrow />
            </Link>
          </div>
        </div>
        <figure className={styles.exhibit} aria-label={t.illustration}>
          <div className={styles.exhibitHeading}>
            <span>
              <i aria-hidden="true" />
              {t.ecosystem}
            </span>
            <span aria-hidden="true">W / 05</span>
          </div>
          <WelabsProducts locale={locale} />
          <figcaption className={styles.disclaimer}>{t.disclaimer}</figcaption>
        </figure>
      </div>
    </section>
  );
}

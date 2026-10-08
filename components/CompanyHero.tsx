import Link from "./LangLink";
// Hidden products leave the hero composition (lib/catalog.ts)
import { isHiddenProduct } from "@/lib/catalog";
import styles from "./CompanyHero.module.css";
import { publicSlug } from "@/lib/public-slugs";

type Locale = "pt-BR" | "en";
type Pair = [pt: string, en: string];

const words = {
  "pt-BR": {
    welabsLabel: "Nossa empresa. Nossos produtos.",
    welabsTitle: ["Ideias que viram", "ferramentas de trabalho."],
    welabsCopy:
      "Somos a Welabs. Criamos produtos próprios para gestão, relacionamento, automação e conhecimento, com espaço para cada contexto.",
    welabsCta: "Conhecer os produtos",
    welabsSecondary: "A Welabs",
    ecosystem: "Produtos Welabs",
    disclaimer: "Recriação ilustrativa · dados fictícios",
    illustration: "Produtos da Welabs, com exemplos fictícios",
  },
  en: {
    welabsLabel: "Our company. Our products.",
    welabsTitle: ["Ideas that become", "tools for work."],
    welabsCopy:
      "We are Welabs. We build our own products for management, relationships, automation and knowledge, with room for each context.",
    welabsCta: "Explore the products",
    welabsSecondary: "About Welabs",
    ecosystem: "Welabs products",
    disclaimer: "Illustrative recreation · fictional data",
    illustration: "Welabs products, with fictional examples",
  },
};

type HeroProduct = {
  id: string;
  name: string;
  // Official dark endorsed logo (public/brands/welabs/products/), sized by height only
  logo: string;
  // Core cards: what the product covers; rails: its role in the chain
  label: Pair;
};

// Weight order of 2026-10-08: Domus, Relloo (core), then Magneto, Tuner, Knowly (rails)
const CORE: HeroProduct[] = [
  {
    id: "erp",
    name: "Domus",
    logo: "/brands/welabs/products/domus-dark-endorsed.svg",
    label: ["Define a empresa inteira", "Defines the whole company"],
  },
  {
    id: "welabs-crm",
    name: "Relloo",
    logo: "/brands/welabs/products/relloo-dark-endorsed.svg",
    label: ["Atende", "Serves"],
  },
];
const RAILS: HeroProduct[] = [
  {
    id: "flow",
    name: "Magneto",
    logo: "/brands/welabs/products/magneto-dark-endorsed.svg",
    // Magneto is named by its function, workflow (operator, 2026-10-08)
    label: ["Workflow", "Workflow"],
  },
  {
    id: "channels",
    name: "Tuner",
    logo: "/brands/welabs/products/tuner-dark-endorsed.svg",
    label: ["Entrega", "Delivers"],
  },
  {
    id: "wekb",
    name: "Knowly",
    logo: "/brands/welabs/products/knowly-dark-endorsed.svg",
    label: ["Explica", "Explains"],
  },
];

function Arrow() {
  return (
    <span className={styles.arrow} aria-hidden="true">
      ↗
    </span>
  );
}

// PRODUTOS DA WELABS NA ABERTURA
// Compact version of the core-and-rails hub (operator decision of 2026-10-08, option A). The core
// holds Domus (larger, first) with Relloo fitted against it; Magneto (workflow), Tuner and Knowly are
// thin bands that cross the core end to end, logo on one end and role on the other. Mobile: the core
// on top and the rails stacked. No thread leaves the title anymore. Maturity is never shown.
function WelabsProducts({ locale }: { locale: Locale }) {
  const i = locale === "en" ? 1 : 0;
  const core = CORE.filter((p) => !isHiddenProduct(p.id));
  const rails = RAILS.filter((p) => !isHiddenProduct(p.id));
  return (
    <div className={styles.welabsProducts}>
      <div className={styles.core}>
        {core.map((p) => (
          <Link
            key={p.id}
            href={`/produtos/${publicSlug(p.id)}`}
            className={styles.coreProduct}
            data-core={p.id === "erp" ? "hub" : "pair"}
            data-product={p.id}
          >
            <span className={styles.productTop}>
              <span className={styles.purpose}>{p.label[i]}</span>
              <Arrow />
            </span>
            <img
              className={styles.coreLogo}
              src={p.logo}
              alt={p.name}
              width="1005"
              height="550"
            />
            <span className={styles.motif} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </Link>
        ))}
      </div>
      {/* Rails follow the core in the DOM; their rows are set in CSS (behind it on desktop, below it on mobile) */}
      {rails.map((p) => (
        <Link
          key={p.id}
          href={`/produtos/${publicSlug(p.id)}`}
          className={styles.rail}
          data-product={p.id}
        >
          <img
            className={styles.railLogo}
            src={p.logo}
            alt={p.name}
            width="1005"
            height="550"
          />
          <span className={styles.railRole}>{p.label[i]}</span>
        </Link>
      ))}
    </div>
  );
}

// ABERTURA DA HOME
// Signature moment: the title rises line by line and the core-and-rails composition settles. The
// Welabs logo lives only in the header (no second logo here). The Imagine opening left with the
// Imagine site on 2026-10-07.
export function CompanyHero({ locale }: { locale: Locale }) {
  const t = words[locale];
  const title = t.welabsTitle;
  return (
    <section className={`${styles.hero} ${styles.welabs}`}>
      <div className={styles.field} data-depth="0.08" aria-hidden="true" />
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t.welabsLabel}</p>
          <h1>
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

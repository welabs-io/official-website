"use client";

import { useState, type CSSProperties } from "react";
import Link from "./LangLink";
import { useT } from "./LangProvider";
import catalog from "@/lib/presentation-catalog.json";
import visuals from "@/lib/presentation-visuals.json";
import emphasis from "@/lib/emphasis.json";
import motionProducts from "@/lib/motion-products.json";
import { coverFilm, posterSrc } from "./MotionFilm";
import { publicSlug } from "@/lib/public-slugs";
import styles from "./PortfolioShowcase.module.css";

type Item = (typeof catalog)[number];
type MotionProduct = (typeof motionProducts)[number];
type Locale = "pt-BR" | "en";
type Publisher = "Imagine" | "Welabs";
type Sector = "construction" | "business" | "sustainability" | "public";

const sectors: Record<Sector, [string, string]> = {
  construction: ["Construção", "Construction"],
  business: ["Negócios", "Business"],
  sustainability: ["Sustentabilidade", "Sustainability"],
  public: ["Ambiental e processos", "Environment & processes"],
};
const categories: Record<string, Sector> = {
  stant: "construction",
  tabela: "business",
  "kiosk-brands": "business",
  "central-esg": "sustainability",
  "light-recicla": "sustainability",
  ecoenel: "sustainability",
  neoenergia: "sustainability",
  wego: "public",
  autoinfracao: "public",
  docgo: "public",
  signgo: "public",
  sgors: "sustainability",
  licenciamento: "public",
  "sistema-ima": "public",
  sgici: "business",
};

// Products whose own logo names them; group or company logos (Report, Welabs) keep the name in text.
// Welabs products named on 2026-10-06 use their official lockup (symbol + welabs + name); the
// monitoring ecosystem has no product name yet and keeps the company logo with the name in text.
export const PRODUCT_LOGO = new Set([
  "flow",
  "erp",
  "wekb",
  "welabs-crm",
  "tabela",
  "stant",
  "kiosk-brands",
  "docgo",
  "signgo",
  "sgors",
  "autoinfracao",
]);

function productHref(item: Item) {
  return item.publisher === "Welabs"
    ? `/welabs/produtos/${publicSlug(item.id)}`
    : `/portfolio/${publicSlug(item.id)}`;
}

function stage(item: Item, en: boolean) {
  if (item.maturity === "alpha") return "Alpha";
  if (item.maturity === "development")
    return en ? "In development" : "Em desenvolvimento";
  if (item.maturity === "historical-pending")
    return en ? "Historical · pending review" : "Histórico · pendente";
  if (item.status === "reservado")
    return en ? "Reserved concept" : "Conceito reservado";
  if (item.status === "modulo")
    return en ? "Concept module" : "Módulo conceitual";
  return en ? "Concept presentation" : "Apresentação conceitual";
}

// CARTÃO DE SISTEMA
// Cover = closing brand frame of the film (slogan and brand). Nothing sits on the frame; below it the
// product logo (or its name, when it has no own logo) identifies the system.
type CardProps = {
  href: string;
  title: string;
  cover?: string;
  // `wide`: Welabs product lockup, wider than a product logo and drawn on its own plate
  logo?: { src: string; light: boolean; wide?: boolean } | null;
  meta: [string, string];
  summary: string;
  accent: string;
  en: boolean;
  threadTo?: string;
  id: string;
};
function SystemCard({
  href,
  title,
  cover,
  logo,
  meta,
  summary,
  accent,
  en,
  threadTo,
  id,
}: CardProps) {
  return (
    <article
      className={styles.card}
      data-product={id}
      data-thread-to={threadTo}
      data-reveal=""
      style={{ "--cover-accent": accent } as CSSProperties}
    >
      <Link href={href} className={styles.cardLink}>
        <div className={styles.cover}>
          {cover ? (
            <img
              src={cover}
              alt=""
              aria-hidden="true"
              width="1280"
              height="720"
              loading="lazy"
            />
          ) : (
            <span className={styles.coverFallback}>{title}</span>
          )}
          <span className={styles.openArrow} aria-hidden="true">
            ↗
          </span>
        </div>
        <div className={styles.cardBody}>
          <h2 className={styles.name}>
            {logo ? (
              <span
                className={`${styles.logoPlate} ${logo.light ? styles.lightPlate : styles.darkPlate}${logo.wide ? ` ${styles.widePlate}` : ""}`}
              >
                <img
                  src={logo.src}
                  alt={title}
                  width="150"
                  height="44"
                  loading="lazy"
                />
              </span>
            ) : (
              title
            )}
          </h2>
          <div className={styles.metadata}>
            <span>{meta[0]}</span>
            <span className={styles.stage}>{meta[1]}</span>
          </div>
          <p className={styles.summary}>{summary}</p>
          <span className={styles.explore}>
            {en ? "Explore" : "Conhecer"} <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

// CARTÃO DE PRODUTO
// `threadTo` makes the card the end of a thread drawn from content that mentions the product.
// `featured` is kept for callers; the collection now uses an even two-column grid.
export function ProductCard({
  item,
  locale,
  threadTo,
}: {
  item: Item;
  locale: Locale;
  featured?: boolean;
  threadTo?: string;
}) {
  const en = locale === "en";
  const copy = item.locales[locale];
  const visual = (
    visuals as Record<string, (typeof visuals)[keyof typeof visuals]>
  )[item.id];
  const film = coverFilm(item.id, item.publisher);
  const sector = categories[item.id];
  const logo =
    PRODUCT_LOGO.has(item.id) && visual.logo
      ? {
          src: visual.logo,
          light: visual.logoPlate === "light",
          wide: item.publisher === "Welabs",
        }
      : null;
  const label =
    item.publisher === "Welabs"
      ? en
        ? "Welabs product"
        : "Produto Welabs"
      : sector
        ? sectors[sector][en ? 1 : 0]
        : en
          ? "Product context"
          : "Contexto de produto";
  return (
    <SystemCard
      id={item.id}
      href={productHref(item)}
      title={copy.title}
      cover={film ? posterSrc(film) : visual.scenes[locale][0]?.src}
      logo={logo}
      meta={[label, stage(item, en)]}
      summary={copy.summary}
      accent={item.brand.palette.accent}
      en={en}
      threadTo={threadTo}
    />
  );
}

// Products shown only through films (IUS; Tuner on Welabs). Links use the public slug; the logo
// plate follows `logoPlate` (Tuner's lockup is drawn for a dark plate).
function FilmProductCard({
  product,
  en,
}: {
  product: MotionProduct;
  en: boolean;
}) {
  const film = coverFilm(product.id, product.publisher);
  const href =
    product.publisher === "Welabs"
      ? `/welabs/produtos/${publicSlug(product.id)}`
      : `/portfolio/${publicSlug(product.id)}`;
  const logo =
    "logo" in product && typeof product.logo === "string"
      ? {
          src: product.logo,
          light: !("logoPlate" in product && product.logoPlate === "dark"),
          wide: product.publisher === "Welabs",
        }
      : null;
  return (
    <SystemCard
      id={product.id}
      href={href}
      title={product.title}
      cover={film ? posterSrc(film) : undefined}
      logo={logo}
      meta={[product.sector[en ? 1 : 0], product.stage[en ? 1 : 0]]}
      summary={product.summary[en ? 1 : 0]}
      accent="var(--accent)"
      en={en}
    />
  );
}

// COLEÇÃO DE SISTEMAS
// One ranked list (presentations and film-only products), two systems per row tied by the thread.
export function PortfolioCollection({ publisher }: { publisher: Publisher }) {
  const { lang } = useT();
  const en = lang === "en";
  const locale: Locale = en ? "en" : "pt-BR";
  const [filter, setFilter] = useState<Sector | "all">("all");
  const order = emphasis[publisher === "Welabs" ? "welabs" : "imagine"];
  const rank = (id: string) => {
    const i = order.indexOf(id);
    return i < 0 ? order.length : i;
  };
  const presentations = catalog.filter(
    (item) =>
      item.publisher === publisher &&
      (publisher === "Welabs" || item.status === "selecionado"),
  );
  const films = motionProducts.filter(
    (p) => p.publisher === publisher && coverFilm(p.id, p.publisher),
  );
  const all = [
    ...presentations.map((item) => ({ id: item.id, item })),
    ...films.map((product) => ({ id: product.id, product })),
  ].sort((a, b) => rank(a.id) - rank(b.id));
  // Film-only products carry no sector, so they show under "all sectors" only.
  const entries = all.filter(
    (entry) =>
      publisher === "Welabs" ||
      filter === "all" ||
      ("item" in entry && categories[entry.id] === filter),
  );
  return (
    <div className={styles.collection}>
      <div className={styles.collectionToolbar}>
        {publisher === "Imagine" ? (
          <nav
            className={styles.filters}
            aria-label={
              en ? "Filter portfolio by sector" : "Filtrar portfólio por setor"
            }
          >
            <button
              type="button"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              {en ? "All sectors" : "Todos os setores"}{" "}
              <span>{all.length}</span>
            </button>
            {(Object.entries(sectors) as [Sector, [string, string]][]).map(
              ([key, labels]) => (
                <button
                  type="button"
                  key={key}
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                >
                  {labels[en ? 1 : 0]}
                </button>
              ),
            )}
          </nav>
        ) : (
          <p className={styles.collectionLabel}>
            {en ? "Our product ecosystem" : "Nosso ecossistema de produtos"}
          </p>
        )}
        <p className={styles.count} role="status">
          {entries.length}{" "}
          {en
            ? entries.length === 1
              ? "system"
              : "systems"
            : entries.length === 1
              ? "sistema"
              : "sistemas"}
        </p>
      </div>
      <div className={styles.grid}>
        {entries.map((entry) =>
          "item" in entry ? (
            <ProductCard key={entry.id} item={entry.item} locale={locale} />
          ) : (
            <FilmProductCard key={entry.id} product={entry.product} en={en} />
          ),
        )}
      </div>
      <p className={styles.collectionNote}>
        {en
          ? "Illustrative recreations with fictional data. The stage of each system is identified on its card."
          : "Recriações ilustrativas com dados fictícios. O estágio de cada sistema está identificado no cartão."}
      </p>
    </div>
  );
}

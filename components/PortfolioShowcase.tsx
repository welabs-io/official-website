"use client";

import type { CSSProperties } from "react";
import Link from "./LangLink";
import { useT } from "./LangProvider";
// Visible catalog only: hidden products get no card (lib/catalog.ts)
import catalog from "@/lib/catalog";
import visuals from "@/lib/presentation-visuals.json";
import emphasis from "@/lib/emphasis.json";
import motionProducts from "@/lib/motion-products.json";
import { coverFilm } from "./MotionFilm";
import { publicSlug } from "@/lib/public-slugs";
import styles from "./PortfolioShowcase.module.css";

type Item = (typeof catalog)[number];
type MotionProduct = (typeof motionProducts)[number];
type Locale = "pt-BR" | "en";

// Products named on 2026-10-06 use their endorsed product logo (symbol + name + "by welabs",
// public/brands/welabs/products/; the "welabs <product>" lockups are retired); the
// monitoring ecosystem has no product name yet and keeps the company logo with the name in text.
export const PRODUCT_LOGO = new Set(["flow", "erp", "wekb", "welabs-crm"]);

function productHref(item: Item) {
  return `/produtos/${publicSlug(item.id)}`;
}

// CARTÃO DE SISTEMA
// Cover = the product logo on a graphite plate (official dark endorsed SVG, sized by height only).
// A product without its own logo (monitoring ecosystem) shows the Welabs logo with its name in Inter.
// The logo is not repeated below the cover: the name stays as a visually hidden heading and the
// summary (which opens with the product name) carries the text. No category label is rendered.
type CardProps = {
  href: string;
  title: string;
  // `caption`: name set in Inter under a company logo, when the product has no logo of its own
  brand: { src: string; caption?: string };
  summary: string;
  accent: string;
  en: boolean;
  threadTo?: string;
  id: string;
};
function SystemCard({
  href,
  title,
  brand,
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
        <div
          className={`${styles.cover} ${brand.caption ? styles.companyCover : styles.productCover}`}
          aria-hidden="true"
        >
          <span className={styles.coverBrand}>
            <img src={brand.src} alt="" width="1005" height="550" />
            {brand.caption && (
              <span className={styles.coverCaption}>{brand.caption}</span>
            )}
          </span>
          <span className={styles.openArrow}>↗</span>
        </div>
        <div className={styles.cardBody}>
          <h2 className="sr-only">{title}</h2>
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
  // Own product logo when it exists; otherwise the company logo with the product name in text
  const brand = PRODUCT_LOGO.has(item.id)
    ? { src: visual.logo }
    : { src: visual.logo, caption: copy.title };
  return (
    <SystemCard
      id={item.id}
      href={productHref(item)}
      title={copy.title}
      brand={brand}
      summary={copy.summary}
      // Every catalog product is Welabs: the amber comes from the brand token, not the catalog hex
      accent="var(--accent)"
      en={en}
      threadTo={threadTo}
    />
  );
}

// Products shown only through films (Tuner). Links use the public slug; the cover carries the
// product's dark endorsed logo like every other Welabs product.
export function FilmProductCard({
  product,
  en,
}: {
  product: MotionProduct;
  en: boolean;
}) {
  return (
    <SystemCard
      id={product.id}
      href={`/produtos/${publicSlug(product.id)}`}
      title={product.title}
      brand={{ src: product.logo }}
      summary={product.summary[en ? 1 : 0]}
      accent="var(--accent)"
      en={en}
    />
  );
}

// ECOSSISTEMA EM HUB
// Domus (the Welabs ERP, catalog id "erp") is the hub: every other product reads the records it
// keeps, so each one is tied to it by an amber connector, never to each other. Desktop: Domus in
// the centre column, a little larger, the other four in the corners (3x3 grid). Mobile: Domus
// first and the others hanging from a vertical line that leaves it. Catalog and film-only
// products are mixed, ranked by emphasis.welabs; hidden products never get a node.
const HUB_ID = "erp";
const CORNERS = ["tl", "tr", "bl", "br"] as const;
type Entry =
  | { id: string; item: Item; product?: undefined }
  | { id: string; product: MotionProduct; item?: undefined };

function ecosystemEntries(): Entry[] {
  const order = emphasis.welabs;
  const rank = (id: string) => {
    const i = order.indexOf(id);
    return i < 0 ? order.length : i;
  };
  const films = motionProducts.filter((p) => coverFilm(p.id, p.publisher));
  return [
    ...catalog.map((item) => ({ id: item.id, item })),
    ...films.map((product) => ({ id: product.id, product })),
  ].sort((a, b) => rank(a.id) - rank(b.id));
}

export function ProductHub({
  currentId,
  threadTo = {},
}: {
  // Product whose page holds the hub: its node stays in place, dimmed
  currentId?: string;
  // Card id -> thread key, for cards that end a thread drawn by the motion layer
  threadTo?: Record<string, string>;
}) {
  const { lang } = useT();
  const en = lang === "en";
  const locale: Locale = en ? "en" : "pt-BR";
  const entries = ecosystemEntries();
  const hub = entries.find((e) => e.id === HUB_ID);
  const spokes = entries.filter((e) => e.id !== HUB_ID).slice(0, 4);
  const card = (e: Entry) =>
    e.item ? (
      <ProductCard item={e.item} locale={locale} threadTo={threadTo[e.id]} />
    ) : (
      <FilmProductCard product={e.product} en={en} />
    );
  return (
    <div className={styles.hub}>
      {hub && (
        <div
          className={`${styles.node} ${styles.hubNode}`}
          data-current={hub.id === currentId ? "" : undefined}
        >
          {card(hub)}
          <span
            className={`${styles.hubLink} ${styles.hubLinkL}`}
            aria-hidden="true"
          />
          <span
            className={`${styles.hubLink} ${styles.hubLinkR}`}
            aria-hidden="true"
          />
        </div>
      )}
      {spokes.map((e, i) => (
        <div
          key={e.id}
          className={styles.node}
          data-corner={CORNERS[i]}
          data-current={e.id === currentId ? "" : undefined}
        >
          {card(e)}
          <span className={styles.link} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

// COLEÇÃO DE PRODUTOS
// One ranked list (catalog and film-only products) laid out as the Domus hub.
export function PortfolioCollection() {
  const { lang } = useT();
  const en = lang === "en";
  const entries = ecosystemEntries();
  return (
    <div className={styles.collection}>
      <div className={styles.collectionToolbar}>
        <p className={styles.collectionLabel}>
          {en ? "Our product ecosystem" : "Nosso ecossistema de produtos"}
        </p>
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
      <ProductHub />
      <p className={styles.collectionNote}>
        {en
          ? "The films use fictional data."
          : "Os filmes usam dados fictícios."}
      </p>
    </div>
  );
}

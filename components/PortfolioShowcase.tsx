"use client";

import type { CSSProperties } from "react";
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

// Products named on 2026-10-06 use their endorsed product logo (symbol + name + "by welabs",
// public/brands/welabs/products/; the "welabs <product>" lockups are retired); the
// monitoring ecosystem has no product name yet and keeps the company logo with the name in text.
export const PRODUCT_LOGO = new Set(["flow", "erp", "wekb", "welabs-crm"]);

function productHref(item: Item) {
  return `/produtos/${publicSlug(item.id)}`;
}

function stage(item: Item, en: boolean) {
  if (item.maturity === "alpha") return "Alpha";
  if (item.maturity === "development")
    return en ? "In development" : "Em desenvolvimento";
  if (item.status === "reservado")
    return en ? "Reserved concept" : "Conceito reservado";
  return en ? "Concept presentation" : "Apresentação conceitual";
}

// CARTÃO DE SISTEMA
// Cover = closing brand frame of the film (slogan and brand). Nothing sits on the frame; below it the
// product logo (or its name, when it has no own logo) identifies the system.
type CardProps = {
  href: string;
  title: string;
  cover?: string;
  // `wide`: Welabs product logo, drawn on its own plate and sized by height only
  // `clearZone`: plate margin as a fraction of the logo height, when it differs from the shared 75/549.6
  logo?: {
    src: string;
    light: boolean;
    wide?: boolean;
    clearZone?: number;
  } | null;
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
                style={
                  logo.clearZone === undefined
                    ? undefined
                    : ({
                        "--logo-clear-zone": logo.clearZone,
                      } as React.CSSProperties)
                }
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
  const logo =
    PRODUCT_LOGO.has(item.id) && visual.logo
      ? {
          src: visual.logo,
          light: visual.logoPlate === "light",
          wide: true,
        }
      : null;
  return (
    <SystemCard
      id={item.id}
      href={productHref(item)}
      title={copy.title}
      cover={film ? posterSrc(film) : visual.scenes[locale][0]?.src}
      logo={logo}
      meta={[en ? "Welabs product" : "Produto Welabs", stage(item, en)]}
      summary={copy.summary}
      accent={item.brand.palette.accent}
      en={en}
      threadTo={threadTo}
    />
  );
}

// Products shown only through films (Tuner). Links use the public slug; the logo plate follows
// `logoPlate` (Tuner's logo is drawn for a dark plate).
function FilmProductCard({
  product,
  en,
}: {
  product: MotionProduct;
  en: boolean;
}) {
  const film = coverFilm(product.id, product.publisher);
  const logo = {
    src: product.logo,
    light: product.logoPlate !== "dark",
    wide: true,
    // Tuner's wordmark has its own clear zone (no symbol), so it overrides the shared ratio
    clearZone: product.logoClearZone,
  };
  return (
    <SystemCard
      id={product.id}
      href={`/produtos/${publicSlug(product.id)}`}
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

// COLEÇÃO DE PRODUTOS
// One ranked list (catalog and film-only products), two products per row tied by the thread.
export function PortfolioCollection() {
  const { lang } = useT();
  const en = lang === "en";
  const locale: Locale = en ? "en" : "pt-BR";
  const order = emphasis.welabs;
  const rank = (id: string) => {
    const i = order.indexOf(id);
    return i < 0 ? order.length : i;
  };
  const films = motionProducts.filter((p) => coverFilm(p.id, p.publisher));
  const entries = [
    ...catalog.map((item) => ({ id: item.id, item })),
    ...films.map((product) => ({ id: product.id, product })),
  ].sort((a, b) => rank(a.id) - rank(b.id));
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

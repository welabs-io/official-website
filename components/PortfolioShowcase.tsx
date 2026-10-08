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

// ECOSSISTEMA COMO NÚCLEO E TRILHOS
// Operator decision of 2026-10-08 (option A). The core is Domus (catalog id "erp", larger) with
// Relloo fitted against it as one block: no connector between them, only a discreet label on the
// seam. Magneto, Tuner and Knowly are cross-cutting rails: three thin horizontal bands, top to bottom
// in that order, that cross the core end to end behind it, with the product logo and its verb (for
// Magneto, its function: workflow) at one end and what travels on the rail at the other; a small pulse runs along each band (still under
// prefers-reduced-motion). Mobile: the core on top and the rails stacked as full-width bands. Catalog
// and film-only products are mixed and ranked by emphasis.welabs, so the DOM follows the weight order
// (Domus, Relloo, Magneto, Tuner, Knowly); hidden products never get a node.
const HUB_ID = "erp";
const CORE_IDS = new Set([HUB_ID, "welabs-crm"]);
type Pair = [pt: string, en: string];
// Verb of each product in the chain (shown as "<product> <verb>"), in weight order
const HUB_VERB: Record<string, Pair> = {
  erp: ["define", "defines"],
  "welabs-crm": ["atende", "serves"],
  // Magneto is named by its function, workflow, not by a verb (operator, 2026-10-08)
  flow: ["workflow", "workflow"],
  channels: ["entrega", "delivers"],
  wekb: ["explica", "explains"],
};
// Products named by a function instead of a verb read as an apposition in the chain
// ("Magneto, o workflow"); every other product reads "<product> <verb>"
const HUB_APPOSITION: Record<string, Pair> = {
  flow: [", o ", ", the "],
};
const chainJoin = (id: string, i: number) => HUB_APPOSITION[id]?.[i] ?? " ";
// What travels on each tie: the core seam (Relloo) and each rail; parts line up on one row
const HUB_WIRE: Record<string, Pair[]> = {
  "welabs-crm": [["contatos e pedidos", "contacts and orders"]],
  flow: [
    ["regra →", "rule →"],
    ["← recibo", "← receipt"],
  ],
  channels: [["avisos e conversas", "notices and conversations"]],
  wekb: [["dados e quem pode ver", "data and who can see it"]],
};
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

const entryName = (e: Entry, locale: Locale) =>
  e.item ? e.item.locales[locale].title : e.product.title;
// Dark endorsed logo of a product, for a rail end
const entryLogo = (e: Entry) =>
  e.item
    ? (visuals as Record<string, { logo: string }>)[e.id]?.logo
    : e.product.logo;

export function ProductHub({
  currentId,
  threadTo = {},
}: {
  // Product whose page holds the hub: its core card or rail is highlighted
  currentId?: string;
  // Product id -> thread key, for nodes that end a thread drawn by the motion layer
  threadTo?: Record<string, string>;
}) {
  const { lang } = useT();
  const en = lang === "en";
  const locale: Locale = en ? "en" : "pt-BR";
  const i = en ? 1 : 0;
  const entries = ecosystemEntries();
  const core = entries.filter((e) => CORE_IDS.has(e.id));
  const rails = entries.filter((e) => !CORE_IDS.has(e.id)).slice(0, 3);
  const wire = (id: string) =>
    HUB_WIRE[id]?.map((part) => <span key={part[0]}>{part[i]}</span>);
  const current = (id: string) => (id === currentId ? "" : undefined);
  return (
    <div className={styles.hubFrame}>
      <p className={styles.hubLead}>
        {en ? "Domus defines." : "O Domus define."}{" "}
        <span>
          {en ? "The others bring it to life." : "Os outros dão vida."}
        </span>
      </p>
      {/* Verb chain in weight order: Domus define · Relloo atende · ... */}
      <p className={styles.hubChain}>
        {entries
          .filter((e) => HUB_VERB[e.id])
          .map((e, n, all) => (
            // The separator closes each item, so a wrapped line never starts with it
            <span key={e.id}>
              <strong>{entryName(e, locale)}</strong>
              {chainJoin(e.id, i)}
              {HUB_VERB[e.id][i]}
              {n < all.length - 1 && <i aria-hidden="true">·</i>}
            </span>
          ))}
      </p>
      <div className={styles.hub}>
        {/* Core: Domus and Relloo fitted as one block, the seam carries its label */}
        <div className={styles.core}>
          {core.map((e, n) => (
            <div
              key={e.id}
              className={styles.coreNode}
              data-core={e.id === HUB_ID ? "hub" : "pair"}
              data-current={current(e.id)}
              style={{ order: n * 2 }}
            >
              <p className={styles.verb}>
                <strong>{entryName(e, locale)}</strong> {HUB_VERB[e.id]?.[i]}
              </p>
              {e.item ? (
                <ProductCard
                  item={e.item}
                  locale={locale}
                  threadTo={threadTo[e.id]}
                />
              ) : (
                <FilmProductCard product={e.product} en={en} />
              )}
            </div>
          ))}
          {core.length > 1 && HUB_WIRE[core[1].id] && (
            <p className={styles.seam} style={{ order: 1 }}>
              {wire(core[1].id)}
            </p>
          )}
        </div>
        {/* Rails: thin bands crossing the core, logo and verb at one end, what travels at the other */}
        {rails.map((e, n) => (
          <Link
            key={e.id}
            href={`/produtos/${publicSlug(e.id)}`}
            className={styles.rail}
            data-product={e.id}
            data-current={current(e.id)}
            data-thread-to={threadTo[e.id]}
            style={{ gridRow: n + 1 } as CSSProperties}
          >
            <span className={styles.railHead}>
              <img
                src={entryLogo(e)}
                alt={entryName(e, locale)}
                width="1005"
                height="550"
              />
              <span className={styles.railVerb}>{HUB_VERB[e.id]?.[i]}</span>
            </span>
            {HUB_WIRE[e.id] && (
              <span className={styles.railWire}>{wire(e.id)}</span>
            )}
          </Link>
        ))}
      </div>
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

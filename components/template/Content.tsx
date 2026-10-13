// BLOCOS DE CONTEÚDO DO TEMPLATE
// The static text of the site, in server markup, all of it read from lib/content (no sentence lives in a component):
// the five product cards of the home (also the other products of a product page) and the sentences of the connector
// block. The motion stays the protagonist: these blocks only say what the scenes do not.
import Link from "next/link";
import {
  HUB_NOTE,
  PAGE_HEADINGS,
  PRODUCT_CONTENT,
  TIE_LINES,
  tieKey,
} from "@/lib/content";
import type { Tie } from "@/lib/manifest/select";
import {
  LOGO_PAD,
  PRODUCTS,
  productAlt,
  productLogo,
  productBySlug,
  type ProductSlug,
} from "@/lib/products";
import type { Tone } from "@/lib/site-config";
import { Icon } from "./Icon";
import styles from "./content.module.css";
import { SectionHead } from "./SectionHead";

// CARTÕES DE PRODUTO (HOME)
// Name (the official logo), one line and the first three capabilities. The card of the product active in the ring above
// is lit (`data-on`, rewritten by ring-run on every swap); each card leads to its page.
export function ProductCards({
  tone,
  lit,
  exclude,
  label = "Produtos",
}: {
  tone: Tone;
  // The product lit by the ring above (home); none on the "other products" of a product page
  lit?: ProductSlug;
  // The product of the page, left out of the list ("Outros produtos")
  exclude?: ProductSlug;
  label?: string;
}) {
  return (
    <ul
      className={styles.cards}
      data-count={exclude ? 4 : 5}
      aria-label={label}
    >
      {PRODUCTS.filter((p) => p.slug !== exclude).map(({ slug, line }) => (
        <li key={slug}>
          <Link
            href={`/products/${slug}`}
            prefetch={false}
            className={styles.card}
            data-card={slug}
            data-on={slug === lit ? "true" : "false"}
          >
            <img
              className={styles.cardLogo}
              src={productLogo(slug, tone, "row")}
              alt={productAlt(slug, "row")}
              width={1005}
              height={550}
              loading="lazy"
              decoding="async"
              style={{ "--pad": LOGO_PAD[slug] } as React.CSSProperties}
            />
            <span className={styles.cardLine}>{line}</span>
            <span className={styles.caps}>
              {PRODUCT_CONTENT[slug].capabilities.slice(0, 3).map((cap) => (
                <span key={cap.text} className={styles.cap}>
                  <Icon name={cap.icon} size={18} />
                  {cap.text}
                </span>
              ))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// FRASES DO BLOCO DE CONECTORES
// Home: one sentence on the core and the rails. Product page: a heading and one line per connection of the product
// (the label of each connection is drawn in the block itself and comes from the motion manifest).
export function HubText({
  ties,
  lit,
}: {
  ties: readonly Tie[];
  lit?: ProductSlug;
}) {
  if (!lit)
    return (
      <div className={styles.hubNoteWrap}>
        <p className={styles.hubNote}>{HUB_NOTE}</p>
      </div>
    );
  const own = ties.filter((tie) => tie.a === lit || tie.b === lit);
  return (
    <div className={styles.hubTies}>
      <SectionHead title={PAGE_HEADINGS.ties} />
      <ul className={styles.ties}>
        {own.map((tie) => (
          <li key={tieKey(tie.a, tie.b)}>
            <strong>
              {productBySlug(tie.a)!.name} e {productBySlug(tie.b)!.name}
            </strong>
            <span>{TIE_LINES[tieKey(tie.a, tie.b)]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

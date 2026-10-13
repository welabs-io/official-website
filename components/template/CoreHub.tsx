// BLOCO DE CONECTORES: NÚCLEO E TRILHOS NA VERTICAL
// The relation of the five products at the scale of the page, in server markup and CSS only. Three rails run down at 1/6,
// 1/2 and 5/6 of the content width (Magneto, Tuner, Knowly) and cross a horizontal core box (Domus, the amber seam on
// the axis, Relloo); they come out below it and go on, past the bottom of the section, as the converging rails of the
// closing (ConnectorRail "converge"), so no line ends loose and the drawing is symmetric. Each connection carries its
// label from the chain (`ties` of lib/chain.ts): the seam between the two core products and one per rail. The logos are real
// links; on a product page `lit` is the product of the page: it stays lit with a 4 px amber bar, only the labels of its
// own connections stay and a rail it is not tied to dims. While the section is on screen (data-on, LiveObserver) one node
// lights at a time in weight order (0.48 s each, a 2.4 s cycle) and a pulse goes down the rail of the lit rail node.
import Link from "next/link";
import type { Tie } from "@/lib/chain";
import {
  PRODUCTS,
  productAlt,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import type { Tone } from "@/lib/site-config";
import styles from "./corehub.module.css";

const CORE: readonly ProductSlug[] = ["domus", "relloo"];
const RAILS: readonly ProductSlug[] = ["magneto", "tuner", "knowly"];

// A rail is tied to the product of the page when that product is in the core, or is the rail itself
const railRuns = (rail: ProductSlug, lit?: ProductSlug) =>
  !lit || CORE.includes(lit) || rail === lit;

function Node({
  slug,
  tone,
  lit,
  className,
}: {
  slug: ProductSlug;
  tone: Tone;
  lit?: ProductSlug;
  className: string;
}) {
  const order = PRODUCTS.findIndex((p) => p.slug === slug);
  const logo = (
    <img
      src={productLogo(slug, tone, "hub")}
      alt={productAlt(slug, "hub")}
      width={1005}
      height={550}
      loading="lazy"
      decoding="async"
    />
  );
  const state = !lit ? "linked" : slug === lit ? "lit" : "linked";
  // The product of the page is not a link to itself
  return slug === lit ? (
    <span
      className={className}
      data-node={slug}
      data-order={order}
      data-state={state}
      style={{ "--order": order } as React.CSSProperties}
      aria-current="page"
    >
      {logo}
    </span>
  ) : (
    <Link
      href={`/products/${slug}`}
      prefetch={false}
      className={className}
      data-node={slug}
      data-order={order}
      data-state={state}
      style={{ "--order": order } as React.CSSProperties}
    >
      {logo}
    </Link>
  );
}

export function CoreHub({
  tone,
  ties,
  lit,
}: {
  tone: Tone;
  ties: readonly Tie[];
  lit?: ProductSlug;
}) {
  // Labels that stay: all of them on the home, the ones of the product's own connections on its page
  const shown = (tie: Tie) => !lit || tie.a === lit || tie.b === lit;
  const seam = ties.find((t) => t.place === "seam");
  return (
    <div
      className={styles.hub}
      data-tone={tone}
      data-live
      data-on="false"
      role="group"
      aria-label={`Núcleo com ${CORE.length} produtos e trilhos com ${RAILS.length} produtos`}
    >
      {RAILS.map((rail, i) => {
        const tie = ties.find((t) => t.place === "rail" && t.a === rail);
        const runs = railRuns(rail, lit);
        return (
          <div
            key={rail}
            className={styles.column}
            style={{ "--i": i } as React.CSSProperties}
            data-state={runs ? "linked" : "dim"}
          >
            <Node slug={rail} tone={tone} lit={lit} className={styles.node} />
            <span className={styles.line} data-line aria-hidden="true" />
            {runs && (
              <span className={styles.clip} aria-hidden="true">
                <i
                  className={styles.pulse}
                  style={{ "--delay-order": 2 + i } as React.CSSProperties}
                />
              </span>
            )}
            {tie && shown(tie) && (
              <span className={styles.label}>{tie.label}</span>
            )}
          </div>
        );
      })}
      <div className={styles.core}>
        <Node slug="domus" tone={tone} lit={lit} className={styles.half} />
        <Node slug="relloo" tone={tone} lit={lit} className={styles.half} />
        <span className={styles.seam} aria-hidden="true" />
      </div>
      {seam && shown(seam) && (
        <span className={`${styles.label} ${styles.seamLabel}`}>
          {seam.label}
        </span>
      )}
    </div>
  );
}

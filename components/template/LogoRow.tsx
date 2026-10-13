// FILEIRA DE LOGOS: NÚCLEO E TRILHOS EM MINIATURA
// The five products in weight order as the core-and-rails drawing in miniature: Domus and Relloo in a capsule with the
// amber seam between them, Magneto, Tuner and Knowly hanging from the bus (the 2 px horizontal line behind the row)
// by a short tick. The thread of the page meets the bus on the axis, at the middle slot. The five slots are equal
// columns, so the stretch of the bus that fills with amber is plain numbers (`--lo`, `--hi`, `--origin`) the server
// writes for the first state and ring-run rewrites on every swap, with no layout reading. Under the bus a line shows the
// label of the connection of the cut (manifest `connection.label`), cross-faded on every swap. Server markup only; the
// logos are the standalone ones (endorsePolicy "row"); `links` makes each one lead to its product page.
import Link from "next/link";
import {
  PRODUCTS,
  productAlt,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import type { BusSpan } from "@/lib/bus";
import type { Tone } from "@/lib/site-config";
import styles from "./logorow.module.css";

export type LogoRowMode = "connection" | "active";

export function LogoRow({
  mode,
  tone,
  lit,
  span,
  label,
  links,
}: {
  mode: LogoRowMode;
  tone: Tone;
  // Products lit in the first state, and the stretch of the bus filled in it
  lit: readonly ProductSlug[];
  span: BusSpan;
  // Label of the connection in the first state (the chain only)
  label?: string;
  links: boolean;
}) {
  return (
    <div
      className={styles.row}
      data-row={mode}
      data-tone={tone}
      style={
        {
          "--lo": span.lo,
          "--hi": span.hi,
          "--origin": span.origin === "left" ? "0 50%" : "100% 50%",
        } as React.CSSProperties
      }
    >
      <span className={styles.bus} aria-hidden="true" />
      <span className={styles.capsule} aria-hidden="true" />
      <span className={styles.seam} aria-hidden="true" />
      <span className={styles.fill} data-fill="idle" aria-hidden="true" />
      <ul className={styles.list} aria-label="Produtos">
        {PRODUCTS.map(({ slug }) => {
          const logo = (
            <img
              src={productLogo(slug, tone, "row")}
              // Same place as the src: the name carries "by Welabs" only where the file carries the seal
              alt={mode === "connection" ? productAlt(slug, "row") : ""}
              width={1005}
              height={550}
              loading="lazy"
              decoding="async"
            />
          );
          return (
            <li
              key={slug}
              className={styles.item}
              data-slug={slug}
              data-on={lit.includes(slug) ? "true" : "false"}
            >
              {links ? (
                <Link
                  href={`/products/${slug}`}
                  prefetch={false}
                  aria-label={productAlt(slug, "row")}
                >
                  {logo}
                </Link>
              ) : (
                logo
              )}
            </li>
          );
        })}
      </ul>
      {mode === "connection" && (
        <p className={styles.label} data-label data-swap="idle">
          {label}
        </p>
      )}
    </div>
  );
}

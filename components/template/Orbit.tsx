// PALCO DOS CINCO PRODUTOS
// The Domus at the centre as the record the other products write on (Pedido 1234, of Marina), and the four other products
// around it, joined by the ties the code really has (Relloo, Magneto, Tuner and Knowly to the Domus; Tuner to Relloo).
// Pure server markup and CSS (hub.module.css): no client code.
// v2.1 (2026-10-20): every drawing has a function. The lit product shows what it did, its effect travels along its tie as
// an amber packet and lights its line in the record of the Domus; the operator's prints showed ties crossing the central
// card and floating stamps over them, so the stage is now a grid: the ties live in their own columns and end on the edge
// of the record, and every text sits inside its own card, so nothing overlaps or is cut.
// - On the home the stage follows the word that turns in the title (HOME_INTRO.words): one product lit at a time, the
//   same 12.5 s cycle.
// - Pointing at (or focusing) a product stops the cycle and lights that product instead (`:has()` in the sheet).
// - On a product page the stage is still: `lit` is the product shown lit.
// Every product is a link to its page; the product of the page is not a link to itself. Under reduced motion the cycle
// stays on its first frame (the Domus lit).
import Link from "next/link";
import { HOME_INTRO } from "@/lib/content";
import {
  productAlt,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import styles from "./hub.module.css";

type Side = Exclude<ProductSlug, "domus">;
// The four products around the record: the side of the record each one writes on
const AROUND: readonly Side[] = ["relloo", "magneto", "tuner", "knowly"];
// Order of the lines of the record: the path of the message of Marina
const LINES: readonly Side[] = ["tuner", "relloo", "knowly", "magneto"];

// Order of the cycle: the product of each word of the title
const ORDER = HOME_INTRO.words.map((w) => w.product);

export function Orbit({
  label,
  lit,
  self,
  small = false,
}: {
  label: string;
  // A still stage with this product lit (product page); none on the home, where the stage cycles with the title
  lit?: ProductSlug;
  // The product of the page: not a link to itself
  self?: ProductSlug;
  small?: boolean;
}) {
  const still = lit !== undefined;
  // The window of the cycle (0 to 4) a product is lit in
  const turnOf = (slug: ProductSlug) => ORDER.indexOf(slug);
  const { record } = HOME_INTRO;
  const node = (
    slug: ProductSlug,
    className: string,
    children: React.ReactNode,
  ) => {
    const props = {
      className,
      "data-p": slug,
      style: { "--w": turnOf(slug) } as React.CSSProperties,
    };
    return slug === self ? (
      <span key={slug} {...props} aria-current="page">
        {children}
      </span>
    ) : (
      <Link key={slug} href={`/products/${slug}`} prefetch={false} {...props}>
        {children}
      </Link>
    );
  };
  return (
    <div
      className={styles.hub}
      data-hub={still ? "still" : "cycle"}
      data-lit={lit}
      data-small={small ? "" : undefined}
      role="group"
      aria-label={label}
    >
      {AROUND.map((slug) =>
        node(
          slug,
          styles.node,
          <>
            <img
              src={productLogo(slug, "light", "row")}
              alt={productAlt(slug, "row")}
              width={1005}
              height={550}
            />
            <span className={styles.event}>{HOME_INTRO.stamps[slug]}</span>
          </>,
        ),
      )}
      {/* The ties of the code: one per product to the record, and Tuner to Relloo; the packet is the effect travelling */}
      {AROUND.map((slug) => (
        <span
          key={slug}
          className={styles.tie}
          data-of={slug}
          style={{ "--w": turnOf(slug) } as React.CSSProperties}
          aria-hidden="true"
        >
          <i className={styles.packet} />
        </span>
      ))}
      <span
        className={styles.tieUp}
        style={{ "--w": turnOf("tuner") } as React.CSSProperties}
        aria-hidden="true"
      />
      {node(
        "domus",
        styles.core,
        <>
          <img
            className={styles.coreLogo}
            src={productLogo("domus", "light", "row")}
            alt={productAlt("domus", self ? "row" : "first-mention")}
            width={1005}
            height={550}
          />
          <span className={styles.recordHead}>
            <b>{record.title}</b>
            {record.who}
          </span>
          <span className={styles.record}>
            {LINES.map((slug) => (
              <span
                key={slug}
                className={styles.line}
                data-of={slug}
                style={{ "--w": turnOf(slug) } as React.CSSProperties}
              >
                <img
                  src={productLogo(slug, "light", "row")}
                  alt=""
                  width={1005}
                  height={550}
                />
                {record.lines[slug]}
              </span>
            ))}
            <span
              className={`${styles.line} ${styles.lineDomus}`}
              data-of="domus"
              style={{ "--w": turnOf("domus") } as React.CSSProperties}
            >
              <span className={styles.ok} />
              {record.domus}
            </span>
          </span>
        </>,
      )}
    </div>
  );
}

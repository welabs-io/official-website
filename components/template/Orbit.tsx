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
import { productAlt, productLogo, type ProductSlug } from "@/lib/products";
import styles from "./hub.module.css";

type Side = Exclude<ProductSlug, "domus">;
// The four products around the record: the side of the record each one writes on
const AROUND: readonly Side[] = ["relloo", "magneto", "tuner", "knowly"];
// Order of the lines of the record: the path of the message of Marina
const LINES: readonly Side[] = ["tuner", "relloo", "knowly", "magneto"];

// Order of the cycle: the product of each word of the title
const ORDER = HOME_INTRO.words.map((w) => w.product);

// LIGAÇÕES EM SVG
// v2.2 (audit A06): a tie was a 2 px div of about 40 px with no curve, port or head. Each one is now an SVG curve in a
// fixed px box (64 × 56 between a product and the record, 12 × 64 from Tuner up to Relloo), from the product side to the
// record, with a 6 px port on each end touching the edge of its card and never entering it. The packet of the lit
// product follows the same path by `offset-path` (px, so the box never scales).
const TIE_PATHS: Record<Side, string> = {
  relloo: "M3 3 C34 3 30 53 61 53",
  magneto: "M61 3 C30 3 34 53 3 53",
  tuner: "M3 53 C34 53 30 3 61 3",
  knowly: "M61 53 C30 53 34 3 3 3",
};
const TIE_UP = "M6 61 C6 40 6 24 6 3";

function Tie({
  slug,
  d,
  w,
  up = false,
}: {
  slug: string;
  d: string;
  w: number;
  up?: boolean;
}) {
  const [width, height] = up ? [12, 64] : [64, 56];
  // The two ends of the path are its ports
  const ends = [...d.matchAll(/(-?\d+) (-?\d+)/g)].map((m) => [m[1], m[2]]);
  const ports = [ends[0], ends[ends.length - 1]];
  return (
    <span
      className={up ? styles.tieUp : styles.tie}
      data-of={up ? undefined : slug}
      style={{ "--w": w } as React.CSSProperties}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <path className={styles.wire} d={d} data-tie="" />
        <path className={styles.hot} d={d} />
        {ports.map(([x, y]) => (
          <circle
            key={`${x}-${y}`}
            className={styles.port}
            cx={x}
            cy={y}
            r="3"
          />
        ))}
      </svg>
      <i
        className={styles.packet}
        style={{ offsetPath: `path("${d}")` } as React.CSSProperties}
      />
    </span>
  );
}

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
        <Tie key={slug} slug={slug} d={TIE_PATHS[slug]} w={turnOf(slug)} />
      ))}
      <Tie slug="up" d={TIE_UP} w={turnOf("tuner")} up />
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

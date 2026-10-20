// PALCO DOS CINCO PRODUTOS (ÓRBITA)
// The Domus at the centre, as a graphite plate of rooms, and the four other products around it, joined by the ties the
// code really has (Relloo, Magneto, Tuner and Knowly to the Domus; Tuner to Relloo). Pure server markup and CSS
// (v2.module.css): no client code.
// - On the home the stage follows the word that turns in the title (HOME_INTRO.words): one product lit at a time, the
//   same 12.5 s cycle, its ties turned into amber bars with a flowing dash and its stamp of effect shown.
// - Pointing at (or focusing) a product stops the cycle and lights that product instead (`:has()` in the sheet).
// - On a product page the stage is still: `lit` is the product shown lit, with its stamp.
// Every product is a link to its page; the product of the page is not a link to itself. Under reduced motion the cycle
// stays on its first frame (the Domus lit).
import Link from "next/link";
import { HOME_INTRO } from "@/lib/content";
import {
  PRODUCTS,
  productAlt,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import styles from "./v2.module.css";

// Where each product sits, in % of the stage
const AT: Record<Exclude<ProductSlug, "domus">, { x: number; y: number }> = {
  relloo: { x: 18, y: 20 },
  magneto: { x: 82, y: 20 },
  tuner: { x: 18, y: 82 },
  knowly: { x: 82, y: 82 },
};
const CENTRE = { x: 50, y: 51 };

// The ties of the code (v13 analysis, section 1.6): the products named at both ends
const TIES: readonly (readonly [ProductSlug, ProductSlug])[] = [
  ["domus", "relloo"],
  ["domus", "magneto"],
  ["domus", "tuner"],
  ["domus", "knowly"],
  ["tuner", "relloo"],
];
const end = (slug: ProductSlug) => (slug === "domus" ? CENTRE : AT[slug]);

// Order of the cycle: the product of each word of the title
const ORDER = HOME_INTRO.words.map((w) => w.product);

export function Orbit({
  label,
  lit,
  stamp,
  self,
  small = false,
}: {
  label: string;
  // A still stage with this product lit (product page); none on the home, where the stage cycles with the title
  lit?: ProductSlug;
  // The stamp of the lit product on a still stage
  stamp?: string;
  // The product of the page: not a link to itself
  self?: ProductSlug;
  small?: boolean;
}) {
  const still = lit !== undefined;
  // The window of the cycle (0 to 4) a product is lit in
  const turnOf = (slug: ProductSlug) => ORDER.indexOf(slug);
  const node = (slug: ProductSlug, children: React.ReactNode, cls: string) => {
    const style = {
      "--w": turnOf(slug),
      ...(slug === "domus"
        ? {}
        : { left: `${AT[slug].x}%`, top: `${AT[slug].y}%` }),
    } as React.CSSProperties;
    return slug === self ? (
      <span
        key={slug}
        className={cls}
        data-p={slug}
        style={style}
        aria-current="page"
      >
        {children}
      </span>
    ) : (
      <Link
        key={slug}
        href={`/products/${slug}`}
        prefetch={false}
        className={cls}
        data-p={slug}
        style={style}
      >
        {children}
      </Link>
    );
  };
  return (
    <div
      className={styles.orbit}
      data-orbit={still ? "still" : "cycle"}
      data-lit={lit}
      data-small={small ? "" : undefined}
      role="group"
      aria-label={label}
    >
      <svg
        className={styles.links}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {TIES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            className={styles.tie}
            x1={end(a).x}
            y1={end(a).y}
            x2={end(b).x}
            y2={end(b).y}
          />
        ))}
        {/* One amber copy of each tie per end: it shows while that end is the lit product */}
        {TIES.flatMap(([a, b]) =>
          [a, b].map((of) => (
            <line
              key={`${a}-${b}-${of}`}
              className={styles.hot}
              data-of={of}
              style={{ "--w": turnOf(of) } as React.CSSProperties}
              x1={end(a).x}
              y1={end(a).y}
              x2={end(b).x}
              y2={end(b).y}
            />
          )),
        )}
      </svg>
      {node(
        "domus",
        <>
          <span className={styles.coreRooms} aria-hidden="true">
            {[1, 0, 1, 0, 1, 0].map((on, i) => (
              <i key={i} data-on={on ? "" : undefined} />
            ))}
          </span>
          <img
            src={productLogo("domus", "dark", "row")}
            alt={productAlt("domus", self ? "row" : "first-mention")}
            width={1005}
            height={550}
          />
        </>,
        styles.core,
      )}
      {PRODUCTS.filter((p) => p.slug !== "domus").map(({ slug }) =>
        node(
          slug,
          <img
            src={productLogo(slug, "light", "row")}
            alt={productAlt(slug, "row")}
            width={1005}
            height={550}
          />,
          styles.pnode,
        ),
      )}
      {(still ? [lit] : ORDER).map((slug) => (
        <span
          key={slug}
          className={styles.stamp}
          data-of={slug}
          style={{ "--w": turnOf(slug) } as React.CSSProperties}
          aria-hidden="true"
        >
          <span className={styles.ok} />
          {still ? stamp : HOME_INTRO.stamps[slug]}
        </span>
      ))}
    </div>
  );
}

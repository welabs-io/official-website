// BLOCO DE CONECTORES
// The relation of the five products as a graph, in SVG and CSS only: Domus and Relloo are the core, Magneto, Tuner and
// Knowly are the rails that cross it, and amber pulses travel along the rails. The drawing (rails, core, pulses) is an
// aria-hidden SVG; the logos are real links laid over it, so the block reads and tabs like normal content. On a product
// page `lit` is the product of the page: it stays lit, the products it is tied to stay linked and the others dim, and
// every other logo leads to its own page. Two layouts (wide, tall for phones) are rendered and CSS shows one of them.
// The pulses run only while the block is on screen (`data-live`, see LiveObserver) and stop under reduced motion.
import Link from "next/link";
import {
  CORE,
  RAILS,
  TALL,
  WIDE,
  nodeAt,
  point,
  railRuns,
  stateOf,
  type Layout,
} from "@/lib/connectors";
import {
  PRODUCTS,
  productAlt,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import styles from "./connectors.module.css";

const PULSE_SECONDS = 4.8;
// Length of a pulse (tail and head) along its rail
const PULSE = 66;

function Drawing({ layout, lit }: { layout: Layout; lit?: ProductSlug }) {
  const { width, height, from, to, core } = layout;
  const wide = layout.name === "wide";
  const [c0, c1] = core.along;
  const [a0, a1] = core.across;
  const mid = (a0 + a1) / 2;
  const box = wide
    ? { x: c0, y: a0, w: c1 - c0, h: a1 - a0 }
    : { x: a0, y: c0, w: a1 - a0, h: c1 - c0 };
  const seam = [point(layout, c0 + 24, mid), point(layout, c1 - 24, mid)];
  const gradient = `cx-pulse-${layout.name}`;
  return (
    <svg
      className={styles.drawing}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={gradient}
          x1="0"
          y1="0"
          x2={wide ? 1 : 0}
          y2={wide ? 0 : 1}
        >
          <stop offset="0" style={{ stopColor: "var(--a)", stopOpacity: 0 }} />
          <stop offset="0.85" style={{ stopColor: "var(--a)" }} />
        </linearGradient>
      </defs>
      {RAILS.map((slug, i) => {
        const across = layout.rails[i];
        const start = point(layout, from, across);
        const end = point(layout, to, across);
        return (
          <g key={slug} data-state={stateOf(slug, lit)}>
            <line
              className={styles.rail}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
            />
            <circle className={styles.end} cx={end.x} cy={end.y} r={5} />
          </g>
        );
      })}
      {/* Pulses go over the rails and under the core: they enter it on one side and come out on the other */}
      {RAILS.map((slug, i) => {
        if (!railRuns(slug, lit)) return null;
        const start = point(layout, from, layout.rails[i]);
        const travel = point(layout, to - from, 0);
        return (
          <g key={slug} transform={`translate(${start.x} ${start.y})`}>
            <rect
              className={styles.pulse}
              x={wide ? -PULSE : -2}
              y={wide ? -2 : -PULSE}
              width={wide ? PULSE : 4}
              height={wide ? 4 : PULSE}
              fill={`url(#${gradient})`}
              style={
                {
                  "--dx": `${travel.x}px`,
                  "--dy": `${travel.y}px`,
                  "--delay": `${(i * PULSE_SECONDS) / RAILS.length}s`,
                } as React.CSSProperties
              }
            />
          </g>
        );
      })}
      <rect
        className={styles.core}
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={16}
      />
      <rect
        className={styles.coreGlow}
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={16}
      />
      <line
        className={styles.seam}
        x1={seam[0].x}
        y1={seam[0].y}
        x2={seam[1].x}
        y2={seam[1].y}
      />
    </svg>
  );
}

function Nodes({
  layout,
  lit,
  tone,
}: {
  layout: Layout;
  lit?: ProductSlug;
  tone: "dark" | "light";
}) {
  return PRODUCTS.map(({ slug }) => {
    const spot = nodeAt(layout, slug);
    const state = stateOf(slug, lit);
    const style = {
      left: `${(spot.left / layout.width) * 100}%`,
      top: `${(spot.top / layout.height) * 100}%`,
      width: `${(spot.width / layout.width) * 100}%`,
    };
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
    // The product of the page is not a link to itself
    return slug === lit ? (
      <span
        key={slug}
        className={styles.node}
        data-state={state}
        data-slug={slug}
        aria-current="page"
        style={style}
      >
        {logo}
      </span>
    ) : (
      <Link
        key={slug}
        href={`/products/${slug}`}
        prefetch={false}
        className={styles.node}
        data-state={state}
        data-slug={slug}
        style={style}
      >
        {logo}
      </Link>
    );
  });
}

export function Connectors({
  lit,
  tone,
}: {
  lit?: ProductSlug;
  tone: "dark" | "light";
}) {
  const layouts = [WIDE, TALL];
  return (
    <div
      className={styles.root}
      data-tone={tone}
      data-live
      data-on="false"
      role="group"
      aria-label={`Núcleo com ${CORE.length} produtos e trilhos com ${RAILS.length} produtos`}
    >
      {layouts.map((layout) => (
        <div
          key={layout.name}
          className={`${styles.graph} ${styles[layout.name]}`}
          style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
        >
          <Drawing layout={layout} lit={lit} />
          <Nodes layout={layout} lit={lit} tone={tone} />
        </div>
      ))}
    </div>
  );
}

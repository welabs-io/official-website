// VISÃO GERAL DA CADEIA (BLOCO DE CIMA)
// The chain in one glance: the products in the order of the plot as standalone logos over a thin line, the token
// "Pedido 1234" that walks it, the caption of the step and, under it, the connector that drops from the lit node to the
// top of the ring below. Server markup in SVG and CSS, no video, no library. It has no clock: the ring swaps scenes and
// components/ring/overview-follow.ts rewrites data attributes and custom properties on the `ring:swap` event, so the
// caption and the lit node change with the scene. The first state drawn here is the first step; the script next to the
// block carries the rest of the steps.
import { ICON_STROKE } from "@/lib/icon-stroke";
import { overviewData, type OverviewStep } from "@/lib/overview-data";
import { stepVars } from "@/lib/overview-geometry";
import { productAlt, productLogo, type ProductSlug } from "@/lib/products";
import type { Tone } from "@/lib/site-config";
import styles from "./chain-overview.module.css";

// Name of the token, the same on every step
export const TOKEN_LABEL = "Pedido 1234";

type NodeState = "on" | "touch" | "off";

// Lit nodes are on; the ends of the token that are not lit stay half-way; the rest recede
const stateOf = (col: number, step: OverviewStep): NodeState =>
  step.nodes.includes(col)
    ? "on"
    : col === step.from || col === step.to
      ? "touch"
      : "off";

// `step` is the step drawn first (a product page starts on the first step the product takes part in); `self` marks the
// product of the page, which keeps a bar under its logo whatever the step lights
export function ChainOverview({
  tone,
  step = 0,
  self,
}: {
  tone: Tone;
  step?: number;
  self?: ProductSlug;
}) {
  const data = overviewData();
  const count = data.order.length;
  const first = data.steps[step];
  const style = {
    "--n": count,
    ...stepVars(first, count),
  } as React.CSSProperties;
  return (
    <div
      className={styles.overview}
      data-overview
      data-token="idle"
      data-pulse="idle"
      style={style}
    >
      <ul className={styles.cols} aria-label="Produtos da cadeia">
        {data.order.map((end, col) => (
          <li
            key={end}
            className={styles.col}
            data-col={col}
            data-state={stateOf(col, first)}
            data-self={end === self ? "true" : undefined}
          >
            {end === "outcome" ? (
              <svg
                className={styles.outcome}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={ICON_STROKE}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m7.5 12.5 3 3 6-6.5" />
              </svg>
            ) : (
              <img
                src={productLogo(end as ProductSlug, tone, "row")}
                // Same place as the src: no "by Welabs" where the standalone file has no seal
                alt={productAlt(end as ProductSlug, "row")}
                width={1005}
                height={550}
                decoding="async"
              />
            )}
          </li>
        ))}
      </ul>
      <div className={styles.line} aria-hidden="true">
        <i className={styles.base} />
        <i className={styles.trail} />
        {data.order.map((end, col) => (
          <b
            key={end}
            className={styles.node}
            data-col={col}
            data-state={stateOf(col, first)}
            style={{ "--c": col } as React.CSSProperties}
          />
        ))}
        <span className={styles.token}>{TOKEN_LABEL}</span>
      </div>
      {/* Caption of the step: plain text updated by the follower, not a live region (the carousel changes by itself);
          the scene is named by the aria-label of the active tile of the ring below */}
      <p className={styles.legend} data-legend data-swap="idle">
        {first.label}
      </p>
      <div className={styles.drop} data-drop aria-hidden="true">
        {data.order.map((end, col) => (
          <i
            key={end}
            className={styles.stem}
            data-col={col}
            data-on={first.nodes.includes(col) ? "true" : "false"}
            style={{ "--c": col } as React.CSSProperties}
          >
            <i className={styles.pulse} />
          </i>
        ))}
        <i className={`${styles.half} ${styles.left}`}>
          <i className={styles.sweep} />
        </i>
        <i className={`${styles.half} ${styles.right}`}>
          <i className={styles.sweep} />
        </i>
        <i className={styles.axis} data-axis>
          <i className={styles.pulse} />
        </i>
        <b className={styles.dock} />
      </div>
      {/* What overview-follow plays, so the lazy chunk reads the DOM instead of importing the chain */}
      <script
        type="application/json"
        data-overview-data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}

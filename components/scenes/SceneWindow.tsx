// JANELA DE PRODUTO DAS CENAS
// The frame every scene shares: a product window with a 32 px bar (three muted dots and the path "Product / Place" in
// 12 px, with an optional piece of context on the right). No amber in the bar: the only amber dot at the top of the
// stage is the connector of the overview. Server markup; the body is whatever the scene draws.
import type { ReactNode } from "react";
import { WINDOW_TITLES } from "@/lib/scenes/story";
import styles from "./scenes.module.css";

export type WindowProduct = keyof typeof WINDOW_TITLES;

export function SceneWindow({
  product,
  meta,
  children,
}: {
  product: WindowProduct;
  // Context on the right of the bar (the order the screen is about)
  meta?: string;
  children: ReactNode;
}) {
  const { name, where } = WINDOW_TITLES[product];
  return (
    <div className={styles.win} data-product={product} data-edge="">
      <div className={styles.bar}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.path}>
          <b>{name}</b>
          <span>{where}</span>
        </span>
        {meta ? <span className={styles.barMeta}>{meta}</span> : null}
      </div>
      <div className={styles.body} data-body="">
        {children}
      </div>
    </div>
  );
}

// JANELA DE PRODUTO DAS CENAS
// The frame every scene shares: a product window with a discreet bar (three muted dots, the product name and where in
// the product the screen is). Server markup; the body is whatever the scene draws.
import type { ReactNode } from "react";
import { WINDOW_TITLES } from "@/lib/scenes/story";
import styles from "./scenes.module.css";

export type WindowProduct = keyof typeof WINDOW_TITLES;

export function SceneWindow({
  product,
  children,
}: {
  product: WindowProduct;
  children: ReactNode;
}) {
  const { name, where } = WINDOW_TITLES[product];
  return (
    <div className={styles.win} data-product={product}>
      <div className={styles.bar}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.name}>{name}</span>
        <span className={styles.where}>{where}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

"use client";
// SEÇÃO 4: CADEIA
// The chain film in loop behind the Welabs opening, and beside it the list of the five products lighting up as the film
// advances, in step with the film time like the event timeline of the khal.ai channels section. Nothing here holds the
// scroll. While the film is not playing (off screen, reduced motion) every product shows lit.
import { useState } from "react";
import { CHAIN_BEATS, CHAIN_SLIDE } from "@/lib/motion-slides";
import { LOGO_PAD, PRODUCTS, productLogo } from "@/lib/products";
import { Reel } from "./Reel";
import styles from "./home.module.css";
import shell from "./shell.module.css";

export const CHAIN_TITLE = "Os cinco trabalham em cadeia";

// ETAPA DA CADEIA
// null: static, all lit. -1: opening playing, none lit. 0 to 4: the product being shown (the ones before it stay lit).
// 5: the closing beat, all lit.
export function chainStep(
  t: number | null,
  beats = CHAIN_BEATS,
): number | null {
  if (t === null) return null;
  if (t < 0) return -1;
  const passed = beats.filter((beat) => t >= beat).length;
  return passed === 0 ? -1 : passed - 1;
}

export function stateOfRow(
  step: number | null,
  i: number,
): "current" | "done" | "idle" {
  if (step === null || step >= PRODUCTS.length) return "done";
  if (i === step) return "current";
  return i < step ? "done" : "idle";
}

export function Chain() {
  const [step, setStep] = useState<number | null>(null);
  return (
    <section
      id="chain"
      className={`${shell.band} ${shell.light} ${styles.chain}`}
    >
      <div className={`${shell.wrap} ${styles.chainGrid}`}>
        <Reel
          id="chain"
          slides={[CHAIN_SLIDE]}
          index={0}
          onFilmTime={(t) => setStep(chainStep(t))}
        />
        <div className={styles.chainText}>
          <h2 className={shell.title}>{CHAIN_TITLE}</h2>
          <ol className={styles.steps}>
            {PRODUCTS.map((product, i) => (
              <li key={product.slug} data-state={stateOfRow(step, i)}>
                <img
                  src={productLogo(product.slug, "light")}
                  alt={`${product.name} by Welabs`}
                  width={1005}
                  height={550}
                  style={
                    { "--pad": LOGO_PAD[product.slug] } as React.CSSProperties
                  }
                />
                <p>{product.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

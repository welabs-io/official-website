"use client";
// SEÇÃO 1: TOPO
// Short title, one supporting line and the call to action beside a reel that advances on its own through the openings
// of the five products (Domus, Relloo, Magneto, Tuner, Knowly), like the windows of the khal.ai hero. The names under
// the frame are a manual switch; the amber block marks the opening that is showing.
import { useState } from "react";
import { HERO_SLIDES } from "@/lib/motion-slides";
import { CTA_LABEL, HERO_LINE, HERO_TITLE, PRODUCTS } from "@/lib/products";
import { CONTACT_HREF } from "./contact";
import { Reel } from "./Reel";
import styles from "./home.module.css";
import shell from "./shell.module.css";

export function Hero() {
  const [index, setIndex] = useState(0);
  return (
    <section className={`${shell.band} ${shell.dark} ${styles.hero}`}>
      <div className={`${shell.wrap} ${styles.heroGrid}`}>
        <div className={styles.heroText}>
          <h1 className={shell.title}>{HERO_TITLE}</h1>
          <p className={shell.line}>{HERO_LINE}</p>
          <a href={CONTACT_HREF} className={`${shell.cta} ${shell.ctaBig}`}>
            {CTA_LABEL}
          </a>
        </div>
        <div className={styles.heroStage}>
          <Reel
            id="hero"
            slides={HERO_SLIDES}
            index={index}
            onIndex={setIndex}
            eager
          />
          <ul className={styles.names}>
            {PRODUCTS.map((product, i) => (
              <li key={product.slug}>
                <button
                  type="button"
                  aria-pressed={i === index}
                  onClick={() => setIndex(i)}
                >
                  {product.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

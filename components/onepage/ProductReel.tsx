"use client";
// CARROSSEL DA PÁGINA DE PRODUTO
// The product's opening and then each of its films, one after the other and in full, on their own. The small squares
// under the frame are a manual switch (the amber one is the slide that is showing); there is no player interface.
import { useState } from "react";
import { productReel } from "@/lib/motion-slides";
import type { ProductSlug } from "@/lib/products";
import { Reel } from "./Reel";
import styles from "./home.module.css";

export function ProductReel({ slug }: { slug: ProductSlug }) {
  const slides = productReel(slug);
  const [index, setIndex] = useState(0);
  return (
    <div className={styles.heroStage}>
      <Reel
        id={`product-${slug}`}
        slides={slides}
        index={index}
        onIndex={setIndex}
        eager
      />
      <ul className={styles.dots}>
        {slides.map((slide, i) => (
          <li key={slide.key}>
            <button
              type="button"
              aria-pressed={i === index}
              aria-label={i === 0 ? "Abertura" : `Filme ${i}`}
              onClick={() => setIndex(i)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

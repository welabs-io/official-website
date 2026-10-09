"use client";
// SEÇÃO 2: PRODUTOS
// The five products in a circular carousel, in weight order (Domus, Relloo, Magneto, Tuner, Knowly), one product per
// tile. Each one opens with the tail of its brand opening (only the logo forming, no tagline), which blends without a
// gap into the main film of the product; the film holds its settled last frame for 1 s and then the ring rotates to the
// next product (0.4 s, the same swap as the chain carousel). The next tile is mounted and parked before it is needed.
// Under the carousel the row of logos: the active product lights up and each logo leads to its page. No controls, no
// progress bar, no pause; under reduced motion the swap happens without the rotation.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PRODUCT_SLIDES } from "@/lib/motion-slides";
import { PRODUCTS, productLogo } from "@/lib/products";
import styles from "@/components/lab/lab.module.css";
import { ensurePlayer } from "./player";
import { Playback, flatten } from "./ring-playback";
import { ringPosition } from "./Ring";
import home from "./home.module.css";
import shell from "./shell.module.css";

// One flat list for the playback: opening tail then film, product after product
const FLAT = flatten(PRODUCT_SLIDES);

export function Products() {
  const stage = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);

  // The playback runs only while the section is on screen
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const io = new IntersectionObserver(([entry]) =>
      setLive(entry.isIntersecting),
    );
    io.observe(element);
    return () => io.disconnect();
  }, []);

  // One tile per product: the segments of a slide play in the layer container of its tile
  useEffect(() => {
    if (!live) return;
    let dead = false;
    let playback: Playback | null = null;
    ensurePlayer().then(() => {
      if (dead) return;
      playback = new Playback({
        flat: FLAT,
        layers: () => tiles.current,
        start: 0,
        ahead: 2,
        single: true,
        tiles: true,
        tileBySlide: true,
        onSlide: () => {},
        onSwap: (info) => {
          // The opening tail blending into its film is not a rotation
          if (info.from === info.to) return;
          stage.current?.style.setProperty("--swap-time", `${info.duration}s`);
          setActive(info.to);
          window.dispatchEvent(
            new CustomEvent("ring:swap", {
              detail: { ring: "products", from: info.from, to: info.to },
            }),
          );
        },
      });
      playback.start();
    });
    return () => {
      dead = true;
      playback?.destroy();
      // The next run starts over at the first product
      setActive(0);
    };
  }, [live]);

  return (
    <section
      id="products"
      className={`${shell.band} ${shell.light} ${home.products}`}
    >
      <h2 className={home.srOnly}>Produtos</h2>
      <div className={shell.wrap}>
        <div
          className={`${styles.screen} ${styles.inline}`}
          ref={stage}
          data-ring="products"
        >
          <div className={styles.stage}>
            {PRODUCT_SLIDES.map((slide, i) => {
              const pos = ringPosition(i, active, PRODUCT_SLIDES.length);
              // Everything past the first neighbour sits hidden behind, on its own side
              const place = Math.max(-2, Math.min(2, pos));
              return (
                <div
                  key={slide.key}
                  className={styles.tile}
                  data-pos={place}
                  aria-hidden={pos === 0 ? undefined : true}
                >
                  <div className={styles.tileFrame}>
                    <img
                      className={styles.poster}
                      src={slide.poster}
                      alt=""
                      width={1280}
                      height={720}
                      loading={Math.abs(pos) <= 1 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <div
                      className={styles.layers}
                      ref={(node) => {
                        tiles.current[i] = node;
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <ul className={styles.products} aria-label="Produtos">
            {PRODUCTS.map(({ slug, name }, i) => (
              <li
                key={slug}
                className={styles.product}
                data-on={i === active ? "true" : "false"}
              >
                <Link
                  href={`/products/${slug}`}
                  aria-label={`${name} by Welabs`}
                >
                  <img
                    src={productLogo(slug, "light")}
                    alt=""
                    height={28}
                    decoding="async"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

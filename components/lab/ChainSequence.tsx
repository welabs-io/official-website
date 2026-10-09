"use client";
// BANCADA: CARROSSEL CIRCULAR DA CADEIA (bloco b)
// The cuts of lib/home-montage.json in a circular carousel: the active cut sits in the centre, large and playing; the
// previous and the next cut sit at the sides, smaller and dimmed, frozen on a still frame. After the hold of the active
// cut (holdAfter) the ring rotates (position, scale and opacity animate together) for 0.4 s between products and 0.3 s
// inside one; the incoming cut was mounted and parked on its first frame, so there is no gap. No controls, no progress
// bar, no pause; under reduced motion the swap happens without the rotation. `window` receives a `ring:swap` event at
// each handoff.
import { useEffect, useRef, useState } from "react";
import { ensurePlayer } from "@/components/onepage/player";
import { Playback, flatten } from "@/components/onepage/ring-playback";
import { ringPosition } from "@/components/onepage/Ring";
import { MONTAGE_SLIDES } from "@/lib/motion-slides";
import { PRODUCTS, productLogo, type ProductSlug } from "@/lib/products";
import styles from "./lab.module.css";

// One tile per cut, in playing order
const CUTS = flatten(MONTAGE_SLIDES);
// Products of each cut, in playing order (same order as CUTS)
export const CUT_PRODUCTS: readonly (readonly ProductSlug[])[] =
  MONTAGE_SLIDES.flatMap((slide) =>
    slide.segments.map((segment) => segment.products ?? []),
  );

export function ChainSequence() {
  const stage = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  // Products shown by the active cut (explicit `products` field of each cut in lib/home-montage.json)
  const lit = CUT_PRODUCTS[active] ?? [];

  // Playback of the whole montage: every cut owns the layer container of its tile
  useEffect(() => {
    let dead = false;
    let playback: Playback | null = null;
    ensurePlayer().then(() => {
      if (dead) return;
      playback = new Playback({
        flat: CUTS,
        layers: () => tiles.current,
        start: 0,
        ahead: 2,
        single: true,
        tiles: true,
        onSlide: () => {},
        onSwap: (info) => {
          // The rotation lasts as long as the push of the cut that is leaving
          stage.current?.style.setProperty("--swap-time", `${info.duration}s`);
          setActive(info.toIndex);
          // Latency of the handoff: from the play() call to the first movement of the new timeline
          const el = playback?.currentElement;
          const timeline = () => {
            try {
              const frame = el?.shadowRoot?.querySelector("iframe");
              const win = frame?.contentWindow as
                | (Window & {
                    __timelines?: Record<string, { time: () => number }>;
                  })
                | null
                | undefined;
              return Object.values(win?.__timelines ?? {})[0];
            } catch {
              return undefined;
            }
          };
          const start = timeline()?.time();
          const detail: Record<string, unknown> = {
            ring: "lab-chain",
            from: info.from,
            to: info.to,
            fromCut: info.fromIndex,
            toCut: info.toIndex,
            duration: info.duration,
            at: info.at,
          };
          const poll = () => {
            const now = timeline()?.time();
            if (start !== undefined && now !== undefined && now > start) {
              detail.latency = performance.now() - info.at;
              window.dispatchEvent(new CustomEvent("ring:started", { detail }));
            } else if (performance.now() - info.at < 2000) {
              requestAnimationFrame(poll);
            }
          };
          requestAnimationFrame(poll);
          window.dispatchEvent(new CustomEvent("ring:swap", { detail }));
        },
      });
      (window as unknown as { __labPlayback?: Playback }).__labPlayback =
        playback;
      playback.start();
    });
    return () => {
      dead = true;
      playback?.destroy();
    };
  }, []);

  return (
    <div
      className={styles.screen}
      ref={stage}
      data-cut={active + 1}
      data-lit={lit.join(",")}
    >
      <div className={styles.stage} data-ring="lab-chain">
        {CUTS.map((cut, i) => {
          const pos = ringPosition(i, active, CUTS.length);
          // Everything past the first neighbour sits hidden behind, on its own side
          const place = Math.max(-2, Math.min(2, pos));
          return (
            <div
              key={`${cut.id}-${i}`}
              className={styles.tile}
              data-pos={place}
              aria-hidden={pos === 0 ? undefined : true}
            >
              <div className={styles.tileFrame}>
                <img
                  className={styles.poster}
                  src={`/motion/posters/cut-${i + 1}.jpg`}
                  alt=""
                  width={1280}
                  height={720}
                  loading="eager"
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
        {PRODUCTS.map(({ slug, name }) => (
          <li
            key={slug}
            className={styles.product}
            data-on={lit.includes(slug) ? "true" : "false"}
          >
            <img
              src={productLogo(slug, "dark")}
              alt={name}
              height={28}
              decoding="async"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

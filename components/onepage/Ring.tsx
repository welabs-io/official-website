"use client";
// CARROSSEL CIRCULAR DE MOTION
// A ring of 16:9 frames: the active one sits in the centre, larger; its neighbours sit at the sides, smaller and dimmed;
// on each change every frame glides to its new position (position, scale and opacity). The pieces play back to back
// with no gap (ring-playback.ts): the next player is preloaded and starts before the swap, so it is already running
// when it reaches the centre. No player interface: a neighbour is clickable, nothing else. The page controller decides
// when the ring is live (visible enough, never under reduced motion); outside that every frame shows its cover.
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getController } from "./motion-store";
import { ensurePlayer } from "./player";
import {
  Playback,
  SWAP_SECONDS,
  firstSegmentOf,
  flatten,
} from "./ring-playback";
import type { Slide } from "@/lib/motion-slides";
import styles from "./ring.module.css";

// Position of a slide around the ring: 0 centre, -1 and 1 neighbours, 2 and -2 hidden behind
export function ringPosition(index: number, active: number, count: number) {
  const half = Math.floor(count / 2);
  return ((index - active + count + half) % count) - half;
}

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (notify: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

export function Ring({
  id,
  label,
  slides,
  caption,
  swap = SWAP_SECONDS,
  ahead = 1,
  eager = false,
}: {
  id: string;
  label: string;
  slides: readonly Slide[];
  // Content under the ring for the active slide (cross-fades with it)
  caption?: (slide: Slide) => ReactNode;
  // Duration of the position swap, in seconds (also the lead of the handoff between slides)
  swap?: number;
  // Segments ahead that keep a ready player (short clips need two)
  ahead?: number;
  eager?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const playback = useRef<Playback | null>(null);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  const flat = flatten(slides, swap);

  // Register the ring with the page controller; mount and unmount only flip the live flag
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    return getController().register({
      id,
      element,
      mount: () => setLive(true),
      unmount: () => setLive(false),
      play: () => {},
      pause: () => {},
    });
  }, [id]);

  // Effect events read the latest state without restarting the playback
  const startAt = useEffectEvent(() => firstSegmentOf(flat, active));
  const swapped = useEffectEvent((to: number, from: number) => {
    window.dispatchEvent(
      new CustomEvent("ring:swap", {
        detail: { ring: id, from, to, at: performance.now() },
      }),
    );
  });

  // Playback while the ring is live
  useEffect(() => {
    if (!live) return;
    let dead = false;
    ensurePlayer().then(
      () => {
        if (dead) return;
        const next = new Playback({
          flat,
          layers: () => layers.current,
          start: startAt(),
          ahead,
          onSlide: setActive,
          onSwap: (info) => swapped(info.to, info.from),
        });
        playback.current = next;
        next.start();
      },
      () => {},
    );
    return () => {
      dead = true;
      playback.current?.destroy();
      playback.current = null;
    };
    // The flat list is derived from `slides`, which is a module constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  const go = (index: number) => {
    if (playback.current) playback.current.jump(index);
    else setActive(index);
  };

  return (
    <div className={styles.ring} role="region" aria-label={label}>
      <div
        ref={box}
        className={styles.stage}
        data-ring={id}
        data-live={live ? "true" : "false"}
        style={{ "--swap-time": `${swap}s` } as React.CSSProperties}
      >
        {slides.map((slide, i) => {
          const pos = ringPosition(i, active, slides.length);
          // Everything past the first neighbour sits hidden behind, on its own side
          const place = Math.max(-2, Math.min(2, pos));
          return (
            <div
              key={slide.key}
              className={styles.tile}
              data-pos={place}
              aria-hidden={pos === 0 ? undefined : true}
            >
              <div className={styles.frame}>
                <img
                  className={styles.poster}
                  src={slide.poster}
                  alt=""
                  width={1280}
                  height={720}
                  loading={eager || Math.abs(pos) <= 1 ? "eager" : "lazy"}
                  decoding="async"
                />
                <div
                  className={styles.layers}
                  ref={(node) => {
                    layers.current[i] = node;
                  }}
                />
              </div>
              {Math.abs(pos) === 1 && !reduced && (
                <button
                  type="button"
                  className={styles.hit}
                  aria-label={slide.label}
                  onClick={() => go(i)}
                />
              )}
            </div>
          );
        })}
      </div>
      {caption && (
        <div className={styles.captions}>
          {slides.map((slide, i) => (
            <div
              key={slide.key}
              className={styles.caption}
              data-on={i === active ? "true" : "false"}
              aria-hidden={i === active ? undefined : true}
            >
              {caption(slide)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

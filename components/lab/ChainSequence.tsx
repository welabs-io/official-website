"use client";
// BANCADA: SEQUÊNCIA DA CADEIA (bloco a)
// Only the base of the chain montage, full screen: the clips of lib/home-montage.json one after the other at the
// montage speed, each one already preloaded and running when the previous one closes (crossfade, no gap, no opening).
// No ring yet. The small caption shows the step and the clip; `window` receives a `ring:swap` event at each handoff.
import { useEffect, useRef, useState } from "react";
import { ensurePlayer } from "@/components/onepage/player";
import { Playback, flatten } from "@/components/onepage/ring-playback";
import montage from "@/lib/home-montage.json";
import { MONTAGE_RATE, MONTAGE_SLIDES } from "@/lib/motion-slides";
import styles from "./lab.module.css";

// Crossfade between two clips, in seconds
const CROSSFADE = 0.15;

export function ChainSequence() {
  const host = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  // Playback of the whole montage in one frame: every slide shares the same layer container
  useEffect(() => {
    let dead = false;
    let playback: Playback | null = null;
    ensurePlayer().then(() => {
      if (dead) return;
      playback = new Playback({
        flat: flatten(MONTAGE_SLIDES, CROSSFADE, CROSSFADE),
        layers: () => MONTAGE_SLIDES.map(() => host.current),
        start: 0,
        ahead: 2,
        single: true,
        onSlide: setStep,
        onSwap: (info) => {
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

  const current = montage.steps[step];
  return (
    <div className={styles.screen}>
      <div className={styles.frame}>
        <div ref={host} className={styles.host} />
      </div>
      <p className={styles.caption}>
        {step + 1}/{montage.steps.length} · {current.step} ·{" "}
        {current.segments
          .map((c) => `${c.film.split("-ludic")[0]} ${c.start}-${c.end} s`)
          .join(" + ")}{" "}
        · {MONTAGE_RATE}x
      </p>
    </div>
  );
}

"use client";
// BANCADA: SEQUÊNCIA DA CADEIA (bloco a)
// Only the base of the chain montage, full screen: the cuts of lib/home-montage.json one after the other, each at its
// own rate, product cuts interleaved with relation cuts. The next cut is mounted, painted and parked on its first
// frame before it enters, and enters by a push (0.4 s between products, 0.3 s inside one); no crossfade, no opening,
// no loader and no debug footer. No ring yet. `window` receives a `ring:swap` event at each handoff.
import { useEffect, useRef, useState } from "react";
import { ensurePlayer } from "@/components/onepage/player";
import { Playback, flatten } from "@/components/onepage/ring-playback";
import { MONTAGE_SLIDES } from "@/lib/motion-slides";
import styles from "./lab.module.css";

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
        flat: flatten(MONTAGE_SLIDES),
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

  return (
    <div className={styles.screen} data-step={step + 1}>
      <div className={styles.frame}>
        <div ref={host} className={styles.host} />
      </div>
    </div>
  );
}

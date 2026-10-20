// CENAS QUE SE REPETEM NA TELA
// v2.1: the outcomes of the home ("O que muda na operação") were settled frames, so nothing on them moved (measured on
// 2e98392: 0 running animations in #operation). Each one is now a scene that plays its own story while it is on screen
// and plays it again after a pause: the call and the message become one person, the answer arrives with its source, the
// order comes back confirmed. The server draws the settled frame (`data-phase="end"`, also the frame without script and
// under reduced motion); this module, fetched with the descent chunk after hydration, only writes the phase of each scene
// marked `data-replay` (its length in seconds). The motion itself is the CSS of the scenes (fx.css).

import { installPlays } from "@/components/plays/play-run";
import { restartScene } from "./restart";

// Seconds the settled frame stays before the scene plays again
const PAUSE = 2.2;

export function install() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

  const play = (scene: HTMLElement) => {
    // v2.2: from zero through restartScene (start → play alone left the finished animations on their last frame)
    restartScene(scene, "play");
    const seconds = Number(scene.dataset.replay) || 2.5;
    timers.set(
      scene,
      setTimeout(() => play(scene), (seconds + PAUSE) * 1000),
    );
  };
  const stop = (scene: HTMLElement) => {
    clearTimeout(timers.get(scene));
    timers.delete(scene);
    scene.dataset.phase = "end";
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const scene = entry.target as HTMLElement;
        if (entry.isIntersecting && !reduced.matches && !timers.has(scene))
          play(scene);
        else if (!entry.isIntersecting && timers.has(scene)) stop(scene);
      }
    },
    { threshold: 0.5 },
  );
  // The scenes of the page now and of every route that comes later (the slot of a product changes)
  const seen = new WeakSet<Element>();
  const scan = () => {
    document.querySelectorAll("[data-replay]").forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      io.observe(el);
    });
  };
  scan();
  const mo = new MutationObserver(scan);
  mo.observe(document.body, { childList: true, subtree: true });
  // v2.2: the little script of the product plays rides on this chunk (components/plays/play-run.ts)
  const stopPlays = installPlays();
  return () => {
    stopPlays();
    io.disconnect();
    mo.disconnect();
    timers.forEach((t) => clearTimeout(t));
  };
}

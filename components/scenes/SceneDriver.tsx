"use client";
// MOTOR DAS CENAS (CLIENTE, SOB DEMANDA)
// The only client piece of the stage, and it renders nothing. One observer decides when the runner (scene-run.ts, a small
// chunk fetched with a dynamic import) is downloaded (400 px before the stage) and when it runs: with half of the stage
// on screen, the tab visible and no reduced motion. Any of the three going away pauses the scenes where they are (the
// CSS animations and the timer); coming back resumes them. Everything is released on unmount.
import { useEffect } from "react";

export function SceneDriver({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loaded: Promise<typeof import("./scene-run")> | null = null;
    let runner: ReturnType<typeof import("./scene-run").run> | null = null;
    let visible = false;
    let dead = false;
    const wanted = () =>
      visible && !document.hidden && !reduced.matches && !dead;

    const update = () => {
      if (!wanted()) {
        runner?.pause();
        return;
      }
      if (runner) {
        runner.resume();
        return;
      }
      loaded ??= import("./scene-run");
      loaded.then(
        (mod) => {
          // The stage may have left the screen while the chunk was downloading
          if (!wanted() || runner) return;
          runner = mod.run(root);
          runner.resume();
        },
        () => {
          // The chunk failed to download: the settled scenes stay, and the next visibility change tries again
          loaded = null;
        },
      );
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        if (!reduced.matches) loaded ??= import("./scene-run");
      },
      { rootMargin: "400px 0px" },
    );
    const on = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        update();
      },
      { threshold: [0, 0.5] },
    );
    near.observe(root);
    on.observe(root);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => {
      dead = true;
      near.disconnect();
      on.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      runner?.destroy();
      runner = null;
    };
  }, [rootId]);

  return null;
}

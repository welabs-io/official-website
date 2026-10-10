"use client";
// MOTOR DO CARROSSEL (CLIENTE, SOB DEMANDA)
// The only client piece of a ring, and a tiny one: it renders nothing. Two observers decide when the heavy part
// (ring-run.ts and the player script, both fetched with a dynamic import) is downloaded and when it plays:
//  - near the screen (400 px margin): the code is fetched, nothing runs;
//  - on screen, tab visible and no reduced motion: the playback runs; any of the three going away stops it.
// Everything is released on unmount: both observers, the listeners and the playback.
import { useEffect } from "react";

export type RingKind = "chain" | "products" | "films" | "hero";

export function RingDriver({
  rootId,
  kind,
  slug,
}: {
  rootId: string;
  kind: RingKind;
  slug?: string;
}) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loaded: Promise<typeof import("./ring-run")> | null = null;
    const load = () => (loaded ??= import("./ring-run"));
    let visible = false;
    let stop: (() => void) | null = null;
    let pending = false;
    let dead = false;
    const wanted = () =>
      visible && !document.hidden && !reduced.matches && !dead;

    const update = () => {
      if (!wanted()) {
        stop?.();
        stop = null;
        return;
      }
      if (stop || pending) return;
      pending = true;
      load().then((mod) => {
        pending = false;
        // The ring may have left the screen while the code was downloading
        if (wanted() && !stop) stop = mod.run(root, kind, slug);
      });
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Fetch the code and the player script ahead of time; they cost nothing until the ring plays
        load().then((mod) => mod.warm());
        near.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    const on = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
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
      stop?.();
      stop = null;
    };
  }, [rootId, kind, slug]);

  return null;
}

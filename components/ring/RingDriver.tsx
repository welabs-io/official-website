"use client";
// MOTOR DO CARROSSEL (CLIENTE, SOB DEMANDA)
// Observers load content navigation near the screen and suspend video playback when the ring leaves the viewport.
// Reduced motion keeps navigation available without downloading the player; unmount releases every listener.
import { useEffect } from "react";
import type { RingController } from "./ring-run";

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
    let controller: RingController | null = null;
    let pending = false;
    let dead = false;
    const wanted = () =>
      visible && !document.hidden && !reduced.matches && !dead;

    const update = () => {
      if (controller) {
        if (wanted()) controller.play();
        else controller.pause();
        return;
      }
      if (!visible || pending || dead) return;
      pending = true;
      load().then(
        (mod) => {
          pending = false;
          if (dead) return;
          // Bind navigation independently from motion preference, then reconcile current visibility.
          controller = mod.run(root, kind, slug);
          update();
        },
        () => {
          // The chunk failed to download: the covers stay, and the next visibility change tries again
          pending = false;
          loaded = null;
        },
      );
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        // Content navigation still loads under reduced motion; only the player script is skipped.
        load().then(
          (mod) => {
            if (!reduced.matches && !dead) mod.warm();
          },
          () => {
            loaded = null;
          },
        );
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
      controller?.destroy();
      controller = null;
    };
  }, [rootId, kind, slug]);

  return null;
}

"use client";
// NAVEGAÇÃO IMEDIATA E MÍDIA SOB DEMANDA
// Hydration binds content intentions immediately; the readable frame governs media warming and playback.
// Reduced motion keeps navigation available without downloading the player; unmount releases every listener.
import { useEffect } from "react";
import type { RingController } from "./ring-run";
import { bootstrapNavigation } from "./navigation-bootstrap";
import { motionOcclusion } from "./scroll-selected-motion";

export const READABLE_FRAME_RATIO = 0.55;

export type RingKind =
  "chain" | "products" | "films" | "hero" | "preview" | "story" | "overview";

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
    const navigation = bootstrapNavigation(root, () => bind(true));

    const bind = (force = false) => {
      if (controller) {
        if (wanted()) controller.play();
        else controller.pause();
        return;
      }
      if ((!visible && !force) || pending || dead) return;
      pending = true;
      load().then(
        (mod) => {
          pending = false;
          if (dead) return;
          // Bind navigation independently from motion preference, then reconcile current visibility.
          controller = mod.run(root, kind, slug);
          navigation.flush(controller);
          update();
        },
        () => {
          // The chunk failed to download: the covers stay, and the next visibility change tries again
          pending = false;
          loaded = null;
        },
      );
    };
    const update = () => bind();

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
    const on = new IntersectionObserver(
      ([entry]) => {
        visible =
          entry.isIntersecting &&
          entry.intersectionRatio >= READABLE_FRAME_RATIO;
        update();
      },
      {
        // A title, caption or single bottom pixel must not consume a once-only opening before the reader sees it.
        rootMargin: `-${Math.ceil(motionOcclusion())}px 0px 0px`,
        threshold: [0, READABLE_FRAME_RATIO],
      },
    );
    // Observe the media itself in every surface; surrounding navigation can be visible while the frame is unreadable.
    const playbackTarget =
      root.querySelector<HTMLElement>("[data-motion-viewport], [data-ring]") ??
      root;
    near.observe(playbackTarget);
    on.observe(playbackTarget);
    // Bind navigation independently of IntersectionObserver delivery and preserve any first pending intention.
    if (root.dataset.navigation === "true") bind(true);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => {
      dead = true;
      near.disconnect();
      on.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      navigation.destroy();
      controller?.destroy();
      controller = null;
    };
  }, [rootId, kind, slug]);

  return null;
}

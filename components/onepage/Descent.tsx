"use client";
// DESCIDA CONTÍNUA
// The home and the product pages are one page (app/(site)/layout.tsx). This piece renders nothing: it fetches the engine
// of the descent (descent-run.ts, a chunk of its own, outside the initial JS) right after hydration and tells it every
// time a new route is in the DOM. What the engine does: a card of the home grows into the product while the page scrolls
// down to it, the door at the end of a product grows into the next one, the browser's back runs the same move in
// reverse, and scrolling up past a product returns to the home. Before the chunk arrives, links work as plain
// navigation.
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

type Run = typeof import("./descent-run");
let engine: Run | null = null;

export function Descent() {
  const router = useRouter();
  const pathname = usePathname();

  // The new route is in the DOM: release the moves waiting for it
  useLayoutEffect(() => {
    engine?.release(pathname);
  }, [pathname]);

  useEffect(() => {
    let stop: (() => void) | null = null;
    let dead = false;
    // Registered here, synchronously and in the capture phase, so it runs before the router's own listener (which
    // commits the previous route at once): the reverse move reads the product while it is still in the DOM
    const onPop = () => engine?.hooks.pop();
    window.addEventListener("popstate", onPop, true);
    import("./descent-run").then(
      (mod) => {
        if (dead) return;
        engine = mod;
        stop = mod.install(router, location.pathname);
      },
      () => {
        // The chunk failed to download: links stay plain navigation
      },
    );
    return () => {
      dead = true;
      window.removeEventListener("popstate", onPop, true);
      stop?.();
    };
  }, [router]);

  return null;
}

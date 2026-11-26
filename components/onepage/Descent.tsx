"use client";
// TRANSIÇÃO ENTRE PÁGINAS
// The header and the footer stay mounted across the pages of the site (app/(site)/layout.tsx). This piece renders
// nothing: it fetches the engine of the move (descent-run.ts, a chunk of its own, outside the initial JS) right after
// hydration and tells it every time a new route is in the DOM. What the engine does: any link to a product opens the
// brand opening of that product and lands on it; the way home and the browser's back and forward cross a plain sheet.
// v2.1: a click on a link of the home or of a product that arrives while the chunk is still downloading is held and
// handed to the engine when it lands (measured: the menu swapped the page with no move when clicked early), so the move
// runs on every click, not only on the late ones.
// v2.3 (2026-11-26): the early clicks are held by an inline script of the layout (early-hold.ts), in place while the
// HTML is parsed; held from this module (v2.2), the hold came after the links had hydrated on the production build.
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { publicPath } from "@/lib/i18n/config";
import { useMessages } from "@/lib/i18n/provider";
import { releaseEarlyHold } from "./early-hold";

type Run = typeof import("./descent-run");
let engine: Run | null = null;

export function Descent() {
  const router = useRouter();
  // The router reports the rewritten path of the default locale (/pt-BR/products/x); the engine compares addresses
  const pathname = publicPath(usePathname());
  // i18n: the words the brand openings draw, in the locale of the page (the engine is told again if the locale changes)
  const { openings } = useMessages();

  // The new route is in the DOM: release the moves waiting for it
  useLayoutEffect(() => {
    engine?.release(pathname);
  }, [pathname]);

  useEffect(() => {
    let stop: (() => void) | null = null;
    let dead = false;
    // Registered here, synchronously and in the capture phase, so it runs before the router's own listener (which
    // commits the previous route at once): the sheet covers the page before it changes
    const onPop = () => engine?.hooks.pop();
    window.addEventListener("popstate", onPop, true);
    let stopReplay: (() => void) | null = null;
    // The scenes that play again while on screen ride on the same moment (components/scenes/replay.ts)
    import("@/components/scenes/replay").then(
      (mod) => {
        if (!dead) stopReplay = mod.install();
      },
      () => {
        // The chunk failed: the scenes keep their settled frame
      },
    );
    import("./descent-run").then(
      (mod) => {
        if (dead) return;
        engine = mod;
        stop = mod.install(router, location.pathname, openings);
        // The engine takes the clicks from here on: stop holding and hand it the held click, if any
        const a = releaseEarlyHold();
        if (a) mod.hooks.click(a);
      },
      () => {
        // The chunk failed to download: a held click goes as plain navigation, and links stay plain navigation
        const a = releaseEarlyHold();
        if (a) router.push(new URL(a.href).pathname);
      },
    );
    return () => {
      dead = true;
      window.removeEventListener("popstate", onPop, true);
      stop?.();
      stopReplay?.();
    };
  }, [router, openings]);

  return null;
}

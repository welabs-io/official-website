"use client";
// TRANSIÇÃO ENTRE PÁGINAS
// The header and the footer stay mounted across the pages of the site (app/(site)/layout.tsx). This piece renders
// nothing: it fetches the engine of the move (descent-run.ts, a chunk of its own, outside the initial JS) right after
// hydration and tells it every time a new route is in the DOM. What the engine does: any link to a product opens the
// brand opening of that product and lands on it; the way home and the browser's back and forward cross a plain sheet.
// v2.1: a click on a link of the home or of a product that arrives while the chunk is still downloading is held and
// handed to the engine when it lands (measured: the menu swapped the page with no move when clicked early), so the move
// runs on every click, not only on the late ones.
// v2.2 (2026-10-26): the hold starts when this module is evaluated, before hydration, and no longer in the effect.
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { publicPath, stripLocale } from "@/lib/i18n/config";
import { useMessages } from "@/lib/i18n/provider";

type Run = typeof import("./descent-run");
let engine: Run | null = null;

// CLIQUE RETIDO ATÉ O MOTOR CHEGAR
// Until the engine lands, a plain click on a link to the home or to a product is held (the last one wins). Registered
// when the module is evaluated: in the effect it came 150 to 240 ms after the links had hydrated (measured 2026-10-26,
// dev server on 88bdfb7), and a click in that window went to next/link as a plain swap with no brand opening (8 of 8
// clicks). Kept at module scope, so an effect that runs again (Strict Mode, a new locale) never drops a held click.
let held: HTMLAnchorElement | null = null;
function onEarly(event: MouseEvent) {
  if (engine || event.button !== 0 || event.metaKey || event.ctrlKey) return;
  const a =
    event.target instanceof Element
      ? event.target.closest<HTMLAnchorElement>("a[href]")
      : null;
  const url = a && new URL(a.href, location.href);
  if (!a || !url || url.origin !== location.origin || url.hash) return;
  // i18n: the page without its locale prefix (/en/products/relloo is the product page like /products/relloo)
  const page = stripLocale(url.pathname);
  if (page !== "/" && !page.startsWith("/products/")) return;
  if (url.pathname === location.pathname) return;
  event.preventDefault();
  held = a;
}
// A module evaluated again (Fast Refresh) replaces the holder of the previous evaluation, which would hold every click
const HOLDER = Symbol.for("welabs.descent.holder");
type HolderWindow = Window & { [HOLDER]?: (event: MouseEvent) => void };
if (typeof window !== "undefined") {
  const w = window as HolderWindow;
  const previous = w[HOLDER];
  if (previous) window.removeEventListener("click", previous, true);
  w[HOLDER] = onEarly;
  window.addEventListener("click", onEarly, true);
}
// The engine takes the clicks from here on: stop holding and hand it the held click, if any
function releaseHeld() {
  window.removeEventListener("click", onEarly, true);
  const a = held;
  held = null;
  return a;
}

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
        const a = releaseHeld();
        if (a) mod.hooks.click(a);
      },
      () => {
        // The chunk failed to download: a held click goes as plain navigation, and links stay plain navigation
        const a = releaseHeld();
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

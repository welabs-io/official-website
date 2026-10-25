"use client";
// TRANSIÇÃO ENTRE PÁGINAS
// The header and the footer stay mounted across the pages of the site (app/(site)/layout.tsx). This piece renders
// nothing: it fetches the engine of the move (descent-run.ts, a chunk of its own, outside the initial JS) right after
// hydration and tells it every time a new route is in the DOM. What the engine does: any link to a product opens the
// brand opening of that product and lands on it; the way home and the browser's back and forward cross a plain sheet.
// v2.1: a click on a link of the home or of a product that arrives while the chunk is still downloading is held and
// handed to the engine when it lands (measured: the menu swapped the page with no move when clicked early), so the move
// runs on every click, not only on the late ones.
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { publicPath, stripLocale } from "@/lib/i18n/config";
import { useMessages } from "@/lib/i18n/provider";

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
    let held: HTMLAnchorElement | null = null;
    // Registered here, synchronously and in the capture phase, so it runs before the router's own listener (which
    // commits the previous route at once): the sheet covers the page before it changes
    const onPop = () => engine?.hooks.pop();
    // Until the engine lands, a plain click on a link to the home or to a product is held (the last one wins)
    const onEarly = (event: MouseEvent) => {
      if (engine || event.button !== 0 || event.metaKey || event.ctrlKey)
        return;
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
    };
    window.addEventListener("popstate", onPop, true);
    window.addEventListener("click", onEarly, true);
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
        window.removeEventListener("click", onEarly, true);
        if (held) mod.hooks.click(held);
      },
      () => {
        // The chunk failed to download: a held click goes as plain navigation, and links stay plain navigation
        window.removeEventListener("click", onEarly, true);
        if (held) router.push(new URL(held.href).pathname);
      },
    );
    return () => {
      dead = true;
      window.removeEventListener("popstate", onPop, true);
      window.removeEventListener("click", onEarly, true);
      stop?.();
      stopReplay?.();
    };
  }, [router, openings]);

  return null;
}

"use client";
// TRANSIÇÃO ENTRE PÁGINAS
// The site has two kinds of page (the home and the five product pages) and every move between them is one view
// transition: the page leaves with a short fade and rise, the next one arrives the same way, and the logo morphs from the
// card that was clicked to the hero of the product (or from one product to the next). Only opacity and transform move
// (app/globals.css draws it). Mounted once in the root layout; it renders nothing.
//
// One click listener on the window, in the capture phase, takes the clicks on links to "/" and to "/products/<slug>"
// before the Link of Next does, and navigates itself inside `document.startViewTransition`. The new snapshot is taken
// when the new page has committed (the layout effect on the path below). Without the API, or under reduced motion, the
// same navigation runs with no animation.
//
// The history stays honest: a move from one product to another replaces the entry, so the browser's back button and the
// "Voltar" of the switcher (`data-nav="back"`) return to where the visitor came from; when that was the home, "Voltar"
// goes back in the history and the browser puts the home at the position the visitor left.
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

const FROM_HOME = "wl:from-home";
const LOGO = "product-logo";
const PRODUCT = "/products/";

// Resolves the pending view transition once the new page is in the DOM
let settle: (() => void) | null = null;

// Session storage can be blocked (private mode, a sandbox): the flag is then simply absent
const flag = {
  get: () => {
    try {
      return sessionStorage.getItem(FROM_HOME) === "1";
    } catch {
      return false;
    }
  },
  set: (on: boolean) => {
    try {
      if (on) sessionStorage.setItem(FROM_HOME, "1");
      else sessionStorage.removeItem(FROM_HOME);
    } catch {
      // nothing to keep
    }
  },
};

// The destination of a link when the transition handles it: same origin, another page, the home or a product page, and
// no anchor (a jump to a section of the home stays a plain navigation)
function destination(a: HTMLAnchorElement): URL | null {
  if ((a.target && a.target !== "_self") || a.hasAttribute("download"))
    return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.hash) return null;
  if (url.pathname === location.pathname) return null;
  if (url.pathname !== "/" && !url.pathname.startsWith(PRODUCT)) return null;
  return url;
}

const anchorOf = (target: EventTarget | null) =>
  target instanceof Element
    ? target.closest<HTMLAnchorElement>("a[href]")
    : null;

export function RouteMotion() {
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    // Back on the home by any way: the next "Voltar" has no home entry to return to until a card is clicked again
    if (pathname === "/") flag.set(false);
    const done = settle;
    settle = null;
    done?.();
  }, [pathname]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefetched = new Set<string>();

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const a = anchorOf(event.target);
      const url = a && destination(a);
      if (!a || !url) return;
      event.preventDefault();

      const from = location.pathname;
      const href = url.pathname + url.search;
      const toProduct = url.pathname.startsWith(PRODUCT);
      const fromProduct = from.startsWith(PRODUCT);
      const back = a.dataset.nav === "back" && flag.get();
      if (from === "/" && toProduct) flag.set(true);
      const go = () => {
        if (back) window.history.back();
        else if (fromProduct && toProduct) router.replace(href);
        else router.push(href);
      };

      if (reduced.matches || !document.startViewTransition) {
        go();
        return;
      }
      // The logo that morphs: the one inside the clicked link when it leads to a product from outside one (a card of the
      // home); the hero of a product page already carries the name in CSS
      const named: HTMLElement[] = [];
      const name = (el: HTMLElement | null) => {
        if (!el) return;
        el.style.viewTransitionName = LOGO;
        named.push(el);
      };
      if (toProduct && !fromProduct) name(a.querySelector("img"));
      const slugLeft = fromProduct ? from.slice(PRODUCT.length) : null;

      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            // A navigation that never commits (an error page, a slow network) must not freeze the page
            const timer = window.setTimeout(finish, 1500);
            function finish() {
              window.clearTimeout(timer);
              settle = null;
              // Back on the home: the card of the product just left takes the logo, so it lands where it came from
              if (url!.pathname === "/" && slugLeft)
                name(
                  document.querySelector<HTMLElement>(
                    `a[data-card="${slugLeft}"] img`,
                  ),
                );
              resolve();
            }
            settle = finish;
            go();
          }),
      );
      transition.finished.finally(() => {
        for (const el of named) el.style.viewTransitionName = "";
      });
    };

    // Fetch the next page while the pointer or the focus is on its link, so the transition does not wait for it
    const onIntent = (event: Event) => {
      const a = anchorOf(event.target);
      const url = a && destination(a);
      if (!url || prefetched.has(url.pathname)) return;
      prefetched.add(url.pathname);
      router.prefetch(url.pathname);
    };

    window.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      window.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }, [router]);

  return null;
}

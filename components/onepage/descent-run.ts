// MOTOR DA TRANSIÇÃO ENTRE PÁGINAS (SOB DEMANDA)
// The home and each product are pages of their own (app/(site)/layout.tsx keeps the header and the footer mounted, the
// route fills the slot between them). This module only runs the move between them. It is a chunk of its own, fetched by
// Descent.tsx right after hydration, so it stays out of the initial JS of the page.
// - Any link to a product (a card, the menu, the product selector, a product of the stage, the footer) opens the brand
//   opening of that product (components/intro/intro-run.ts), in a compact panel grown from the box of what was clicked;
//   the product is committed at the top of the window under the cover behind the panel, and comes in as the panel
//   leaves.
// - The way home by the logo, and the browser's back and forward, cross a plain sheet; back to the home returns to where
//   the visitor left it.
// v3 (2026-10-21): the product no longer opens under the home, so the scroll up past a product and the sheet that
// shrank back into its card left with it; the way back is the menu and the logo.
// The URL is always the real route (`/products/<slug>`), so a product is shareable and opens directly. Only transform,
// opacity, clip-path and scroll move; under reduced motion every move is an instant jump.
import type { useRouter } from "next/navigation";
import {
  isSlug,
  open,
  prepare,
  prepareAll,
} from "@/components/intro/intro-run";
import { stripLocale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/types";
import styles from "./descent.module.css";

type Router = ReturnType<typeof useRouter>;

// i18n: an address may carry the locale prefix (/en/products/relloo); the move reads the page without it
const PRODUCT = "/products/";
const slugOf = (path: string) => {
  const page = stripLocale(path);
  return page.startsWith(PRODUCT)
    ? page.slice(PRODUCT.length).replace(/\/$/, "")
    : null;
};

type Box = { x: number; y: number; w: number; h: number };

// ESTADO DA VISITA
// Kept for the whole visit (the layout never unmounts): where the visitor left the home and whether a move is running
const memory = {
  homeY: null as number | null,
  busy: false,
  path: "",
};

// Resolves the moves waiting for the next route to be in the DOM
let waiters: (() => void)[] = [];
const committed = (ms = 4000) =>
  new Promise<boolean>((resolve) => {
    const timer = window.setTimeout(() => resolve(false), ms);
    waiters.push(() => {
      window.clearTimeout(timer);
      resolve(true);
    });
  });

const box = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
const maxScroll = () =>
  document.documentElement.scrollHeight - window.innerHeight;
const jump = (y: number) =>
  window.scrollTo({
    top: Math.max(0, Math.min(y, maxScroll())),
    behavior: "instant",
  });
const heroLogo = () =>
  document.querySelector<HTMLImageElement>(
    "[data-descent-slot] #product h1 img",
  );

// A PÁGINA NOVA SOB O QUADRO FINAL
// Resolves once two frames in a row arrive on time (or after `ms`): the long frames of a page that has just been
// committed (its layout, its images) pass while the closing frame of the opening holds still. The page under the
// opening is left as it is (hiding it, by content-visibility or visibility, cost a long frame of its own when the sheet
// closed over it, measured on the production build); its scene clocks wait instead (scene-kit/timeline.ts)
const calm = (ms = 400) =>
  new Promise<void>((done) => {
    const start = performance.now();
    let last = start;
    let onTime = 0;
    const tick = (now: number) => {
      onTime = now - last < 24 ? onTime + 1 : 0;
      last = now;
      if (onTime >= 2 || now - start > ms) done();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

// Ease in and out (cubic): the sheet starts and lands softly
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

function tween(ms: number, frame: (t: number) => void) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      frame(t);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

// A plain sheet over the whole window, for the moves that only swap the page (the way home, back and forward): it
// fades in, the page changes under it, and it fades out
function veil() {
  const el = document.createElement("div");
  el.className = styles.veil;
  document.body.append(el);
  return {
    in: () => tween(200, (t) => (el.style.opacity = String(ease(t)))),
    out: async () => {
      await tween(320, (t) => (el.style.opacity = String(1 - ease(t))));
      el.remove();
    },
  };
}

// Wheel and touch scrolling are held while a move runs, so the visitor does not fight the scroll of the move; the page
// is marked as moving (`data-moving` on <html>), which closes the menu of the header (shell.module.css)
const hold = (e: Event) => e.preventDefault();
function lockInput(on: boolean) {
  if (on) document.documentElement.dataset.moving = "";
  else delete document.documentElement.dataset.moving;
  const fn = on ? window.addEventListener : window.removeEventListener;
  fn("wheel", hold, { passive: false } as AddEventListenerOptions);
  fn("touchmove", hold, { passive: false } as AddEventListenerOptions);
}

// What Descent.tsx calls on popstate and on a click that arrived before this chunk (set by `install`)
export const hooks = {
  pop: () => {},
  click: (() => false) as (a: HTMLAnchorElement) => boolean,
};

// The new route is in the DOM (called by Descent.tsx on every commit): release the moves waiting for it
export function release(pathname: string) {
  memory.path = pathname;
  const list = waiters;
  waiters = [];
  for (const done of list) done();
}

// Takes over the links and the back button; returns the way to let go.
// i18n: `openings` is the text the brand openings draw, in the locale of the page
export function install(
  router: Router,
  pathname: string,
  openings: Messages["openings"],
) {
  memory.path = pathname;
  history.scrollRestoration = "manual";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefetched = new Set<string>();

  // ENTRAR NUM PRODUTO: A ABERTURA DA MARCA
  // v4 (operator, 2026-10-24: "depois não abre mais a intro no clique dos produtos"): the whole opening on every entry
  // into a product, from any link, the product selector included (the short flash of later entries read as no opening)
  async function enter(origin: Element, href: string, slug: string) {
    memory.busy = true;
    if (!slugOf(location.pathname)) memory.homeY = scrollY;
    if (reduced.matches || !isSlug(slug)) {
      router.push(href, { scroll: false });
      await committed();
      jump(0);
      memory.busy = false;
      return;
    }
    lockInput(true);
    let playing: Awaited<ReturnType<typeof open>> | null = null;
    try {
      playing = await open(slug, box(origin), openings);
      // v5 (2026-10-24): the next page is committed only when the closing frame holds still, and the closing frame
      // stays until the frames of that page have passed (measured on 709ccb0, production build: its render was a 50 to
      // 190 ms frame half a second into the choreography, where it used to be pushed)
      // v6 (2026-10-26): the opening plays in a compact panel with the page visible behind it, so `closing` also waits
      // for the cover (the canvas) to be whole behind the panel: the swap and the scroll to the top happen out of sight
      await playing.closing;
      router.push(href, { scroll: false });
      await committed();
      jump(0);
      await calm();
      await playing.land(heroLogo());
    } catch {
      // The opening could not load: the page swaps with no move
      playing?.abort();
      if (location.pathname !== new URL(href, location.href).pathname) {
        router.push(href, { scroll: false });
        await committed();
      }
      jump(0);
    }
    lockInput(false);
    memory.busy = false;
  }

  // IR PARA A HOME PELO LOGO
  async function home(href: string) {
    memory.busy = true;
    const v = reduced.matches ? null : veil();
    await v?.in();
    router.push(href, { scroll: false });
    await committed();
    jump(0);
    await v?.out();
    memory.busy = false;
  }

  // VOLTAR E AVANÇAR
  // Runs on popstate, before the router commits the other route: the sheet covers at once, the page changes under it,
  // and the home comes back where the visitor left it (a product, at its top)
  async function cross(toPath: string) {
    memory.busy = true;
    const v = reduced.matches ? null : veil();
    // The veil covers at once: the router commits inside its own listener, right after this one
    v?.in();
    await committed();
    jump(slugOf(toPath) ? 0 : (memory.homeY ?? 0));
    await v?.out();
    memory.busy = false;
  }

  const anchorOf = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLAnchorElement>("a[href]")
      : null;

  // Links the move takes over: same origin, the home or a product, no anchor
  function destination(a: HTMLAnchorElement): URL | null {
    if ((a.target && a.target !== "_self") || a.hasAttribute("download"))
      return null;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.hash) return null;
    if (url.pathname === location.pathname) return null;
    const page = stripLocale(url.pathname);
    if (page !== "/" && !page.startsWith(PRODUCT)) return null;
    return url;
  }

  // Runs the move of a link; false when the link is not one the move takes
  function follow(a: HTMLAnchorElement): boolean {
    const url = destination(a);
    if (!url) return false;
    if (memory.busy) return true;
    const href = url.pathname + url.search;
    const slug = slugOf(url.pathname);
    // The menu closes on its own (SiteNav); the opening grows from the entry that was clicked
    if (slug) void enter(a.closest("[data-card]") ?? a, href, slug);
    else void home(href);
    return true;
  }

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
    if (a && destination(a)) {
      event.preventDefault();
      follow(a);
    }
  };

  const onPop = () => {
    const from = memory.path;
    const to = location.pathname;
    if (from === to) return;
    if (!slugOf(from)) memory.homeY = scrollY;
    void cross(to);
  };

  // Fetch the next route and its opening while the pointer or the focus is on its link, so the move does not wait
  const onIntent = (event: Event) => {
    const a = anchorOf(event.target);
    const url = a && destination(a);
    if (!url || prefetched.has(url.pathname)) return;
    prefetched.add(url.pathname);
    router.prefetch(url.pathname);
    const slug = slugOf(url.pathname);
    if (isSlug(slug) && !reduced.matches) void prepare(slug).catch(() => {});
  };

  // The popstate listener itself lives in Descent.tsx, registered before the router's: the router commits the other
  // route inside its own listener, and the sheet must cover before it does
  hooks.pop = onPop;
  hooks.click = follow;
  // The five openings are fetched while the browser is idle, so a click with no hover before it does not wait for them
  if (!reduced.matches) prepareAll();
  window.addEventListener("click", onClick, true);
  document.addEventListener("pointerover", onIntent, { passive: true });
  document.addEventListener("focusin", onIntent);
  return () => {
    hooks.pop = () => {};
    hooks.click = () => false;
    window.removeEventListener("click", onClick, true);
    document.removeEventListener("pointerover", onIntent);
    document.removeEventListener("focusin", onIntent);
  };
}

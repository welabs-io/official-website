// MOTOR DA DESCIDA (SOB DEMANDA)
// The home and the product pages are one page (app/(site)/layout.tsx): the head of the home, then the slot of the open
// product, then the tail of the home, which gives way while a product is open. This module moves the visitor along it.
// It is a chunk of its own, fetched by Descent.tsx right after hydration (like scene-run.ts), so it stays out of the
// initial JS of the page.
//
// v2.1 (2026-10-20): every way into a product is the same move, measured 10 out of 10. Before, only a card of the home
// had a move and the menu swapped the page with no transition (descent-run.ts:440 of 2e98392); now:
// - Any link to a product (a card, the menu, the product selector, a product of the stage, the footer) opens the brand
//   opening of that product (components/intro/intro-run.ts) from the box of what was clicked; the product is committed
//   and placed under it, and the logo of the opening lands on the logo of the product. Product to product is the same.
// - The browser's back from a product to the home shrinks the opening back into its card while the page scrolls up to
//   where the visitor was; any other back or forward, and the way home by the logo, cross a white sheet.
// - Scrolling up past the top of a product, until it is entirely below the window, returns to the home where it was:
//   the address goes back to "/" with no movement, since nothing in view changes.
//
// The URL is always the real route (`/products/<slug>`), so a product is shareable and opens directly. Only transform,
// opacity, clip-path and scroll move; under reduced motion every move is an instant jump.
import type { useRouter } from "next/navigation";
import { isSlug, open, prepare } from "@/components/intro/intro-run";
import styles from "./descent.module.css";

type Router = ReturnType<typeof useRouter>;

const PRODUCT = "/products/";
const slugOf = (path: string) =>
  path.startsWith(PRODUCT)
    ? path.slice(PRODUCT.length).replace(/\/$/, "")
    : null;

type Box = { x: number; y: number; w: number; h: number };

// ESTADO DA DESCIDA
// Kept for the whole visit (the layout never unmounts): where the visitor left the home, how many entries the descent
// pushed since the home, and whether a move is running.
const memory = {
  homeY: null as number | null,
  depth: 0,
  busy: false,
  // A back that the descent itself asked for (the scroll up past a product): no reverse move
  silent: false,
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
const slot = () => document.querySelector<HTMLElement>("[data-descent-slot]");
const slotTop = () => (slot()?.getBoundingClientRect().top ?? 0) + scrollY;
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

// Ease in and out (cubic): the page starts and lands softly, the middle carries the distance
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixBox = (a: Box, b: Box, t: number): Box => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  w: mix(a.w, b.w, t),
  h: mix(a.h, b.h, t),
});

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

// A FOLHA E O LOGO
// The sheet is sized at the window and the logo at its final box; each frame places them over a box by translate and
// scale only. The logo carries two images (where it comes from and where it lands) and crosses them on the way.
function makeLayers(fromSrc: string, toSrc: string) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const sheet = document.createElement("div");
  sheet.className = styles.sheet;
  sheet.style.width = `${W}px`;
  sheet.style.height = `${H}px`;
  const logo = document.createElement("div");
  logo.className = styles.logo;
  const from = new Image();
  const to = new Image();
  if (fromSrc) from.src = fromSrc;
  if (toSrc) to.src = toSrc;
  from.alt = to.alt = "";
  to.style.opacity = "0";
  logo.append(from, to);
  document.body.append(sheet, logo);
  let logoSize: Box = { x: 0, y: 0, w: 1, h: 1 };
  return {
    full: { x: 0, y: 0, w: W, h: H } as Box,
    setTo(img: HTMLImageElement | null) {
      if (img) to.src = img.currentSrc || img.src;
    },
    sizeLogo(final: Box) {
      logoSize = final;
      logo.style.width = `${final.w}px`;
      logo.style.height = `${final.h}px`;
    },
    place(sheetBox: Box, logoBox: Box, cross: number) {
      sheet.style.transform = `translate(${sheetBox.x}px, ${sheetBox.y}px) scale(${sheetBox.w / W}, ${sheetBox.h / H})`;
      const s = logoBox.w / logoSize.w;
      logo.style.transform = `translate(${logoBox.x}px, ${logoBox.y}px) scale(${s})`;
      from.style.opacity = String(1 - cross);
      to.style.opacity = String(cross);
    },
    fade(o: number, logoO = o) {
      sheet.style.opacity = String(o);
      logo.style.opacity = String(logoO);
    },
    remove() {
      sheet.remove();
      logo.remove();
    },
  };
}

// A white sheet over the whole window, for the moves that only swap the page (the way home, back and forward between
// products): it fades in, the page changes under it, and it fades out
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

// Takes over the links, the back button and the scroll; returns the way to let go
export function install(router: Router, pathname: string) {
  memory.path = pathname;
  history.scrollRestoration = "manual";
  // A direct visit to a product: the inline script of the page already placed it; this keeps it after the fonts
  if (slugOf(location.pathname) && scrollY < slotTop() - 2) jump(slotTop());
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefetched = new Set<string>();

  // ENTRAR NUM PRODUTO: A ABERTURA DA MARCA
  async function enter(origin: Element, href: string, slug: string) {
    memory.busy = true;
    if (!slugOf(location.pathname)) memory.homeY = scrollY;
    memory.depth += 1;
    if (reduced.matches || !isSlug(slug)) {
      router.push(href, { scroll: false });
      await committed();
      jump(slotTop());
      memory.busy = false;
      return;
    }
    lockInput(true);
    let playing: Awaited<ReturnType<typeof open>> | null = null;
    try {
      playing = await open(slug, box(origin));
      // The page changes only under the full sheet (the opening of its clip takes 0.45 s)
      await new Promise((r) => setTimeout(r, 470));
      router.push(href, { scroll: false });
      await committed();
      jump(slotTop());
      await playing.land(heroLogo());
    } catch {
      // The opening could not load: the page swaps with no move
      playing?.abort();
      if (location.pathname !== new URL(href, location.href).pathname) {
        router.push(href, { scroll: false });
        await committed();
      }
      jump(slotTop());
    }
    lockInput(false);
    memory.busy = false;
  }

  // IR PARA A HOME PELO LOGO
  async function home(href: string) {
    memory.busy = true;
    memory.depth = 0;
    const v = reduced.matches ? null : veil();
    await v?.in();
    router.push(href, { scroll: false });
    await committed();
    jump(0);
    await v?.out();
    memory.busy = false;
  }

  // VOLTAR: O MESMO MOVIMENTO AO CONTRÁRIO
  // Runs on popstate, before the router commits the previous route: the opening is covered at once by the sheet (the
  // same white, the same logo in the same place), and once the previous route is in the DOM the sheet shrinks back into
  // the card while the page scrolls up to where the visitor was. Back or forward between two products, or into a product,
  // crosses the white veil.
  async function reverse(fromPath: string, toPath: string) {
    const toSlug = slugOf(toPath);
    const fromSlug = slugOf(fromPath);
    memory.depth = Math.max(0, memory.depth - 1);
    if (reduced.matches || !fromSlug || toSlug) {
      memory.busy = true;
      const v = reduced.matches ? null : veil();
      // The veil covers at once: the router commits inside its own listener, right after this one
      v?.in();
      await committed();
      jump(toSlug ? slotTop() : (memory.homeY ?? 0));
      await v?.out();
      memory.busy = false;
      return;
    }
    memory.busy = true;
    lockInput(true);
    const hero = heroLogo();
    const src = hero ? hero.currentSrc || hero.src : "";
    const heroBox = hero
      ? { ...box(hero), y: box(hero).y + scrollY - slotTop() }
      : null;
    const layers = makeLayers(src, "");
    if (heroBox) {
      layers.sizeLogo(heroBox);
      layers.place(layers.full, heroBox, 0);
    }
    layers.fade(1);
    const arrived = await committed();
    if (!arrived) {
      layers.remove();
      lockInput(false);
      memory.busy = false;
      return;
    }
    // Where the move lands: the card of the product left
    const card = document.querySelector<HTMLElement>(
      `a[data-card="${fromSlug}"]`,
    );
    const fallback = card ? box(card).y + scrollY - innerHeight * 0.4 : 0;
    const end = memory.homeY ?? fallback;
    jump(slotTop());
    if (!card || !heroBox) {
      jump(end);
      await tween(240, (t) => layers.fade(1 - t));
      layers.remove();
      lockInput(false);
      memory.busy = false;
      return;
    }
    // The box of the card once the page sits at `end`
    const endShift = scrollY - Math.max(0, Math.min(end, maxScroll()));
    const cardEnd = { ...box(card), y: box(card).y + endShift };
    const cardLogo = card.querySelector<HTMLImageElement>("img")!;
    const cardLogoEnd = { ...box(cardLogo), y: box(cardLogo).y + endShift };
    layers.setTo(cardLogo);
    const y0 = scrollY;
    const endY = Math.max(0, Math.min(end, maxScroll()));
    await tween(900, (t) => {
      const k = ease(t);
      const y = mix(y0, endY, k);
      jump(y);
      // The card as it is now, scrolling into place: the sheet lands riding on it
      const ride = (b: Box) => ({ ...b, y: b.y + (endY - y) });
      layers.place(
        mixBox(layers.full, ride(cardEnd), k),
        mixBox(heroBox, ride(cardLogoEnd), k),
        Math.min(1, Math.max(0, (k - 0.25) / 0.5)),
      );
    });
    await tween(220, (t) => layers.fade(1 - t));
    layers.remove();
    lockInput(false);
    memory.busy = false;
  }

  const anchorOf = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLAnchorElement>("a[href]")
      : null;

  // Links the descent takes over: same origin, the home or a product, no anchor
  function destination(a: HTMLAnchorElement): URL | null {
    if ((a.target && a.target !== "_self") || a.hasAttribute("download"))
      return null;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.hash) return null;
    if (url.pathname === location.pathname) return null;
    if (url.pathname !== "/" && !url.pathname.startsWith(PRODUCT))
      return null;
    return url;
  }

  // Runs the move of a link; false when the link is not one the descent takes
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
    if (memory.silent) {
      memory.silent = false;
      memory.depth = 0;
      return;
    }
    if (from === to) return;
    void reverse(from, to);
  };

  // SUBIR ALÉM DO PRODUTO
  // With the whole product below the window, the visitor is back on the home: the address follows, with no move
  const onScroll = () => {
    if (memory.busy || !slugOf(location.pathname)) return;
    // Only the top padding of the opening may still be in view (the band of the home that takes its place has the
    // same padding), so the swap below the products band is never seen
    const tailFirst = document.querySelector("[data-descent-tail] > section");
    const pad = tailFirst
      ? parseFloat(getComputedStyle(tailFirst).paddingTop) || 48
      : 48;
    if (slotTop() - scrollY < window.innerHeight - pad) return;
    memory.homeY = scrollY;
    if (memory.depth === 1) {
      memory.silent = true;
      history.back();
    } else {
      memory.depth = 0;
      router.replace("/", { scroll: false });
    }
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

  // The popstate listener itself lives in Descent.tsx, registered before the router's: the router commits the previous
  // route inside its own listener, and the reverse move must read the product before it leaves the DOM
  hooks.pop = onPop;
  hooks.click = follow;
  window.addEventListener("click", onClick, true);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("pointerover", onIntent, { passive: true });
  document.addEventListener("focusin", onIntent);
  return () => {
    hooks.pop = () => {};
    hooks.click = () => false;
    window.removeEventListener("click", onClick, true);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("pointerover", onIntent);
    document.removeEventListener("focusin", onIntent);
  };
}

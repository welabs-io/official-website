// MOTOR DA DESCIDA (SOB DEMANDA)
// The home and the product pages are one page (app/(site)/layout.tsx): the head of the home, then the slot of the open
// product, then the tail of the home, which gives way while a product is open. This module moves the visitor along it.
// It is a chunk of its own, fetched by Descent.tsx right after hydration (like scene-run.ts), so it stays out of the
// initial JS of the page.
//
// - A click on a card of the home (`data-card`) grows the card in place into a sheet that fills the window while the
//   page scrolls down to the product, which is now the next section; the logo of the card travels to the opening.
// - A click on the door at the end of a product (`data-door`) grows the door the same way and the next product takes
//   the slot under the sheet.
// - The browser's back runs the same move in reverse: the opening shrinks back into the card (or into the door) while the
//   page scrolls up to where the visitor left it.
// - Scrolling up past the top of a product, until it is entirely below the window, returns to the home where it was:
//   the address goes back to "/" with no movement, since nothing in view changes.
// - Any other link to a product (menu, footer) and the logo swap the page with no animation.
//
// The URL is always the real route (`/products/<slug>`), so a product is shareable and opens directly. Only transform,
// opacity and scroll move; under reduced motion every move is an instant jump.
import type { useRouter } from "next/navigation";
import styles from "./descent.module.css";

type Router = ReturnType<typeof useRouter>;

const PRODUCT = "/products/";
const slugOf = (path: string) =>
  path.startsWith(PRODUCT)
    ? path.slice(PRODUCT.length).replace(/\/$/, "")
    : null;

type Box = { x: number; y: number; w: number; h: number };

// ESTADO DA DESCIDA
// Kept for the whole visit (the layout never unmounts): where the visitor left the home and each product, how many
// entries the descent pushed since the home, and whether a move is running.
const memory = {
  homeY: null as number | null,
  doorY: {} as Record<string, number>,
  depth: 0,
  busy: false,
  // A back that the descent itself asked for (the scroll up past a product): no reverse move
  silent: false,
  path: "",
};

// Resolves the moves waiting for the next route to be in the DOM
let waiters: (() => void)[] = [];
const committed = (ms = 2500) =>
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
// Ease out (cubic): the growth of the sheet, ahead of the scroll
const grow = (t: number) => 1 - (1 - t) ** 3;
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
    // The image the logo lands on, once its element is in the DOM
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

// The box a box grows to when it is lifted in place (3% around its centre)
const lifted = (b: Box): Box => ({
  x: b.x - b.w * 0.015,
  y: b.y - b.h * 0.015,
  w: b.w * 1.03,
  h: b.h * 1.03,
});

// Wheel and touch scrolling are held while a move runs, so the visitor does not fight the scroll of the move
const hold = (e: Event) => e.preventDefault();
function lockInput(on: boolean) {
  const fn = on ? window.addEventListener : window.removeEventListener;
  fn("wheel", hold, { passive: false } as AddEventListenerOptions);
  fn("touchmove", hold, { passive: false } as AddEventListenerOptions);
}

// What Descent.tsx calls on popstate (set by `install`)
export const hooks = { pop: () => {} };

// The new route is in the DOM (called by Descent.tsx on every commit): release the moves waiting for it
export function release(pathname: string) {
  memory.path = pathname;
  const list = waiters;
  waiters = [];
  for (const done of list) done();
}

// Takes over the links, the back button and the scroll; returns the way to let go
export function install(router: Router, pathname: string) {
  {
    memory.path = pathname;
    history.scrollRestoration = "manual";
    // A direct visit to a product: the inline script of the page already placed it; this keeps it after the fonts
    if (slugOf(location.pathname) && scrollY < slotTop() - 2) jump(slotTop());
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefetched = new Set<string>();

    // ENTRAR: CARTÃO OU PORTA CRESCENDO ATÉ O PRODUTO
    async function enter(
      door: HTMLElement,
      href: string,
      kind: "card" | "door",
    ) {
      memory.busy = true;
      const from = slugOf(location.pathname);
      if (kind === "card") memory.homeY = scrollY;
      else if (from) memory.doorY[from] = scrollY;
      memory.depth += 1;

      if (reduced.matches) {
        router.push(href, { scroll: false });
        await committed();
        jump(slotTop());
        memory.busy = false;
        return;
      }

      const doorLogo = door.querySelector<HTMLImageElement>(
        kind === "door" ? "[data-door-logo]" : "img",
      )!;
      const doorBox = box(door);
      const doorLogoBox = box(doorLogo);
      const y0 = scrollY;
      lockInput(true);

      if (kind === "card") {
        // The card lifts in place while the product comes in below it, then the page scrolls down to the product
        // and the card grows to the window on the way
        const layers = makeLayers(doorLogo.currentSrc || doorLogo.src, "");
        layers.sizeLogo(doorLogoBox);
        layers.place(doorBox, doorLogoBox, 0);
        layers.fade(0);
        router.push(href, { scroll: false });
        const arrived = committed();
        await tween(200, (t) => {
          const k = ease(t);
          layers.place(mixBox(doorBox, lifted(doorBox), k), doorLogoBox, 0);
          layers.fade(k);
        });
        await arrived;
        const target = slotTop();
        const hero = heroLogo();
        const heroBox = hero ? box(hero) : doorLogoBox;
        const finalLogo = { ...heroBox, y: heroBox.y + scrollY - target };
        layers.sizeLogo(finalLogo);
        layers.setTo(hero);
        const start = lifted(doorBox);
        // The real logo of the opening waits under the travelling one, so there is never two of them on screen
        if (hero) hero.style.visibility = "hidden";
        // The sheet leaves riding on the card (it scrolls with it) and grows faster than the page scrolls, so it is
        // already wide when the opening rises into view; it thins out over the last stretch, so the opening shows
        // through while it still moves
        await tween(1000, (t) => {
          const k = ease(t);
          const g = grow(t);
          const y = mix(y0, target, k);
          jump(y);
          const ride = (b: Box) => ({ ...b, y: b.y - (y - y0) });
          layers.place(
            mixBox(ride(start), layers.full, g),
            mixBox(ride(doorLogoBox), finalLogo, k),
            Math.min(1, Math.max(0, (k - 0.2) / 0.5)),
          );
          layers.fade(t < 0.68 ? 1 : 1 - (t - 0.68) / 0.32, 1);
        });
        jump(target);
        if (hero) hero.style.visibility = "";
        layers.remove();
      } else {
        // The door lifts, the page scrolls until it fills the window, and the next product takes the slot under it
        const src = doorLogo.currentSrc || doorLogo.src;
        const layers = makeLayers(src, src);
        layers.sizeLogo(doorLogoBox);
        const hero = heroLogo();
        const offset = hero ? box(hero).y + scrollY - slotTop() : 160;
        const finalLogo = { ...doorLogoBox, y: offset };
        finalLogo.x = (window.innerWidth - doorLogoBox.w) / 2;
        layers.fade(0);
        await tween(200, (t) => {
          const k = ease(t);
          layers.place(mixBox(doorBox, lifted(doorBox), k), doorLogoBox, 0);
          layers.fade(k);
        });
        const start = lifted(doorBox);
        const headerH = document.querySelector("header")?.offsetHeight ?? 0;
        const target = Math.min(doorBox.y + y0 - headerH, maxScroll());
        await tween(800, (t) => {
          const k = ease(t);
          const y = mix(y0, target, k);
          jump(y);
          const ride = (b: Box) => ({ ...b, y: b.y - (y - y0) });
          layers.place(
            mixBox(ride(start), layers.full, grow(t)),
            mixBox(ride(doorLogoBox), finalLogo, k),
            0,
          );
        });
        router.push(href, { scroll: false });
        await committed();
        jump(slotTop());
        // The opening of the next product is laid out under the sheet: correct the logo to it before the reveal
        const landed = heroLogo();
        if (landed) layers.place(layers.full, box(landed), 0);
        await tween(260, (t) => layers.fade(1 - t));
        layers.remove();
      }
      lockInput(false);
      memory.busy = false;
    }

    // VOLTAR: O MESMO MOVIMENTO AO CONTRÁRIO
    // Runs on popstate, before the router commits the previous route: the opening is covered at once by the sheet (the
    // same cream, the same logo in the same place), and once the previous route is in the DOM the sheet shrinks back into
    // the card or the door while the page scrolls up to where the visitor was.
    async function reverse(fromPath: string, toPath: string) {
      const toSlug = slugOf(toPath);
      const fromSlug = slugOf(fromPath);
      memory.depth = Math.max(0, memory.depth - 1);
      if (!fromSlug) {
        // Forward again from the home into a product: the card grows as on a click, without pushing
        await committed();
        jump(slotTop());
        return;
      }
      if (reduced.matches) {
        await committed();
        jump(
          toSlug ? (memory.doorY[toSlug] ?? slotTop()) : (memory.homeY ?? 0),
        );
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

      // Where the move lands: the card of the product left (home) or the door to it (the previous product)
      const door = toSlug
        ? document.querySelector<HTMLElement>(
            `[data-descent-slot] [data-door="${fromSlug}"]`,
          )
        : document.querySelector<HTMLElement>(`a[data-card="${fromSlug}"]`);
      const start = toSlug
        ? door
          ? Math.min(
              box(door).y +
                scrollY -
                (document.querySelector("header")?.offsetHeight ?? 0),
              maxScroll(),
            )
          : slotTop()
        : slotTop();
      const fallback = door ? box(door).y + scrollY - innerHeight * 0.4 : 0;
      const end = toSlug
        ? (memory.doorY[toSlug] ?? fallback)
        : (memory.homeY ?? fallback);
      jump(start);
      if (!door || !heroBox) {
        jump(end);
        await tween(240, (t) => layers.fade(1 - t));
        layers.remove();
        lockInput(false);
        memory.busy = false;
        return;
      }
      // The box of the card (or door) once the page sits at `end`
      const endShift = scrollY - Math.max(0, Math.min(end, maxScroll()));
      const doorEnd = { ...box(door), y: box(door).y + endShift };
      const doorLogo = door.querySelector<HTMLImageElement>(
        toSlug ? "[data-door-logo]" : "img",
      )!;
      const doorLogoEnd = { ...box(doorLogo), y: box(doorLogo).y + endShift };
      layers.setTo(doorLogo);
      const y0 = scrollY;
      const endY = Math.max(0, Math.min(end, maxScroll()));
      await tween(900, (t) => {
        const k = ease(t);
        const y = mix(y0, endY, k);
        jump(y);
        // The card (or door) as it is now, scrolling into place: the sheet lands riding on it
        const ride = (b: Box) => ({ ...b, y: b.y + (endY - y) });
        layers.place(
          mixBox(layers.full, ride(doorEnd), k),
          mixBox(heroBox, ride(doorLogoEnd), k),
          toSlug ? 0 : Math.min(1, Math.max(0, (k - 0.25) / 0.5)),
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
      if (memory.busy) return;
      const href = url.pathname + url.search;
      if (a.dataset.card && location.pathname === "/") {
        void enter(a, href, "card");
        return;
      }
      if (a.dataset.door) {
        void enter(a, href, "door");
        return;
      }
      // Menu, footer and the logo: the page swaps with no move, to the top of the product or of the home
      memory.depth = url.pathname === "/" ? 0 : memory.depth + 1;
      router.push(href, { scroll: false });
      void committed().then(() => jump(url.pathname === "/" ? 0 : slotTop()));
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
      // same cream padding), so the swap below the products band is never seen
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

    // Fetch the next route while the pointer or the focus is on its link, so the move does not wait for it
    const onIntent = (event: Event) => {
      const a = anchorOf(event.target);
      const url = a && destination(a);
      if (!url || prefetched.has(url.pathname)) return;
      prefetched.add(url.pathname);
      router.prefetch(url.pathname);
    };

    // The popstate listener itself lives in Descent.tsx, registered before the router's: the router commits the previous
    // route inside its own listener, and the reverse move must read the product before it leaves the DOM
    hooks.pop = onPop;
    window.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      hooks.pop = () => {};
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }
}

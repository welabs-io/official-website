// ABERTURA DE MARCA NA ENTRADA DO PRODUTO
// The player of the five accepted brand openings (the logo forming, each product with its own concept, ~3.9 s from the click to a settled page), ported to
// native SVG and DOM in this folder. It is part of the descent chunk (components/onepage/descent-run.ts, fetched after
// hydration), and each opening is a chunk of its own, fetched while the browser is idle after that (`prepareAll`) or
// when a link to its product is pointed at or clicked, so none of it weighs on the initial JS.
// v4 (operator, 2026-10-24): the choreographies of v3 are back (v4 had swapped them for the brand's minimal logo motion,
// whose cream backdrop also covered the top of the "by welabs" seal), on the canvas of the page (--background, #f7f7f5)
// from the first frame to the last, with the v4 palette (kit.js LIGHT), the choreographies of the round untouched (their
// own camera), the stage smaller (stageScale) and no blur anywhere. The stage is fitted to the window by CSS `zoom`, not by a
// transform scale, so the endorsed logo of the closing frame is laid out (and rasterised) at its display size.
//
// v6 (operator, 2026-10-26: "o tamanho do intro que abre em tela cheia [...] hoje tá grande ainda"): the opening plays
// in a compact panel (a card of the canvas, about a third of a wide window, 88 % of a phone), with the current page
// visible behind it under a light veil of ink; nothing covers the whole window at any moment.
// How an entry plays:
//  1. `open` draws the opening in the panel, grown from the box of what was clicked (a card, a menu entry, the product
//     selector) to the box of the panel, centred under the header, while the opening already runs (0.45 s).
//  2. The opening plays whole, to its closing frame (the endorsed logo, "by welabs" seal included, with its amber bar),
//     and holds it a moment. While the logo settles, the canvas of the page fades in behind the panel (the cover), so the
//     product is committed under it during that hold (`closing`): the page behind never swaps, nor scrolls, in sight.
//     v5 (2026-10-24): the commit is in the hold, the one stretch where nothing moves, no longer in the middle of the
//     choreography (measured on 709ccb0: the render of the product page was a 50 to 190 ms frame half a second in).
//  3. `land` lets the panel leave where it is (fading, rising a little) with the veil, and the page comes in as the
//     cover over it fades, --dur-enter on --ease-enter (no logo travels nor scales: v3 flew a raster of the logo, a
//     large zoom).
// A click, a key or the wheel during the opening skips to its closing frame; the end still plays.
// v4: the whole opening plays on every entry into a product, from any link, the product selector included (no short
// flash variant is left: it read as no opening at all).
import type { Messages } from "@/lib/i18n/types";
import styles from "./intro.module.css";

type Slug = "domus" | "relloo" | "magneto" | "tuner" | "knowly";
type Module = typeof import("./domus");
type Box = { x: number; y: number; w: number; h: number };

// LOGOS E CAIXAS
// The round drew each closing logo in the box of its dark endorsed file; the site shows the light endorsed file, which
// has the same drawing in the same coordinates with the 0.5X protection area around it. `dark` is the box the
// choreography lays out (its viewBox), `light` the viewBox of the file the site shows; both are checked against the
// files by intro.test.ts.
export const BOXES: Record<Slug, { dark: number[]; light: number[] }> = {
  domus: {
    dark: [0, -4.8, 864.66, 426.63],
    light: [-70.2, -75, 1005.06, 563.28],
  },
  relloo: { dark: [0, 0, 640.92, 421.83], light: [-75, -75, 790.92, 563.28] },
  magneto: {
    dark: [0, -9, 1155.84, 430.83],
    light: [-66, -75, 1287.84, 563.28],
  },
  tuner: {
    dark: [0, -45.13, 772.57, 466.96],
    light: [-65.7, -110.83, 903.97, 599.11],
  },
  knowly: { dark: [0, -9, 916.2, 430.83], light: [-66, -75, 1048.2, 563.28] },
};

const MODULES: Record<Slug, () => Promise<Module>> = {
  domus: () => import("./domus"),
  relloo: () => import("./relloo"),
  magneto: () => import("./magneto-flow"),
  tuner: () => import("./tuner"),
  knowly: () => import("./knowly"),
};

const logoUrl = (slug: Slug) => `/brands/welabs/products/${slug}-light.svg`;
const endorsedUrl = (slug: Slug) =>
  `/brands/welabs/products/${slug}-light-endorsed.svg`;

// What an opening needs before it can draw a frame: its module and the text of its logo
type Ready = { mod: Module; logo: string };
const cache = new Map<Slug, Promise<Ready>>();
export const isSlug = (s: string | null): s is Slug => s !== null && s in BOXES;

export function prepare(slug: Slug) {
  let ready = cache.get(slug);
  if (!ready) {
    ready = Promise.all([
      MODULES[slug](),
      fetch(logoUrl(slug)).then((r) => {
        if (!r.ok) throw new Error(`intro: ${r.status}`);
        return r.text();
      }),
      // Warm the endorsed file, so the closing logo is decoded before it shows
      new Promise<void>((done) => {
        const img = new Image();
        img.onload = img.onerror = () => done();
        img.src = endorsedUrl(slug);
      }),
    ]).then(([mod, logo]) => ({ mod, logo }));
    ready.catch(() => cache.delete(slug));
    cache.set(slug, ready);
  }
  return ready;
}

// v5 (2026-10-24): the five openings and their logos are fetched while the browser is idle, one after the other, right
// after the engine lands (measured on 709ccb0, production build: a click with no hover before it waited for the chunk
// and the logo, 52 to 104 ms to the first frame of the sheet, against 24 to 60 ms once prepared)
export function prepareAll() {
  // Safari has no requestIdleCallback
  const idle = (run: () => void) =>
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(run, { timeout: 2000 })
      : window.setTimeout(run, 200);
  const slugs = Object.keys(BOXES) as Slug[];
  const next = () => {
    const slug = slugs.shift();
    if (slug)
      idle(() => {
        void prepare(slug)
          .catch(() => {})
          .then(next);
      });
  };
  next();
}

// v5 (2026-10-24): the animations start one frame in, so the first frame is already a step of them (the sheet's first
// frame used to be at opacity 0, one blank frame added to every click)
const FRAME_MS = 1000 / 60;
// Ease out (cubic), the curve of the growth of the panel and of the cover; the openings keep their own eases
const OUT = "cubic-bezier(0.33, 1, 0.68, 1)";

// TEMPOS DA ABERTURA
// Seconds the closing frame holds before the end plays, and milliseconds of the growth of the panel and of the cover
// that fades in behind it. v4 (operator, 2026-10-24: "a cena precisa ser mais rápida"): the choreography plays at
// SPEED, so the logo formed at ~4.05 s of the round is formed at ~2.5 s, and an entry takes ~3.6 s from the click to a
// settled page. HOLD is in seconds of the round, like the clock.
// v6 (2026-10-26): the cover starts COVER_MS before the closing frame, so it is whole when the frame settles and the
// route can swap under it without adding to the hold.
export const SPEED = 1.6;
const HOLD = 0.25;
const OPEN_MS = 450;
const COVER_MS = 280;
// The motion tokens of app/lib.css: the page comes in as the panel goes (--dur-enter on --ease-enter); the panel leaves
// in --dur-swap on the same curve, rising half of --rise-enter
const tokens = () => {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return {
    ms: parseFloat(token("--dur-enter") || "0.8") * 1000,
    rise: parseFloat(token("--rise-enter") || "16"),
    easing: token("--ease-enter") || "ease-out",
    exitMs: parseFloat(token("--dur-swap") || "0.45") * 1000,
  };
};

// O PAINEL NA JANELA
// v6 (operator, 2026-10-26): the panel the opening plays in, with the proportion of the round's stage (16:9), centred in
// the room under the header: a third of a wide window (480 x 270 at 1440 x 900), between 360 and 640 px and never past
// 45 % of the window's width, and 88 % of a phone's width; never taller than half the room under the header.
export const PANEL = {
  phone: 0.88,
  wide: 1 / 3,
  min: 360,
  max: 640,
  cap: 0.45,
} as const;
const ASPECT = 1080 / 1920;
export function panelBox(w: number, h: number, header: number): Box {
  const wide = Math.min(
    Math.max(w * PANEL.wide, PANEL.min),
    w * PANEL.cap,
    PANEL.max,
  );
  const pw = Math.floor(
    Math.min(w < 768 ? w * PANEL.phone : wide, ((h - header) * 0.5) / ASPECT),
  );
  const ph = Math.round(pw * ASPECT);
  return {
    x: Math.round((w - pw) / 2),
    y: Math.round(header + (h - header - ph) / 2),
    w: pw,
    h: ph,
  };
}

// ENCAIXE DO PALCO NO PAINEL
// The 1920x1080 stage the round was drawn at, centred in the panel and sized by its closing logo (the light box of the
// endorsed file): 5/12 of the panel's width, 200 px in the 480 px panel of a 1440 window; never wider than the panel,
// nor larger than its size. The stage follows the logo, so the whole opening shrinks with it.
// v4 (operator, 2026-10-24: "só o tamanho que precisava adequar"): the stage used to fill the window's width, which put
// the closing logo at about half of it, read as too much zoom; the choreography itself is the round's, untouched.
// v5 (operator, 2026-10-24: "ainda achei grande"): 440 -> 300 px of a 1440 window. v6 (2026-10-26): ~200 px, in the
// panel.
export const LOGO_SHARE = 200 / 480;
export function stageScale(slug: Slug, panelW: number) {
  return Math.min(
    (panelW * LOGO_SHARE) / BOXES[slug].light[2],
    panelW / 1920,
    1,
  );
}

// The box the panel grows from: the box of what was clicked, kept inside the cap of the panel (a large card of the home
// starts at most 45 % of the window wide and tall, around its own centre), so the panel is never large at any moment
function growFrom(from: Box, w: number, h: number): Box {
  const fw = Math.min(from.w, w * PANEL.cap);
  const fh = Math.min(from.h, h * PANEL.cap);
  return {
    x: from.x + (from.w - fw) / 2,
    y: from.y + (from.h - fh) / 2,
    w: fw,
    h: fh,
  };
}
const inset = (b: Box, w: number, h: number, round: number) =>
  `inset(${b.y}px ${w - b.x - b.w}px ${h - b.y - b.h}px ${b.x}px round ${round}px)`;

export type Playing = {
  // Resolves when the closing frame is drawn and holds still (or the opening was skipped to it) and the cover is whole
  // behind the panel: the one stretch of the opening where nothing moves and the page behind is out of sight, so a long
  // frame there (the next page rendering under the cover) shows no stall and no swap
  closing: Promise<void>;
  // Resolves when the opening reached its closing frame and held it (or was skipped)
  settled: Promise<void>;
  // Lets the panel leave and fades the veil and the cover, which brings in the page under them
  land(): Promise<void>;
  // Removes everything at once (navigation failed)
  abort(): void;
};

// O PALCO DA ABERTURA
// The layer over the window (the veil, the cover, the card); in the card, the panel, and in the panel the stage at its
// fitted size with the choreography: its scene (with the camera layer `.zoom` of each opening), the wrapper of the light
// endorsed logo and the amber bar under it
// i18n: `openings` is the text the scenes draw, in the locale of the page (the `openings` of the dictionary)
export async function open(
  slug: Slug,
  from: Box,
  openings: Messages["openings"],
): Promise<Playing> {
  const { mod, logo } = await prepare(slug);
  const box = BOXES[slug];
  const part = (className: string, parent: HTMLElement) => {
    const el = document.createElement("div");
    el.className = className;
    parent.append(el);
    return el;
  };
  const sheet = document.createElement("div");
  sheet.className = styles.layer;
  sheet.dataset.intro = slug;
  // Where the opening is: `play` (the choreography moves), `still` (the closing frame holds, nothing moves), `land`
  sheet.dataset.introPhase = "play";
  sheet.setAttribute("aria-hidden", "true");
  const tint = part(styles.tint, sheet);
  tint.dataset.introTint = "";
  const cover = part(styles.cover, sheet);
  cover.dataset.introCover = "";
  const card = part(styles.plate, sheet);
  card.dataset.introCard = "";
  const lift = part(styles.lift, card);
  const grow = part(styles.grow, card);
  const panel = part(styles.panel, grow);
  panel.dataset.introPanel = "";
  const frame = document.createElement("div");
  frame.className = styles.frame;
  const stage = document.createElement("div");
  stage.className = styles.stage;
  stage.dataset.introStage = "";
  // The logo wrapper is laid out by the choreography in the dark box; the light file sits in it with its own offset
  const wm = document.createElement("div");
  wm.className = `wm ${styles.wm}`;
  wm.dataset.introLogo = "";
  const img = new Image();
  img.src = endorsedUrl(slug);
  img.alt = "";
  img.className = styles.wmImg;
  img.style.left = `${box.light[0] - box.dark[0]}px`;
  img.style.top = `${box.light[1] - box.dark[1]}px`;
  img.style.width = `${box.light[2]}px`;
  img.style.height = `${box.light[3]}px`;
  wm.append(img);
  const role = document.createElement("div");
  role.className = `role ${styles.role}`;
  role.innerHTML = `<span class="bar ${styles.bar}"></span><span class="word"></span>`;
  stage.append(wm, role);
  frame.append(stage);
  panel.append(frame);
  document.body.append(sheet);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const header = document.querySelector("header")?.offsetHeight ?? 0;
  const at = panelBox(W, H, header);
  for (const el of [lift, panel]) {
    el.style.left = `${at.x}px`;
    el.style.top = `${at.y}px`;
    el.style.width = `${at.w}px`;
    el.style.height = `${at.h}px`;
  }
  const radius = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 20;
  // CSS zoom, not a transform: the stage lays out at its display size, so its vectors and the endorsed file are drawn
  // crisp at the size they show (a transform scale would rasterise them at 1920x1080 and resample)
  const scale = stageScale(slug, at.w);
  frame.style.left = `${(at.w - 1920 * scale) / 2}px`;
  frame.style.top = `${(at.h - 1080 * scale) / 2}px`;
  stage.style.zoom = String(scale);

  const inst = mod.mount(stage, {
    logo,
    box: box.dark,
    safe: 98,
    labels: openings[slug],
  });
  const end = mod.SETTLED + HOLD;
  let clock = 0;
  let last = performance.now();
  let skip = false;
  let done = false;
  let raf = 0;
  let resolveSettled = () => {};
  const settled = new Promise<void>((r) => (resolveSettled = r));
  let resolveClosing = () => {};
  const closing = new Promise<void>((r) => (resolveClosing = r));
  inst.render(clock);

  // A click, a key or the wheel skips to the closing frame
  const onSkip = (event: Event) => {
    if (event.type === "wheel" || event.type === "touchmove")
      event.preventDefault();
    skip = true;
  };
  const opts = { capture: true, passive: false } as AddEventListenerOptions;
  const listen = (on: boolean) => {
    const fn = on ? window.addEventListener : window.removeEventListener;
    for (const type of ["pointerdown", "keydown", "wheel", "touchmove"])
      fn(type, onSkip, opts);
  };
  listen(true);

  // The cover fades in behind the panel over the last COVER_MS of the choreography (at once on a skip), so it is whole
  // when the closing frame settles
  const coverAt = mod.SETTLED - (COVER_MS / 1000) * SPEED;
  let covered: Promise<unknown> | null = null;
  const tick = (now: number) => {
    clock += ((now - last) / 1000) * SPEED;
    last = now;
    if (skip) clock = Math.max(clock, mod.SETTLED);
    inst.render(Math.min(clock, mod.SETTLED));
    if (clock >= coverAt && !covered)
      covered = cover
        .animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: COVER_MS,
          delay: -FRAME_MS,
          easing: OUT,
          fill: "forwards",
        })
        .finished.catch(() => {});
    if (clock >= mod.SETTLED && sheet.dataset.introPhase === "play") {
      sheet.dataset.introPhase = "still";
      void covered?.then(resolveClosing);
    }
    if (clock >= end) {
      done = true;
      resolveSettled();
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame((now) => {
    last = now;
    tick(now);
  });

  // The panel grows from the box of what was clicked to its own box, fading in over the first quarter, and its shadow
  // comes in once it is in place; the veil comes in over the first half. v5 (2026-10-24): by the Web Animations API
  // instead of a clip written on every frame (measured on the production build at 1440: half the late frames of the
  // first 450 ms), one frame in already on the first frame (the delay), so the first frame is not a blank one.
  grow.animate(
    [
      { clipPath: inset(growFrom(from, W, H), W, H, 16) },
      { clipPath: inset(at, W, H, radius) },
    ],
    { duration: OPEN_MS, delay: -FRAME_MS, easing: OUT, fill: "forwards" },
  );
  grow.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: OPEN_MS / 4,
    delay: -FRAME_MS,
  });
  lift.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: OPEN_MS / 2,
    delay: OPEN_MS * 0.6,
    easing: OUT,
    fill: "forwards",
  });
  tint.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: OPEN_MS / 2,
    delay: -FRAME_MS,
  });

  return {
    closing,
    settled,
    async land() {
      if (!done) await settled;
      sheet.dataset.introPhase = "land";
      sheet.style.pointerEvents = "none";
      listen(false);
      cancelAnimationFrame(raf);
      // The panel leaves where it is (fading, rising a little) with the veil, and the page comes in as the cover over it
      // fades (--dur-enter on --ease-enter); the layer stays in the document until the page is in, which is what "the
      // opening has left" means to the rest of the site.
      // v6 (2026-10-26): the page itself no longer rises: measured on the production build at 1440, the animation of
      // the whole slot while the panel was still in sight was a 50 to 83 ms frame in 3 entries of 10 (with or without
      // its layer promoted under the cover), and none in 10 once the page is revealed by the cover alone
      const t = tokens();
      const leave: KeyframeAnimationOptions = {
        duration: t.exitMs,
        easing: t.easing,
        fill: "forwards",
      };
      const moves = [
        card.animate(
          [
            { opacity: 1, transform: "none" },
            { opacity: 0, transform: `translateY(${-t.rise / 2}px)` },
          ],
          leave,
        ),
        tint.animate([{ opacity: 1 }, { opacity: 0 }], leave),
        cover.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: t.ms,
          easing: t.easing,
          fill: "forwards",
        }),
      ];
      await Promise.all(moves.map((m) => m.finished.catch(() => {})));
      sheet.remove();
    },
    abort() {
      listen(false);
      cancelAnimationFrame(raf);
      sheet.remove();
    },
  };
}

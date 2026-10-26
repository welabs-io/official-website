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
// How an entry plays:
//  1. `open` draws the opening on the canvas sheet clipped to the box of what was clicked (a card, a menu entry, the
//     product selector) and opens the clip to the whole window while the opening already runs (0.45 s).
//  2. The opening plays whole, to its closing frame (the endorsed logo, "by welabs" seal included, with its amber bar),
//     and holds it a moment. v5 (2026-10-24): the product is committed under the sheet during that hold (`closing`),
//     the one stretch where nothing moves, no longer in the middle of the choreography (measured on 709ccb0: the render
//     of the product page under the sheet was a 50 to 190 ms frame half a second into the opening).
//  3. `land` fades the closing frame on the same canvas (no logo travels nor scales: v3 flew a raster of the logo, a
//     large zoom), removes the sheet and lets the page come in by its `[data-descent-slot]`, --dur-enter rising
//     --rise-enter on --ease-enter.
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

// Ease out (cubic) for the fade of the closing frame; the openings keep their own eases
const out = (t: number) => 1 - (1 - t) ** 3;

// v5 (2026-10-24): the clock starts one frame before the first frame, so the first frame is already a step of the tween
// (it used to draw t = 0 again: the sheet's first frame was at opacity 0, one blank frame added to every click)
const FRAME_MS = 1000 / 60;
function tween(ms: number, frame: (t: number) => void) {
  return new Promise<void>((resolve) => {
    let start = -1;
    const tick = (now: number) => {
      if (start < 0) start = now - FRAME_MS;
      const t = Math.min(1, (now - start) / ms);
      frame(t);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

// TEMPOS DA ABERTURA
// Seconds the closing frame holds before the end plays, and milliseconds of the opening of the sheet and of the fade of
// the closing frame. v4 (operator, 2026-10-24: "a cena precisa ser mais rápida"): the choreography plays at SPEED, so
// the logo formed at ~4.05 s of the round is formed at ~2.5 s, and an entry takes ~3.6 s from the click to a settled
// page. HOLD is in seconds of the round, like the clock.
export const SPEED = 1.6;
const HOLD = 0.25;
const OPEN_MS = 450;
const LAND_MS = 260;
// The page comes in under the canvas as the sheet goes (--dur-enter on --ease-enter, rising --rise-enter), read from the
// tokens of app/lib.css
const pageIn = () => {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return {
    ms: parseFloat(token("--dur-enter") || "0.8") * 1000,
    rise: token("--rise-enter") || "16px",
    easing: token("--ease-enter") || "ease-out",
  };
};

// ENCAIXE DO PALCO NA JANELA
// The 1920x1080 stage the round was drawn at, centred under the header, sized by its closing logo (the light box of the
// endorsed file) in the compact motion box below. The stage follows the logo, so the whole motion shrinks with it.
// v4 (operator, 2026-10-24: "só o tamanho que precisava adequar"): the stage used to fill the window's width, which put
// the closing logo at about half of it, read as too much zoom; the choreography itself is the round's, untouched.
// v5 (operator, 2026-10-24: "ainda achei grande [...] compactar esse intro"): 440 -> 300 px of a 1440 window, 72 -> 56 %
// of a phone.
// v6 (operator, 2026-10-26: "o que queria menor era o motion, não a janela"): the sheet still opens to the whole
// window, and only the motion is compact. It takes a box of the round's proportion (16:9) centred under the header: a
// third of a wide window (480 x 270 at 1440 x 900), between 360 and 640 px and never past 45 % of the window's width,
// 88 % of a phone's width, never taller than half the room under the header. In it the closing logo is 5/12 of the
// box's width (200 px at 1440, ~143 px on a 390 phone) and the stage is never wider than the box, nor larger than its
// size. Every entry (menu, product selector, card, accordion, link between products) opens the same motion box.
export const MOTION = {
  phone: 0.88,
  wide: 1 / 3,
  min: 360,
  max: 640,
  cap: 0.45,
} as const;
export const LOGO_SHARE = 200 / 480;
const ASPECT = 1080 / 1920;
export function motionBox(w: number, h: number, header: number): Box {
  const wide = Math.min(
    Math.max(w * MOTION.wide, MOTION.min),
    w * MOTION.cap,
    MOTION.max,
  );
  const mw = Math.floor(
    Math.min(w < 768 ? w * MOTION.phone : wide, ((h - header) * 0.5) / ASPECT),
  );
  const mh = Math.round(mw * ASPECT);
  return {
    x: Math.round((w - mw) / 2),
    y: Math.round(header + (h - header - mh) / 2),
    w: mw,
    h: mh,
  };
}
export function stageScale(slug: Slug, w: number, h: number, header: number) {
  const room = motionBox(w, h, header).w;
  return Math.min((room * LOGO_SHARE) / BOXES[slug].light[2], room / 1920, 1);
}

export type Playing = {
  // Resolves when the closing frame is drawn and holds still (or the opening was skipped to it): the one stretch of the
  // opening where nothing moves, so a long frame there (the next page rendering under the sheet) shows no stall
  closing: Promise<void>;
  // Resolves when the opening reached its closing frame and held it (or was skipped)
  settled: Promise<void>;
  // Fades the closing frame, removes the sheet and brings in the page that holds `target` (the product's logo)
  land(target: HTMLElement | null): Promise<void>;
  // Removes everything at once (navigation failed)
  abort(): void;
};

// O PALCO DA ABERTURA
// The canvas sheet; in it, the stage at its fitted size, and in the stage the choreography: its scene (with the camera
// layer `.zoom` of each opening), the wrapper of the light endorsed logo and the amber bar under it
// i18n: `openings` is the text the scenes draw, in the locale of the page (the `openings` of the dictionary)
export async function open(
  slug: Slug,
  from: Box,
  openings: Messages["openings"],
): Promise<Playing> {
  const { mod, logo } = await prepare(slug);
  const box = BOXES[slug];
  const sheet = document.createElement("div");
  sheet.className = styles.sheet;
  sheet.dataset.intro = slug;
  // Where the opening is: `play` (the choreography moves), `still` (the closing frame holds, nothing moves), `land`
  sheet.dataset.introPhase = "play";
  sheet.setAttribute("aria-hidden", "true");
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
  sheet.append(frame);
  document.body.append(sheet);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const header = document.querySelector("header")?.offsetHeight ?? 0;
  // CSS zoom, not a transform: the stage lays out at its display size, so its vectors and the endorsed file are drawn
  // crisp at the size they show (a transform scale would rasterise them at 1920x1080 and resample)
  const scale = stageScale(slug, W, H, header);
  frame.style.left = `${(W - 1920 * scale) / 2}px`;
  frame.style.top = `${header + (H - header - 1080 * scale) / 2}px`;
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

  const tick = (now: number) => {
    clock += ((now - last) / 1000) * SPEED;
    last = now;
    if (skip) clock = Math.max(clock, mod.SETTLED);
    inst.render(Math.min(clock, mod.SETTLED));
    if (clock >= mod.SETTLED && sheet.dataset.introPhase === "play") {
      sheet.dataset.introPhase = "still";
      resolveClosing();
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

  // The sheet opens from the box of what was clicked to the whole window, rounded like a card on the way, fading in over
  // the first quarter. v5 (2026-10-24): by the Web Animations API instead of a clip written on every frame (measured on
  // the production build at 1440: half the late frames of the first 450 ms), one frame in already on the first frame
  // (the delay), so the first frame of the sheet is not a blank one. The ease is the cubic ease out of the fades.
  sheet.animate(
    [
      {
        clipPath: `inset(${from.y}px ${W - from.x - from.w}px ${H - from.y - from.h}px ${from.x}px round 16px)`,
      },
      { clipPath: "inset(0px 0px 0px 0px round 0px)" },
    ],
    {
      duration: OPEN_MS,
      delay: -FRAME_MS,
      easing: "cubic-bezier(0.33, 1, 0.68, 1)",
    },
  );
  sheet.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: OPEN_MS / 4,
    delay: -FRAME_MS,
  });

  return {
    closing,
    settled,
    async land(target) {
      if (!done) await settled;
      sheet.dataset.introPhase = "land";
      listen(false);
      cancelAnimationFrame(raf);
      // The closing frame fades on the canvas, then the page comes in under the same canvas; the
      // sheet (hidden, so the page shows) stays in the document until the page has settled, which is what "the opening
      // has left" means to the rest of the site
      await tween(LAND_MS, (t) => (stage.style.opacity = String(1 - out(t))));
      const slot = target?.closest<HTMLElement>("[data-descent-slot]");
      if (slot) {
        const page = pageIn();
        sheet.style.visibility = "hidden";
        await slot
          .animate(
            [
              { opacity: 0, transform: `translateY(${page.rise})` },
              { opacity: 1, transform: "none" },
            ],
            { duration: page.ms, easing: page.easing },
          )
          .finished.catch(() => {});
      }
      sheet.remove();
    },
    abort() {
      listen(false);
      cancelAnimationFrame(raf);
      sheet.remove();
    },
  };
}

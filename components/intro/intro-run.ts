// ABERTURA DE MARCA NA ENTRADA DO PRODUTO
// The player of the five accepted brand openings (the logo forming, each product with its own concept, ~5 s), ported to
// native SVG and DOM in this folder. It is part of the descent chunk (components/onepage/descent-run.ts, fetched after
// hydration), and each opening is a chunk of its own, fetched when a link to its product is pointed at or clicked, so
// none of it weighs on the initial JS.
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
//     and holds it a moment. The product is committed and placed under the sheet meanwhile.
//  3. `land` fades the closing frame on the same canvas (no logo travels nor scales: v3 flew a raster of the logo, a
//     large zoom), removes the sheet and lets the page come in by its `[data-descent-slot]`, --dur-enter rising
//     --rise-enter on --ease-enter.
// A click, a key or the wheel during the opening skips to its closing frame; the end still plays.
// v2.2 (audit A08): the whole opening plays on the first entry into each product of a visit; later entries, and every
// swap by the product selector, play the brand flash (FLASH), which starts on the closing frame.
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

// Ease out (cubic) for the opening of the sheet and the fades; the openings keep their own eases
const out = (t: number) => 1 - (1 - t) ** 3;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

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

// TEMPOS DA ABERTURA
// Seconds the closing frame holds before the end plays, and milliseconds of the opening of the sheet and of the fade of
// the closing frame. v4 (operator, 2026-10-24: "a cena precisa ser mais rápida"): the choreography plays at SPEED, so
// the logo formed at ~4.05 s of the round is formed at ~2.5 s, and an entry takes ~3.6 s from the click to a settled
// page. HOLD is in seconds of the round, like the clock.
export const SPEED = 1.6;
const HOLD = 0.25;
const OPEN_MS = 450;
const LAND_MS = 260;
// v2.2 (audit A08): the brand flash of a product already opened in this visit, or of a swap by the product selector: it
// starts on the closing frame, the sheet opens faster and the end is shorter (about 700 ms from the click to the page)
export const FLASH = { open: 120, hold: 0, land: 260 } as const;
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
// The 1920x1080 stage the round was drawn at, under the header, sized by its closing logo (the light box of the endorsed
// file): 440 px of a 1440 window from a tablet up, as the static plan of the opening (canvas v4, BrandIntro), and 72 %
// of a phone's width, so the logo stays legible there.
// v4 (operator, 2026-10-24: "só o tamanho que precisava adequar"): the stage used to fill the window's width, which put
// the closing logo at about half of it, read as too much zoom; the choreography itself is the round's, untouched.
// Never larger than its size, nor taller than the room under the header.
export const LOGO_SHARE = { phone: 0.72, wide: 440 / 1440 } as const;
export function stageScale(slug: Slug, w: number, h: number, header: number) {
  const share = w < 768 ? LOGO_SHARE.phone : LOGO_SHARE.wide;
  const byLogo = (w * share) / BOXES[slug].light[2];
  return Math.min(byLogo, ((h - header) * 0.94) / 1080, 1);
}

export type Playing = {
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
export async function open(
  slug: Slug,
  from: Box,
  // v2.2: the short brand flash instead of the whole opening
  flash = false,
): Promise<Playing> {
  const { mod, logo } = await prepare(slug);
  const box = BOXES[slug];
  const sheet = document.createElement("div");
  sheet.className = styles.sheet;
  sheet.dataset.intro = slug;
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

  const inst = mod.mount(stage, { logo, box: box.dark, safe: 98 });
  const end = mod.SETTLED + (flash ? FLASH.hold : HOLD);
  // The flash starts on the closing frame
  let clock = flash ? mod.SETTLED : 0;
  let last = performance.now();
  let skip = false;
  let done = false;
  let raf = 0;
  let resolveSettled = () => {};
  const settled = new Promise<void>((r) => (resolveSettled = r));
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

  // The sheet opens from the box of what was clicked to the whole window, rounded like a card on the way
  const clip = (t: number) => {
    const k = out(t);
    const top = mix(from.y, 0, k);
    const left = mix(from.x, 0, k);
    const right = mix(W - from.x - from.w, 0, k);
    const bottom = mix(H - from.y - from.h, 0, k);
    sheet.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${mix(16, 0, k)}px)`;
    sheet.style.opacity = String(Math.min(1, t * 4));
  };
  // The flash covers the whole window at once, fading in, so the page can change under it sooner
  const cover = (t: number) => (sheet.style.opacity = String(out(t)));
  if (flash) {
    sheet.style.clipPath = "none";
    cover(0);
    void tween(FLASH.open, cover);
  } else {
    clip(0);
    void tween(OPEN_MS, clip).then(() => {
      sheet.style.clipPath = "none";
    });
  }

  return {
    settled,
    async land(target) {
      if (!done) await settled;
      listen(false);
      cancelAnimationFrame(raf);
      // The flash uncovers the page: the closing frame and the sheet fade together (its rise would double the ~700 ms
      // budget of a swap)
      if (flash) {
        await tween(FLASH.land, (t) => {
          stage.style.opacity = String(1 - out(t));
          sheet.style.opacity = String(1 - t);
        });
        sheet.remove();
        return;
      }
      // The whole opening: the closing frame fades on the canvas, then the page comes in under the same canvas; the
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

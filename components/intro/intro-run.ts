// ABERTURA DE MARCA NA ENTRADA DO PRODUTO
// The player of the five accepted brand openings (the logo forming), ported to native SVG and DOM in this folder. It is
// part of the descent chunk (components/onepage/descent-run.ts, fetched after hydration), and each opening is a chunk
// of its own, fetched when a link to its product is pointed at or clicked, so none of it weighs on the initial JS.
//
// How an entry plays:
//  1. `open` draws the opening on a white sheet clipped to the box of what was clicked (a card, a menu entry, the product
//     selector) and opens the clip to the whole window while the opening already runs (0.45 s).
//  2. The opening plays whole, to its closing frame (the endorsed logo with its amber bar), and holds it a moment. The
//     product is committed and placed under the sheet meanwhile.
//  3. `land` hands the logo over to the logo of the product opening: the same file, moved by translate and scale only,
//     while the sheet fades and the product shows through. Nothing cuts.
// A click, a key or the wheel during the opening skips to its closing frame; the hand-over still runs.
// v2.2 (audit A08): the whole opening plays on the first entry into each product of a visit; later entries, and every
// swap by the product selector, play the brand flash (FLASH). The sheet stays whole while the logo flies.
import styles from "./intro.module.css";

type Slug = "domus" | "relloo" | "magneto" | "tuner" | "knowly";
type Module = typeof import("./domus");
type Box = { x: number; y: number; w: number; h: number };

// LOGOS E CAIXAS
// The round drew each closing logo in the box of its dark endorsed file; the site shows the light endorsed file, which has
// the same drawing in the same coordinates with the 0.5X protection area around it. `dark` is the box the choreography
// lays out (its viewBox), `light` the viewBox of the file the site shows; both are checked against the files by
// intro.test.ts.
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
      fetch(logoUrl(slug)).then((r) => r.text()),
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

// Ease out (cubic) for the opening of the sheet and the hand-over; the openings keep their own eases
const out = (t: number) => 1 - (1 - t) ** 3;
const inOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
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

// Seconds the closing frame holds before the hand-over
const HOLD = 0.35;
// Milliseconds of the opening of the sheet and of the hand-over
const OPEN_MS = 450;
const LAND_MS = 700;
// v2.2 (audit A08): the brand flash of a product already opened in this visit, or of a swap by the product selector. The
// opening starts on its closing frame, the sheet opens faster and the hand-over is shorter: about 700 ms from the click
// to the product, against 5.2 to 5.4 s of the whole opening (measured on 8187680)
export const FLASH = { open: 120, hold: 0, land: 260 } as const;
// The content of the product comes in after the logo lands, by the sheet fading in 160 ms (never during the flight)
const REVEAL_MS = 160;

export type Playing = {
  // Resolves when the opening reached its closing frame and held it (or was skipped)
  settled: Promise<void>;
  // Hands the logo over to `target` (the logo of the product opening) and removes the sheet
  land(target: HTMLImageElement | null): Promise<void>;
  // Removes everything at once (navigation failed)
  abort(): void;
};

// O PALCO DA ABERTURA
// A 1920x1080 stage, the size the round was drawn at, scaled to fit the window and centred under the header
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
  const stage = document.createElement("div");
  stage.className = styles.stage;
  // The logo wrapper is laid out by the choreography in the dark box; the light file sits in it with its own offset
  const wm = document.createElement("div");
  wm.className = `wm ${styles.wm}`;
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
  sheet.append(stage);
  document.body.append(sheet);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const header = document.querySelector("header")?.offsetHeight ?? 0;
  // Fit the 16:9 stage in the window under the header, with a margin, never larger than its size
  const scale = Math.min((W * 0.94) / 1920, ((H - header) * 0.94) / 1080, 1);
  stage.style.transform = `translate(${(W - 1920 * scale) / 2}px, ${header + (H - header - 1080 * scale) / 2}px) scale(${scale})`;

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
    clock += (now - last) / 1000;
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
      const fromBox = img.getBoundingClientRect();
      const toBox = target?.getBoundingClientRect();
      if (!target || !toBox || toBox.width === 0) {
        await tween(320, (t) => (sheet.style.opacity = String(1 - t)));
        sheet.remove();
        return;
      }
      // The travelling logo: the same file, sized at its landing box and moved by translate and scale
      const fly = new Image();
      fly.src = img.currentSrc || img.src;
      fly.alt = "";
      fly.className = styles.fly;
      fly.style.width = `${toBox.width}px`;
      fly.style.height = `${toBox.height}px`;
      document.body.append(fly);
      const place = (t: number) => {
        const k = inOut(t);
        const s = mix(fromBox.width, toBox.width, k) / toBox.width;
        fly.style.transform = `translate(${mix(fromBox.left, toBox.left, k)}px, ${mix(fromBox.top, toBox.top, k)}px) scale(${s})`;
      };
      place(0);
      wm.style.visibility = "hidden";
      target.style.visibility = "hidden";
      // v2.2 (audit A08): the sheet stays whole for the whole flight (it faded from 15% of it, which left the large logo
      // over the page at half opacity); the amber bar goes first, and the page shows only once the logo has landed
      await tween(flash ? FLASH.land : LAND_MS, (t) => {
        place(t);
        role.style.opacity = String(1 - Math.min(1, t * 3));
      });
      target.style.visibility = "";
      await tween(REVEAL_MS, (t) => (sheet.style.opacity = String(1 - t)));
      fly.remove();
      sheet.remove();
    },
    abort() {
      listen(false);
      cancelAnimationFrame(raf);
      sheet.remove();
    },
  };
}

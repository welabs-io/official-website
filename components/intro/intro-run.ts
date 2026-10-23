// ABERTURA DE MARCA NA ENTRADA DO PRODUTO
// v4 (brief-v4, artboard 8 of the canvas, 2026-10-23): the opening is the brand's own logo motion (welabs-io/brand
// vector/motion/<slug>-light.svg, copied to public/brands/welabs/motion), played once on the canvas of the page
// (#f7f7f5) from the first frame to the last, with the "by welabs" seal under it. The logo is the vector file at its
// display size, about 30 % of the window's width (--intro-logo): no transform scale, no camera zoom, no blur, so it
// stays crisp (the choreographies before it scaled a raster of the logo up in flight and zoomed the camera). It is part
// of the descent chunk (components/onepage/descent-run.ts, fetched after hydration), and the motion file of each
// product is fetched when a link to it is pointed at or clicked, so none of it weighs on the initial JS.
//
// How an entry plays (the brand cycle is 4.8 s):
//  1. `open` draws the sheet clipped to the box of what was clicked and opens the clip to the whole window (0.45 s)
//     while the logo forms: the name opens from left to right (4 -> 34 %), then the product's sign settles (34 -> 86 %).
//  2. The product is committed and placed under the sheet meanwhile.
//  3. `land` plays the end of the cycle (86 -> 100 %: the logo fades on the same canvas), removes the sheet and lets
//     the page come in, 800 ms rising 16 px on the enter curve.
// A click, a key or the wheel during the opening skips to the formed logo; the end still plays.
// v2.2 (audit A08): the whole opening plays on the first entry into each product of a visit; later entries, and every
// swap by the product selector, play the brand flash (FLASH), which starts on the formed logo.
import styles from "./intro.module.css";

type Slug = "domus" | "relloo" | "magneto" | "tuner" | "knowly";

// LOGOS E CAIXAS
// The viewBox of the light endorsed file (the logo with its "by welabs" seal) and the height of the motion file, which
// is the same drawing without the seal, on the same x, width and top (intro.test.ts reads both against the files). The
// seal is the band of the endorsed file under the motion's height.
export const BOXES: Record<Slug, { light: number[]; motionHeight: number }> = {
  domus: { light: [-70.2, -75, 1005.06, 563.28], motionHeight: 434.1 },
  relloo: { light: [-75, -75, 790.92, 563.28], motionHeight: 434.1 },
  magneto: { light: [-66, -75, 1287.84, 563.28], motionHeight: 434.1 },
  tuner: { light: [-65.7, -110.83, 903.97, 599.11], motionHeight: 469.93 },
  knowly: { light: [-66, -75, 1048.2, 563.28], motionHeight: 434.1 },
};

const motionUrl = (slug: Slug) => `/brands/welabs/motion/${slug}-light.svg`;
const endorsedUrl = (slug: Slug) => `/brands/welabs/products/${slug}-light-endorsed.svg`;

// What an opening needs before it can draw a frame: the text of its motion file (the endorsed file is warmed)
const cache = new Map<Slug, Promise<string>>();
export const isSlug = (s: string | null): s is Slug => s !== null && s in BOXES;

export function prepare(slug: Slug) {
  let ready = cache.get(slug);
  if (!ready) {
    ready = Promise.all([
      fetch(motionUrl(slug)).then((r) => {
        if (!r.ok) throw new Error(`intro: ${r.status}`);
        return r.text();
      }),
      // Warm the endorsed file, so the seal is decoded before it shows
      new Promise<void>((done) => {
        const img = new Image();
        img.onload = img.onerror = () => done();
        img.src = endorsedUrl(slug);
      }),
    ]).then(([motion]) => motion);
    ready.catch(() => cache.delete(slug));
    cache.set(slug, ready);
  }
  return ready;
}

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
// The brand cycle (ms) and the moment the logo is formed and still (86 % of it, before the fade to the page)
const CYCLE = 4800;
const SETTLED = CYCLE * 0.86;
// Milliseconds the formed logo holds before the end plays, of the opening of the sheet, and of the end (86 -> 100 %)
const HOLD = 200;
const OPEN_MS = 450;
const LAND_MS = CYCLE - SETTLED;
// v2.2 (audit A08): the brand flash of a product already opened in this visit, or of a swap by the product selector:
// it starts on the formed logo, the sheet opens faster and the end is shorter (about 700 ms from the click to the page)
export const FLASH = { open: 120, hold: 0, land: 260 } as const;
// The page comes in under the canvas as the sheet goes (artboard 8: --dur-enter on --ease-enter, rising --rise-enter),
// read from the tokens of app/lib.css
const pageIn = () => {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return {
    ms: parseFloat(token("--dur-enter") || "0.8") * 1000,
    rise: token("--rise-enter") || "16px",
    easing: token("--ease-enter") || "ease-out",
  };
};
// The seal under the logo shows with the name and fades with it (offsets of the brand cycle)
const SEAL_FRAMES: Keyframe[] = [
  { offset: 0, opacity: 0 },
  { offset: 0.34, opacity: 0 },
  { offset: 0.46, opacity: 1 },
  { offset: 0.86, opacity: 1 },
  { offset: 0.96, opacity: 0 },
  { offset: 1, opacity: 0 },
];

export type Playing = {
  // Resolves when the opening reached its formed logo and held it (or was skipped)
  settled: Promise<void>;
  // Plays the end of the cycle, removes the sheet and brings in the page that holds `target` (the product's logo)
  land(target: HTMLElement | null): Promise<void>;
  // Removes everything at once (navigation failed)
  abort(): void;
};

// O PALCO DA ABERTURA
// The canvas sheet, and in its centre the motion file in a shadow root (its styles and keyframes stay inside) over the
// seal band of the endorsed file; every animation of both is paused and driven by one clock
export async function open(
  slug: Slug,
  from: { x: number; y: number; w: number; h: number },
  // v2.2: the short brand flash instead of the whole opening
  flash = false,
): Promise<Playing> {
  const motion = await prepare(slug);
  const box = BOXES[slug];
  const sheet = document.createElement("div");
  sheet.className = styles.sheet;
  sheet.dataset.intro = slug;
  sheet.setAttribute("aria-hidden", "true");
  const mark = document.createElement("div");
  mark.className = styles.mark;
  mark.dataset.introLogo = "";
  mark.style.aspectRatio = `${box.light[2]} / ${box.light[3]}`;
  const seal = new Image();
  seal.src = endorsedUrl(slug);
  seal.alt = "";
  seal.className = styles.seal;
  seal.style.clipPath = `inset(${((box.motionHeight / box.light[3]) * 100).toFixed(3)}% 0 0 0)`;
  const host = document.createElement("div");
  host.className = styles.motion;
  host.style.height = `${((box.motionHeight / box.light[3]) * 100).toFixed(3)}%`;
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>:host{display:block}svg{display:block;width:100%;height:100%}</style>${motion}`;
  mark.append(seal, host);
  sheet.append(mark);
  document.body.append(sheet);

  // Every animation of the motion file and of the seal, paused: the clock sets their time
  const animations = [
    ...root.getAnimations(),
    seal.animate(SEAL_FRAMES, { duration: CYCLE, fill: "both" }),
  ];
  for (const a of animations) a.pause();
  const render = (ms: number) => {
    for (const a of animations) a.currentTime = Math.min(ms, CYCLE - 1);
  };

  const end = SETTLED + (flash ? FLASH.hold : HOLD);
  // The flash starts on the formed logo
  let clock = flash ? SETTLED : 0;
  let last = performance.now();
  let skip = false;
  let done = false;
  let raf = 0;
  let resolveSettled = () => {};
  const settled = new Promise<void>((r) => (resolveSettled = r));
  render(clock);

  // A click, a key or the wheel skips to the formed logo
  const onSkip = (event: Event) => {
    if (event.type === "wheel" || event.type === "touchmove") event.preventDefault();
    skip = true;
  };
  const opts = { capture: true, passive: false } as AddEventListenerOptions;
  const listen = (on: boolean) => {
    const fn = on ? window.addEventListener : window.removeEventListener;
    for (const type of ["pointerdown", "keydown", "wheel", "touchmove"]) fn(type, onSkip, opts);
  };
  listen(true);

  const tick = (now: number) => {
    clock += now - last;
    last = now;
    if (skip) clock = Math.max(clock, SETTLED);
    render(Math.min(clock, SETTLED));
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
  const W = window.innerWidth;
  const H = window.innerHeight;
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
      // The end of the brand cycle: the logo fades on the canvas (the flash plays it faster)
      await tween(flash ? FLASH.land : LAND_MS, (t) => render(mix(SETTLED, CYCLE, t)));
      sheet.remove();
      // The page comes in under the same canvas
      const page = pageIn();
      target?.closest<HTMLElement>("[data-descent-slot]")?.animate(
        [
          { opacity: 0, transform: `translateY(${page.rise})` },
          { opacity: 1, transform: "none" },
        ],
        { duration: page.ms, easing: page.easing },
      );
    },
    abort() {
      listen(false);
      cancelAnimationFrame(raf);
      sheet.remove();
    },
  };
}

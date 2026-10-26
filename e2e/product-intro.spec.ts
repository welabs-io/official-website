// ABERTURA DE CADA PRODUTO: CANVAS, SEM BLUR, CÂMERA CONTIDA E SELO LIVRE
// Operator (2026-10-24): "está com bg antigo 'creme forte' e sem movimento da intro oficial de cada que tinha excesso de
// zoom [...] Além disso está sobrepondo o 'by welabs'". Measured on b0d806e: the opening was the brand's motion file,
// whose own backdrop (#FAF5EA) covered the top of the "by welabs" seal of the endorsed file under it. The openings are
// the choreographies of each product again (components/intro). v6 (operator, 2026-10-26: "o tamanho do intro que abre
// em tela cheia [...] hoje tá grande ainda"): the opening plays in a compact panel, with the page visible behind it.
// For the five products, at 1440 and at 390, a fresh visit clicks into the product from the home and this spec samples
// every frame of the opening:
//  (a) the panel is the canvas, rgb(247, 247, 245), on every frame, and the pixels by its corners are that canvas from
//      the start of the opening to its end (not a cream drawn by something inside it);
//  (b) no element of the opening is blurred (filter, backdrop-filter or an SVG Gaussian blur);
//  (c) the camera of the opening is the round's (at most 1.7, the Domus close-up), the stage is never scaled by a
//      transform, and the closing logo takes ~200 px in the 480 px panel of a 1440 window (v6; 300 px of the window in
//      v5, 440 before) and 5/12 of the panel of a phone;
//  (d) on the closing frame the "by welabs" seal (the seal group of the endorsed file, placed where the file shows) is
//      inside the panel, intersects neither the drawing of the logo, nor the amber bar, nor the fixed header, and is
//      the topmost thing painted at its centre;
//  (e) v6: the panel never covers more than 45 % of the window's width or height on a wide window (the box its clip
//      shows, on every frame, the growth included), and 88 % of a phone's width; on the closing frame it is centred in
//      the room under the header, rounded by --surface-radius, with its shadow, over a veil of 6 % of the ink;
//  (f) v6: the page behind is visible while the opening plays, and the page never swaps nor scrolls in sight: every
//      frame where the slot holds another page, or the window scrolled, before the panel leaves, has the cover whole.
import { inflateSync } from "node:zlib";
import { expect, test, type Page } from "@playwright/test";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
const CANVAS = "rgb(247, 247, 245)";
const MAX_CAMERA = 1.7;
// The closing logo (the light box of the endorsed file) is 5/12 of the panel's width (intro-run.ts LOGO_SHARE), unless
// the stage would be wider than the panel (the Relloo, 197.7 px at 1440): ~200 px at 1440, ~142 px in the 343 px panel
// of a 390 phone
const LOGO_PX = {
  1440: [195, 201],
  390: [138, 144],
} as const;
// The panel: at most 45 % of a wide window, 88 % of a phone's width
const PANEL_CAP = 0.45;
const PHONE_PANEL = 0.88;

type Rect = { left: number; top: number; right: number; bottom: number };
const meets = (a: Rect, b: Rect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

// The colour of one pixel of the window: a 1x1 PNG holds one row of one pixel, whose bytes are the pixel whatever the
// row filter (every predictor of a lone pixel is 0)
async function pixel(page: Page, x: number, y: number) {
  const png = await page.screenshot({
    clip: { x, y, width: 1, height: 1 },
    animations: "allow",
  });
  const chunks: Buffer[] = [];
  for (let at = 8; at < png.length; ) {
    const len = png.readUInt32BE(at);
    const type = png.toString("ascii", at + 4, at + 8);
    if (type === "IDAT") chunks.push(png.subarray(at + 8, at + 8 + len));
    at += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  return `rgb(${raw[1]}, ${raw[2]}, ${raw[3]})`;
}

type Frame = {
  t: number;
  bg: string;
  blur: number;
  camera: number;
  stage: string;
  // The box the panel shows (its clip, while it grows) as shares of the window's width and height
  shownW: number;
  shownH: number;
  cover: number;
  phase: string;
  // The slot holds another page than at the click, or the window scrolled since the click
  swapped: boolean;
  scrolled: boolean;
};

// Starts the frame sampler before the click: background, blur and camera scale of every frame of the opening, the box
// the panel shows, the cover behind it and whether the page behind already swapped
const startSampling = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __frames: Frame[]; __gone: number };
    w.__frames = [];
    w.__gone = 0;
    const t0 = performance.now();
    const slot = document.querySelector("[data-descent-slot]")!;
    const first = slot.firstElementChild;
    const y0 = scrollY;
    const scaleOf = (m: string) => {
      const v = /matrix\(([^)]+)\)/.exec(m)?.[1].split(",").map(Number);
      return v ? Math.hypot(v[0], v[1]) : 1;
    };
    // inset(top right bottom left round r) of the grow layer, as the box it shows
    const shown = (clip: string) => {
      const v = /inset\(([^)]*?)(?: round|\))/
        .exec(clip)?.[1]
        .trim()
        .split(/\s+/)
        .map(parseFloat);
      if (!v) return [1, 1];
      const [top, right = top, bottom = top, left = right] = v;
      return [
        (innerWidth - left - right) / innerWidth,
        (innerHeight - top - bottom) / innerHeight,
      ];
    };
    const tick = () => {
      const sheet = document.querySelector<HTMLElement>("[data-intro]");
      if (sheet) {
        const all = [sheet, ...sheet.querySelectorAll<Element>("*")];
        const stage = sheet.querySelector<HTMLElement>("[data-intro-stage]")!;
        const panel = sheet.querySelector<HTMLElement>("[data-intro-panel]")!;
        const [shownW, shownH] = shown(
          getComputedStyle(panel.parentElement!).clipPath,
        );
        w.__frames.push({
          t: performance.now() - t0,
          shownW,
          shownH,
          cover: Number(
            getComputedStyle(sheet.querySelector("[data-intro-cover]")!)
              .opacity,
          ),
          phase: sheet.dataset.introPhase ?? "",
          swapped: slot.firstElementChild !== first,
          scrolled: Math.abs(scrollY - y0) > 0.5,
          bg: getComputedStyle(panel).backgroundColor,
          blur:
            all.filter((el) => {
              const cs = getComputedStyle(el);
              return /blur/.test(`${cs.filter} ${cs.backdropFilter}`);
            }).length + sheet.querySelectorAll("feGaussianBlur").length,
          camera: Math.max(
            1,
            ...[...sheet.querySelectorAll(".zoom")].map((el) =>
              scaleOf(getComputedStyle(el).transform),
            ),
          ),
          stage: `${getComputedStyle(stage).transform} ${getComputedStyle(stage).zoom}`,
        });
      } else if (w.__frames.length && !w.__gone)
        w.__gone = performance.now() - t0;
      if (!w.__gone) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

// The closing frame: the seal of the endorsed file where the file shows it, against the logo, the bar and the header
const closingGeometry = (page: Page) =>
  page.evaluate(async () => {
    const sheet = document.querySelector<HTMLElement>("[data-intro]")!;
    const panelEl = sheet.querySelector<HTMLElement>("[data-intro-panel]")!;
    const img = sheet.querySelector<HTMLImageElement>("[data-intro-logo] img")!;
    const text = await (await fetch(img.src)).text();
    const r = img.getBoundingClientRect();
    // The same file inline, at the box of the image (same viewBox, same fit), so each part has its box on screen
    const probe = document.createElement("div");
    probe.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;visibility:hidden;pointer-events:none`;
    probe.innerHTML = text;
    const svg = probe.querySelector("svg")!;
    svg.setAttribute("width", String(r.width));
    svg.setAttribute("height", String(r.height));
    document.body.append(probe);
    const box = (el: Element) => {
      const b = el.getBoundingClientRect();
      return { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    };
    const parts = [...svg.children];
    // The seal is the group of the endorsed file that places the "by welabs" lockup scaled under the logo (a logo may
    // group its own letters too, unscaled)
    const seal = parts.find(
      (el) =>
        el.tagName === "g" &&
        /scale\(/.test(el.getAttribute("transform") ?? ""),
    )!;
    const drawing = parts.filter((el) => el !== seal).map(box);
    const sealBox = box(seal);
    probe.remove();
    const cx = (sealBox.left + sealBox.right) / 2;
    const cy = (sealBox.top + sealBox.bottom) / 2;
    const top = document.elementFromPoint(cx, cy);
    const header = document.querySelector("header")!.getBoundingClientRect();
    return {
      seal: sealBox,
      drawing,
      bar: box(sheet.querySelector(".bar")!),
      header: {
        left: header.left,
        top: header.top,
        right: header.right,
        bottom: header.bottom,
      },
      logoWidth: r.width,
      panel: box(panelEl),
      radius: getComputedStyle(panelEl).borderTopLeftRadius,
      // The shadow is the lift, the sibling under the grow layer, at the box of the panel
      shadow: getComputedStyle(panelEl.parentElement!.previousElementSibling!)
        .boxShadow,
      tint: getComputedStyle(sheet.querySelector("[data-intro-tint]")!)
        .backgroundColor,
      topmost: top === img,
      shown: getComputedStyle(img.parentElement!).visibility,
      clip: getComputedStyle(img.parentElement!).clipPath,
      vw: innerWidth,
      vh: innerHeight,
    };
  });

for (const viewport of VIEWPORTS)
  test.describe(`opening of each product at ${viewport.width}`, () => {
    test.use({ viewport });
    for (const slug of SLUGS)
      test(`${slug}: a compact panel on the canvas, no blur, camera at most ${MAX_CAMERA}, the seal free, the swap out of sight`, async ({
        page,
      }) => {
        test.setTimeout(45_000);
        await page.goto("/", { waitUntil: "load" });
        await page.waitForTimeout(1200);
        const link = page
          .locator(`#main-content a[href="/products/${slug}"]:visible`)
          .first();
        await link.scrollIntoViewIfNeeded();
        await link.hover();
        await page.waitForTimeout(900);
        await startSampling(page);
        const t0 = Date.now();
        await link.click();

        // (a) the pixels by the corners of the panel (12 px in, inside its rounded corners), from the start of the
        // opening to its closing frame
        const panel = await page
          .locator("[data-intro-panel]")
          .evaluate((el) => {
            const b = el.getBoundingClientRect();
            return { l: b.left, t: b.top, r: b.right, b: b.bottom };
          });
        const spots = [
          [Math.ceil(panel.l) + 12, Math.ceil(panel.t) + 12],
          [Math.floor(panel.r) - 12, Math.floor(panel.b) - 12],
        ];
        const seen: string[] = [];
        // At SPEED 1.6 the logo is formed at ~2.5 s and the panel leaves at ~3.9 s: the first sample is past the 450 ms
        // that the clip takes to reach the box of the panel, the last one before the closing frame starts to leave
        for (const at of [500, 1100, 1700, 2250]) {
          await page.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
          for (const [x, y] of spots) seen.push(await pixel(page, x, y));
        }

        // (d) the closing frame: the bar under the logo is drawn whole
        await page.waitForFunction(
          () => {
            const bar = document.querySelector("[data-intro] .bar");
            return (
              !!bar &&
              getComputedStyle(bar).transform === "matrix(1, 0, 0, 1, 0, 0)"
            );
          },
          null,
          { timeout: 10_000, polling: 16 },
        );
        const geo = await closingGeometry(page);

        await page.waitForFunction(
          () => (window as unknown as { __gone: number }).__gone > 0,
          null,
          { timeout: 15_000 },
        );
        await expect(page).toHaveURL(new RegExp(`/products/${slug}$`));
        const { frames, gone } = await page.evaluate(() => {
          const w = window as unknown as { __frames: Frame[]; __gone: number };
          return { frames: w.__frames, gone: w.__gone };
        });
        const camera = Math.max(...frames.map((f) => f.camera));
        const maxW = Math.max(...frames.map((f) => f.shownW));
        const maxH = Math.max(...frames.map((f) => f.shownH));
        const p = geo.panel;
        console.log(
          `${slug} at ${viewport.width}: ${frames.length} frames, ${Math.round(gone)} ms to the page, camera ${camera.toFixed(3)}, panel ${JSON.stringify(
            [p.left, p.top, p.right - p.left, p.bottom - p.top].map(Math.round),
          )} (at most ${(maxW * 100).toFixed(1)} % x ${(maxH * 100).toFixed(1)} % of the window), logo ${geo.logoWidth.toFixed(1)} px, seal ${JSON.stringify(
            Object.values(geo.seal).map(Math.round),
          )}`,
        );

        expect(frames.length, "frames of the opening").toBeGreaterThan(60);
        expect(new Set(frames.map((f) => f.bg))).toEqual(new Set([CANVAS]));
        expect(new Set(seen), "pixels by the corners of the panel").toEqual(
          new Set([CANVAS]),
        );

        // (e) the panel: never large, on any frame (the growth from the box clicked included)
        expect(maxH, "height the panel shows").toBeLessThanOrEqual(PANEL_CAP);
        if (viewport.width >= 768)
          expect(maxW, "width the panel shows").toBeLessThanOrEqual(PANEL_CAP);
        else
          expect(maxW, "width the panel shows").toBeLessThanOrEqual(
            PHONE_PANEL + 0.005,
          );
        // Its box on the closing frame: 16:9, centred in the room under the header, rounded, with its shadow
        const pw = p.right - p.left;
        const ph = p.bottom - p.top;
        expect(Math.abs(pw / ph - 16 / 9), "16:9").toBeLessThan(0.01);
        if (viewport.width < 768)
          expect(pw / geo.vw, "panel of a phone").toBeCloseTo(PHONE_PANEL, 2);
        else {
          expect(pw / geo.vw, "panel width").toBeLessThanOrEqual(PANEL_CAP);
          expect(ph / geo.vh, "panel height").toBeLessThanOrEqual(PANEL_CAP);
        }
        expect(
          Math.abs(p.left - (geo.vw - p.right)),
          "centred across",
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(p.top - geo.header.bottom - (geo.vh - p.bottom)),
          "centred under the header",
        ).toBeLessThanOrEqual(1);
        expect(geo.radius).toBe("20px");
        expect(geo.shadow).not.toBe("none");
        // The veil over the page behind: the ink at 6 %
        // (color-mix computes to `color(srgb r g b / a)`, channels from 0 to 1)
        const veil = /(rgba?|color)\((?:srgb\s+)?([^)]+)\)/.exec(geo.tint);
        const [r, g, b, a] = (veil?.[2] ?? "")
          .split(/[\s,/]+/)
          .filter(Boolean)
          .map(Number);
        const unit = veil?.[1] === "color" ? 255 : 1;
        expect(
          [r, g, b].map((c) => Math.round(c * unit)),
          `veil ${geo.tint}`,
        ).toEqual([18, 18, 18]);
        expect(a).toBeGreaterThanOrEqual(0.04);
        expect(a).toBeLessThanOrEqual(0.08);

        // (f) the page behind is in sight while the opening plays (no cover over its first 1.5 s), and it swaps and
        // scrolls only under the whole cover, before the panel leaves
        const early = frames.filter((f) => f.t < 1500 && f.phase === "play");
        expect(early.length, "early frames").toBeGreaterThan(30);
        expect(Math.max(...early.map((f) => f.cover)), "page in sight").toBe(0);
        const under = frames.filter(
          (f) => (f.swapped || f.scrolled) && f.phase !== "land",
        );
        expect(
          frames.some((f) => f.swapped && f.phase !== "land"),
          "swapped before the panel leaves",
        ).toBe(true);
        expect(
          Math.min(...under.map((f) => f.cover)),
          "cover while the page swaps",
        ).toBeGreaterThanOrEqual(0.999);
        expect(Math.max(...frames.map((f) => f.blur)), "blurred elements").toBe(
          0,
        );
        expect(camera, "camera scale").toBeLessThanOrEqual(MAX_CAMERA);
        // The stage is fitted by CSS zoom, never by a transform, and never above its size
        for (const f of frames) {
          const [transform, zoom] = f.stage.split(" ");
          expect(transform).toBe("none");
          expect(Number(zoom)).toBeLessThanOrEqual(1);
        }

        // The closing logo at ~200 px in the panel of a 1440 window, ~142 px in the panel of a 390 phone
        const [low, high] = LOGO_PX[viewport.width as keyof typeof LOGO_PX];
        expect(geo.logoWidth, "logo width").toBeGreaterThanOrEqual(low);
        expect(geo.logoWidth, "logo width").toBeLessThanOrEqual(high);
        expect(geo.shown).toBe("visible");
        expect(geo.clip).toBe("none");
        expect(geo.topmost, "nothing painted over the seal").toBe(true);
        expect(geo.seal.left).toBeGreaterThanOrEqual(p.left);
        expect(geo.seal.right).toBeLessThanOrEqual(p.right);
        expect(geo.seal.bottom).toBeLessThanOrEqual(p.bottom);
        expect(geo.seal.top).toBeGreaterThanOrEqual(p.top);
        expect(geo.seal.top).toBeGreaterThanOrEqual(geo.header.bottom);
        expect(meets(geo.seal, geo.header), "seal x header").toBe(false);
        expect(meets(geo.seal, geo.bar), "seal x bar").toBe(false);
        for (const part of geo.drawing)
          expect(meets(geo.seal, part), "seal x logo").toBe(false);
      });
  });

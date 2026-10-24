// ABERTURA DE CADA PRODUTO: CANVAS, SEM BLUR, CÂMERA CONTIDA E SELO LIVRE
// Operator (2026-10-24): "está com bg antigo 'creme forte' e sem movimento da intro oficial de cada que tinha excesso de
// zoom [...] Além disso está sobrepondo o 'by welabs'". Measured on b0d806e: the opening was the brand's motion file,
// whose own backdrop (#FAF5EA) covered the top of the "by welabs" seal of the endorsed file under it. The openings are
// the choreographies of each product again (components/intro). For the five products, at 1440 and at 390, a fresh visit
// clicks into the product from the home and this spec samples every frame of the opening:
//  (a) the sheet is the canvas, rgb(247, 247, 245), on every frame, and the pixels the window shows around the scene
//      are that canvas from the start of the opening to its end (not a cream drawn by something inside it);
//  (b) no element of the opening is blurred (filter, backdrop-filter or an SVG Gaussian blur);
//  (c) the camera of the opening is the round's (at most 1.7, the Domus close-up), the stage is never scaled by a
//      transform, and the closing logo takes 300 of 1440 px of a wide window (v5; 440 before, and the stage used to fill
//      it) and 56 % of a phone's width;
//  (d) on the closing frame the "by welabs" seal (the seal group of the endorsed file, placed where the file shows) is
//      inside the window, intersects neither the drawing of the logo, nor the amber bar, nor the fixed header, and is
//      the topmost thing painted at its centre.
import { inflateSync } from "node:zlib";
import { expect, test, type Page } from "@playwright/test";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
const CANVAS = "rgb(247, 247, 245)";
const MAX_CAMERA = 1.7;
// The share of the window the closing logo (the light box of the endorsed file) takes (intro-run.ts LOGO_SHARE). v5
// (operator, 2026-10-24: "ainda achei grande"): 300 of 1440 px on a wide window (was 440), 56 % of a phone (was 72 %)
const WIDE_LOGO_SHARE = 300 / 1440;
const PHONE_LOGO_SHARE = 0.56;

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

// Starts the frame sampler before the click: background, blur and camera scale of every frame of the opening
const startSampling = (page: Page) =>
  page.evaluate(() => {
    type Frame = { bg: string; blur: number; camera: number; stage: string };
    const w = window as unknown as { __frames: Frame[]; __gone: number };
    w.__frames = [];
    w.__gone = 0;
    const t0 = performance.now();
    const scaleOf = (m: string) => {
      const v = /matrix\(([^)]+)\)/.exec(m)?.[1].split(",").map(Number);
      return v ? Math.hypot(v[0], v[1]) : 1;
    };
    const tick = () => {
      const sheet = document.querySelector<HTMLElement>("[data-intro]");
      if (sheet) {
        const all = [sheet, ...sheet.querySelectorAll<Element>("*")];
        const stage = sheet.querySelector<HTMLElement>("[data-intro-stage]")!;
        w.__frames.push({
          bg: getComputedStyle(sheet).backgroundColor,
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
      test(`${slug}: canvas, no blur, camera at most ${MAX_CAMERA}, the seal free`, async ({
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
        const headerH = await page.evaluate(
          () =>
            document.querySelector("header")!.getBoundingClientRect().bottom,
        );
        await startSampling(page);
        const t0 = Date.now();
        await link.click();

        // (a) the pixels around the scene, from the start of the opening to its closing frame
        const spots = [
          [viewport.width - 6, Math.ceil(headerH) + 6],
          [viewport.width - 6, viewport.height - 6],
        ];
        const seen: string[] = [];
        // At SPEED 1.6 the logo is formed at ~2.5 s and the sheet leaves at ~3.9 s: the first sample is past the 450 ms
        // that the clip takes to reach the corners, the last one before the closing frame starts to fade
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
          const w = window as unknown as {
            __frames: {
              bg: string;
              blur: number;
              camera: number;
              stage: string;
            }[];
            __gone: number;
          };
          return { frames: w.__frames, gone: w.__gone };
        });
        const camera = Math.max(...frames.map((f) => f.camera));
        console.log(
          `${slug} at ${viewport.width}: ${frames.length} frames, ${Math.round(gone)} ms to the page, camera ${camera.toFixed(3)}, seal ${JSON.stringify(
            Object.values(geo.seal).map(Math.round),
          )}`,
        );

        expect(frames.length, "frames of the opening").toBeGreaterThan(60);
        expect(new Set(frames.map((f) => f.bg))).toEqual(new Set([CANVAS]));
        expect(new Set(seen), "pixels around the scene").toEqual(
          new Set([CANVAS]),
        );
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

        // The closing logo at 300 px of a 1440 window (LOGO_SHARE.wide) and at 56 % of a phone (LOGO_SHARE.phone)
        expect(geo.logoWidth / geo.vw, "logo share").toBeCloseTo(
          viewport.width >= 768 ? WIDE_LOGO_SHARE : PHONE_LOGO_SHARE,
          2,
        );
        expect(geo.shown).toBe("visible");
        expect(geo.clip).toBe("none");
        expect(geo.topmost, "nothing painted over the seal").toBe(true);
        expect(geo.seal.left).toBeGreaterThanOrEqual(0);
        expect(geo.seal.right).toBeLessThanOrEqual(geo.vw);
        expect(geo.seal.bottom).toBeLessThanOrEqual(geo.vh);
        expect(geo.seal.top).toBeGreaterThanOrEqual(geo.header.bottom);
        expect(meets(geo.seal, geo.header), "seal x header").toBe(false);
        expect(meets(geo.seal, geo.bar), "seal x bar").toBe(false);
        for (const part of geo.drawing)
          expect(meets(geo.seal, part), "seal x logo").toBe(false);
      });
  });

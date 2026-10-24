// ABERTURA DE CADA PRODUTO: MOTION OFICIAL, CANVAS, SEM BLUR NEM ZOOM, SELO LIVRE
// Operator (2026-10-24): "está com bg antigo 'creme forte' [...] Além disso está sobrepondo o 'by welabs'", then "a
// intro não é oficial da marca, que é um gif ou motion da ident visual, ela que deve entrar". Measured on b0d806e: the
// opening plays the brand's motion file (public/brands/welabs/motion/<slug>-light.svg), whose own backdrop (#FAF5EA)
// painted the window cream and covered the top of the "by welabs" seal, and the seal band started inside the motion's
// box, cutting the seal's top. For the five products, at 1440 and at 390, a fresh visit clicks into the product from
// the home and this spec samples every frame of the opening:
//  (a) the sheet is the canvas, rgb(247, 247, 245), on every frame, and the pixels the window shows around the logo and
//      inside the box of the motion file (where its backdrop was) are that canvas from the start to the formed logo;
//  (b) no element of the opening, the shadow root of the motion included, is blurred;
//  (c) the logo is never zoomed: no transform from the sheet to the motion file and the seal, and one size throughout;
//  (d) on the formed logo the "by welabs" seal (the seal group of the endorsed file, where the file shows it) is inside
//      the window, intersects neither the drawing of the logo nor the fixed header, and is the topmost thing painted
//      at its centre;
//  (e) the official motion plays on the first entry: it starts unformed (the name clipped shut), its clock advances and
//      the clip of the name opens.
import { inflateSync } from "node:zlib";
import { expect, test, type Page } from "@playwright/test";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
const CANVAS = "rgb(247, 247, 245)";

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
  bg: string;
  blur: number;
  chain: string;
  width: number;
  time: number;
  name: string;
};

// Starts the frame sampler before the click: background, blur, the transforms over the logo, its width, the clock of
// the motion and the clip of the name, on every frame of the opening
const startSampling = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __frames: Frame[]; __gone: number };
    w.__frames = [];
    w.__gone = 0;
    const t0 = performance.now();
    const tick = () => {
      const sheet = document.querySelector<HTMLElement>("[data-intro]");
      if (sheet) {
        const mark = sheet.querySelector<HTMLElement>("[data-intro-logo]")!;
        const host = mark.querySelector<HTMLElement>("div")!;
        const root = host.shadowRoot!;
        const all = [
          sheet,
          ...sheet.querySelectorAll<Element>("*"),
          ...root.querySelectorAll<Element>("*"),
        ];
        const name = root.querySelector(".mv-name");
        w.__frames.push({
          bg: getComputedStyle(sheet).backgroundColor,
          blur:
            all.filter((el) => {
              const cs = getComputedStyle(el);
              return /blur/.test(`${cs.filter} ${cs.backdropFilter}`);
            }).length + root.querySelectorAll("feGaussianBlur").length,
          chain: [
            ...new Set(
              [sheet, mark, host, mark.querySelector("img")!].map(
                (el) =>
                  `${getComputedStyle(el).transform}/${getComputedStyle(el).zoom}`,
              ),
            ),
          ].join(" "),
          width: mark.getBoundingClientRect().width,
          time: Math.max(
            0,
            ...root.getAnimations().map((a) => Number(a.currentTime ?? 0)),
          ),
          name: name ? getComputedStyle(name).clipPath : "",
        });
      } else if (w.__frames.length && !w.__gone)
        w.__gone = performance.now() - t0;
      if (!w.__gone) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

// The formed logo: the seal of the endorsed file where the file shows it, against the drawing of the motion file
// (each piece of it, after the backdrop was dropped) and the header
const formedGeometry = (page: Page) =>
  page.evaluate(async () => {
    const sheet = document.querySelector<HTMLElement>("[data-intro]")!;
    const mark = sheet.querySelector<HTMLElement>("[data-intro-logo]")!;
    const img = mark.querySelector("img")!;
    const svg = mark.querySelector("div")!.shadowRoot!.querySelector("svg")!;
    const box = (el: Element) => {
      const b = el.getBoundingClientRect();
      return { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    };
    const text = await (await fetch(img.src)).text();
    const r = img.getBoundingClientRect();
    // The endorsed file inline at the box of the image (same viewBox, same fit), so its seal has its box on screen
    const probe = document.createElement("div");
    probe.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;visibility:hidden;pointer-events:none`;
    probe.innerHTML = text;
    const file = probe.querySelector("svg")!;
    file.setAttribute("width", String(r.width));
    file.setAttribute("height", String(r.height));
    document.body.append(probe);
    // The seal is the group that places the "by welabs" lockup scaled under the logo
    const seal = box(
      [...file.children].find(
        (el) =>
          el.tagName === "g" &&
          /scale\(/.test(el.getAttribute("transform") ?? ""),
      )!,
    );
    probe.remove();
    const header = box(document.querySelector("header")!);
    const top = document.elementFromPoint(
      (seal.left + seal.right) / 2,
      (seal.top + seal.bottom) / 2,
    );
    return {
      seal,
      drawing: [...svg.querySelectorAll(":scope > *:not(style)")].map(box),
      backdrops: svg.querySelectorAll(":scope > rect").length,
      header,
      topmost: top === img,
      sealOpacity: getComputedStyle(img).opacity,
      mark: box(mark),
      vw: innerWidth,
      vh: innerHeight,
    };
  });

for (const viewport of VIEWPORTS)
  test.describe(`opening of each product at ${viewport.width}`, () => {
    test.use({ viewport });
    for (const slug of SLUGS)
      test(`${slug}: the brand's motion plays on the canvas, no blur, no zoom, the seal free`, async ({
        page,
      }) => {
        test.setTimeout(45_000);
        await page.goto("/", { waitUntil: "load" });
        await page.evaluate(() => sessionStorage.clear());
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

        // (a) pixels around the logo and in the corner of the motion's box (where its backdrop was), from the start of
        // the opening to the formed logo
        await page.waitForSelector("[data-intro] [data-intro-logo]");
        const mark = await page.evaluate(() => {
          const b = document
            .querySelector("[data-intro] [data-intro-logo]")!
            .getBoundingClientRect();
          return { left: b.left, top: b.top };
        });
        const spots = [
          [viewport.width - 6, Math.ceil(headerH) + 6],
          [viewport.width - 6, viewport.height - 6],
          [Math.ceil(mark.left) + 2, Math.ceil(mark.top) + 2],
        ];
        const seen: string[] = [];
        for (const at of [600, 1500, 2400, 3200]) {
          await page.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
          for (const [x, y] of spots) seen.push(await pixel(page, x, y));
        }

        // (d) the formed logo: the seal shows whole
        await page.waitForFunction(
          () => {
            const img = document.querySelector(
              "[data-intro] [data-intro-logo] img",
            );
            return !!img && getComputedStyle(img).opacity === "1";
          },
          null,
          { timeout: 10_000, polling: 16 },
        );
        const geo = await formedGeometry(page);

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
        const widths = frames.map((f) => f.width);
        console.log(
          `${slug} at ${viewport.width}: ${frames.length} frames, ${Math.round(gone)} ms to the page, logo ${Math.round(widths[0])} px (${(widths[0] / viewport.width).toFixed(3)}), seal ${JSON.stringify(
            Object.values(geo.seal).map(Math.round),
          )}, drawing bottom ${Math.round(Math.max(...geo.drawing.map((d) => d.bottom)))}, header ${Math.round(geo.header.bottom)}`,
        );

        expect(frames.length, "frames of the opening").toBeGreaterThan(60);
        expect(new Set(frames.map((f) => f.bg))).toEqual(new Set([CANVAS]));
        expect(new Set(seen), "pixels around the logo").toEqual(
          new Set([CANVAS]),
        );
        expect(geo.backdrops, "backdrop of the motion file").toBe(0);
        expect(Math.max(...frames.map((f) => f.blur)), "blurred elements").toBe(
          0,
        );
        // (c) no transform and no zoom over the logo, one size throughout
        expect(new Set(frames.map((f) => f.chain))).toEqual(
          new Set(["none/1"]),
        );
        expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.5);

        // (e) the motion starts unformed and plays: the clock runs past the formed logo, the name opens
        const playing = frames.filter((f) => f.time > 0);
        expect(frames[0].time, "first frame of the motion (ms)").toBeLessThan(
          400,
        );
        expect(frames[0].name, "the name starts clipped shut").toMatch(/100%/);
        expect(Math.max(...frames.map((f) => f.time))).toBeGreaterThan(3300);
        expect(
          new Set(playing.map((f) => Math.round(f.time / 100))).size,
        ).toBeGreaterThan(20);
        expect(
          new Set(frames.map((f) => f.name)).size,
          "frames of the name opening",
        ).toBeGreaterThan(10);
        // The right inset of the name's clip, from 100 % (shut) to 0 (open)
        const right = frames
          .map((f) => /inset\(\S+ (-?[\d.]+)/.exec(f.name)?.[1])
          .filter((v): v is string => v !== undefined)
          .map(Number);
        expect(right[0], "the name starts shut").toBeGreaterThanOrEqual(99);
        expect(Math.min(...right), "the name opens").toBeLessThanOrEqual(0.5);

        expect(geo.sealOpacity).toBe("1");
        expect(geo.topmost, "nothing painted over the seal").toBe(true);
        expect(geo.seal.left).toBeGreaterThanOrEqual(0);
        expect(geo.seal.right).toBeLessThanOrEqual(geo.vw);
        expect(geo.seal.bottom).toBeLessThanOrEqual(geo.vh);
        expect(meets(geo.seal, geo.header), "seal x header").toBe(false);
        expect(geo.mark.top).toBeGreaterThanOrEqual(geo.header.bottom);
        for (const part of geo.drawing)
          expect(meets(geo.seal, part), "seal x logo").toBe(false);
      });
  });

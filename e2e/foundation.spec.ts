// PROVA DA FUNDAÇÃO V4
// brief-v4 (2026-10-23), measured on /lab/foundation and on the way into a product:
//  - the connector is always curved (every route a chain of cubics, bending off its chord), with the stroke, colour and
//    opacity of its state (rest #55565b at 40 % 1.75 px, active ink 2 px, live amber 2.25 px with its bead) and a small
//    arrowhead (5 x 8 px);
//  - TypeIn never moves the layout (the box of the phrase is the same in every frame while it types), types one
//    character per ~18 ms and shows its caret;
//  - Reveal rises 12 to 20 px with no blur nor scale, staggered by 80 ms, and does not move under reduced motion;
//  - a card of a GrowRow gains width by flex-grow (never scale) over ~700 ms;
//  - the brand opening keeps the canvas (#f7f7f5) in every frame, has no CSS blur anywhere, and its closing logo (the
//    endorsed vector file) is never scaled by a transform nor changes size once shown. v4 (2026-10-24): the opening is
//    the choreography of the product again, so the logo is the closing frame of a scene, at ~30 % of a wide window.
import { expect, test, type Page } from "@playwright/test";

const LAB = "/lab/foundation";

test.beforeAll(async ({ request }) => {
  await request.get(LAB, { timeout: 60_000 });
});

// The traces of the lab: the path's d, stroke, width, opacity, its bend off the chord and the size of its arrowhead
const traces = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-lab='connectors'] > [data-link], [data-lab='connectors'] > [data-route]")].map(
      (box) => {
        const path = box.querySelector<SVGPathElement>("path[data-trace]");
        const head = box.querySelectorAll<SVGPathElement>("svg path").item(1);
        if (!path || !head) return { key: box.dataset.link ?? box.dataset.route, drawn: false } as const;
        const cs = getComputedStyle(path);
        const len = path.getTotalLength();
        const a = path.getPointAtLength(0);
        const b = path.getPointAtLength(len);
        // The farthest point of the trace from the straight chord between its ends
        let bend = 0;
        for (let at = 0; at <= len; at += len / 40) {
          const p = path.getPointAtLength(at);
          const cross = Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y));
          bend = Math.max(bend, cross / Math.hypot(b.x - a.x, b.y - a.y));
        }
        const hb = head.getBBox();
        return {
          key: box.dataset.link ?? box.dataset.route,
          drawn: true,
          d: path.getAttribute("d") ?? "",
          stroke: cs.stroke,
          width: parseFloat(cs.strokeWidth),
          opacity: Number(cs.opacity) * Number(cs.strokeOpacity),
          headStroke: getComputedStyle(head).stroke,
          head: Math.round(Math.max(hb.width, hb.height) * 10) / 10,
          bend: Math.round(bend * 10) / 10,
          bead: !!box.querySelector("svg circle"),
        } as const;
      },
    ),
  );

const STATE = {
  rest: { stroke: "rgba(85, 86, 91, 0.4)", width: 1.75 },
  active: { stroke: "rgb(18, 18, 18)", width: 2 },
  live: { stroke: "rgb(255, 176, 32)", width: 2.25 },
} as const;

test.describe("connector", () => {
  for (const width of [1440, 390])
    test(`curved, with the stroke and opacity of its state and a small arrowhead, at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(LAB);
      // Past the draw-on (1.2 s) and the arrowhead's landing
      await page.waitForTimeout(1800);
      const all = await traces(page);
      console.log(`${width}: ${JSON.stringify(all.map((t) => (t.drawn ? [t.key, t.stroke, t.width, t.bend, t.head] : [t.key])))}`);
      // Three states and three routes, all drawn (the lab places each pair as its route expects at every width)
      expect(all.map((t) => t.key)).toEqual(["rest", "active", "live", "curve", "elbow", "drop"]);
      for (const t of all) {
        expect(t.drawn, `${t.key}: drawn`).toBe(true);
        if (!t.drawn) continue;
        // Only cubics after the move: no line, horizontal or vertical segment
        expect(t.d, `${t.key}: cubic`).toMatch(/^M [\d.-]+ [\d.-]+ C /);
        expect(t.d, `${t.key}: no straight segment`).not.toMatch(/[LHVlhv]/);
        expect(t.bend, `${t.key}: bends off its chord`).toBeGreaterThanOrEqual(4);
        // The arrowhead: 5 px deep, 8 px wide, in the stroke of the line
        expect(t.head, `${t.key}: arrowhead`).toBeLessThanOrEqual(8.5);
        expect(t.head, `${t.key}: arrowhead`).toBeGreaterThanOrEqual(5);
        expect(t.headStroke, `${t.key}: arrowhead stroke`).toBe(t.stroke);
        const state = (["rest", "active", "live"] as const).find((s) => s === t.key) ?? "active";
        expect(t.stroke, `${t.key}: colour`).toBe(STATE[state].stroke);
        expect(t.width, `${t.key}: stroke`).toBeCloseTo(STATE[state].width, 2);
        expect(t.opacity, `${t.key}: opacity of the element`).toBe(1);
        expect(t.bead, `${t.key}: bead only when live`).toBe(state === "live");
      }
    });
});

test.describe("TypeIn", () => {
  test("the phrase keeps its box while it types, one character per ~18 ms, with a caret", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LAB, { waitUntil: "commit" });
    const run = await page.evaluate(async () => {
      const wait = () => new Promise((r) => requestAnimationFrame(r));
      let root: HTMLElement | null = null;
      while (!(root = document.querySelector<HTMLElement>("[data-type-in]"))) await wait();
      const bubble = root.closest("p")!;
      const chars = [...root.children] as HTMLElement[];
      const boxes = new Set<string>();
      const bubbles = new Set<string>();
      // [characters shown, ms] each time the count grows
      const shown: [number, number][] = [];
      let caret = false;
      let partial = false;
      const t0 = performance.now();
      while (performance.now() - t0 < 3500) {
        await wait();
        const now = performance.now() - t0;
        const r = root.getBoundingClientRect();
        const q = bubble.getBoundingClientRect();
        boxes.add([r.x, r.y, r.width, r.height].map((n) => n.toFixed(1)).join(","));
        bubbles.add([q.width, q.height].map((n) => n.toFixed(1)).join(","));
        const visible = chars.filter((c) => Number(getComputedStyle(c).opacity) > 0.5).length;
        if (visible > 0 && visible < chars.length) partial = true;
        if (visible > (shown.length ? shown[shown.length - 1][0] : 0)) shown.push([visible, now]);
        if (chars.some((c) => Number(getComputedStyle(c, "::after").opacity) > 0.5)) caret = true;
      }
      // The time the first characters and the last one showed
      const first = shown[0];
      const last = shown.find((p) => p[0] === chars.length);
      return {
        boxes: [...boxes],
        bubbles: [...bubbles],
        partial,
        caret,
        chars: chars.length,
        perChar: first && last ? (last[1] - first[1]) / (chars.length - first[0]) : null,
      };
    });
    console.log(JSON.stringify(run));
    expect(run.partial, "a frame with the phrase half typed").toBe(true);
    expect(run.boxes, "one box for the phrase in every frame").toHaveLength(1);
    expect(run.bubbles, "one box for the bubble in every frame").toHaveLength(1);
    expect(run.caret, "a caret after the last character shown").toBe(true);
    expect(run.perChar).not.toBeNull();
    expect(run.perChar!).toBeGreaterThan(12);
    expect(run.perChar!).toBeLessThan(26);
  });

  test("under reduced motion the phrase is whole at once, with no caret", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(LAB);
    const state = await page.evaluate(() => {
      const chars = [...document.querySelector("[data-type-in]")!.children];
      return {
        hidden: chars.filter((c) => Number(getComputedStyle(c).opacity) < 1).length,
        caret: chars.some((c) => Number(getComputedStyle(c, "::after").opacity) > 0),
      };
    });
    expect(state).toEqual({ hidden: 0, caret: false });
  });
});

test.describe("Reveal", () => {
  test("rises 12 to 20 px with no blur nor scale, 80 ms apart", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LAB);
    await page.waitForTimeout(400);
    const items = page.locator("[data-reveal-item]");
    expect(await items.evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).opacity)))).toEqual([0, 0, 0, 0]);
    const run = await page.evaluate(async () => {
      const els = [...document.querySelectorAll<HTMLElement>("[data-reveal-item]")];
      els[0].scrollIntoView({ block: "center", behavior: "instant" });
      const rise = els.map(() => 0);
      const filters = new Set<string>();
      const scaled = new Set<boolean>();
      const delays = new Set<string>();
      const t0 = performance.now();
      while (performance.now() - t0 < 1600) {
        await new Promise((r) => requestAnimationFrame(r));
        els.forEach((el, i) => {
          const cs = getComputedStyle(el);
          filters.add(cs.filter);
          const m = new DOMMatrixReadOnly(cs.transform === "none" ? undefined : cs.transform);
          rise[i] = Math.max(rise[i], m.m42);
          scaled.add(m.a !== 1 || m.d !== 1);
          for (const a of el.getAnimations()) delays.add(`${i}:${(a.effect as KeyframeEffect).getTiming().delay}`);
        });
      }
      return {
        rise,
        filters: [...filters],
        scaled: [...scaled],
        delays: [...delays].sort(),
        opacity: els.map((e) => Number(getComputedStyle(e).opacity)),
      };
    });
    console.log(JSON.stringify(run));
    for (const r of run.rise) {
      expect(r).toBeGreaterThanOrEqual(10);
      expect(r).toBeLessThanOrEqual(20);
    }
    expect(run.filters).toEqual(["none"]);
    expect(run.scaled).toEqual([false]);
    expect(run.delays).toEqual(["0:0", "1:80", "2:160", "3:240"]);
    expect(run.opacity).toEqual([1, 1, 1, 1]);
  });

  test("under reduced motion the blocks show at once, unmoved", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LAB);
    const state = await page.locator("[data-reveal-item]").evaluateAll((els) =>
      els.map((e) => [Number(getComputedStyle(e).opacity), getComputedStyle(e).transform, e.getAnimations().length]),
    );
    for (const s of state) expect(s).toEqual([1, "none", 0]);
  });
});

test.describe("GrowRow", () => {
  test("the card under the pointer gains width by flex-grow over ~700 ms, never by scale", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LAB);
    const items = page.locator("[data-grow-item]");
    const widths = () => items.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
    const before = await widths();
    expect(Math.max(...before) - Math.min(...before)).toBeLessThanOrEqual(1);
    const timing = await items.nth(1).evaluate((e) => {
      const cs = getComputedStyle(e);
      return { property: cs.transitionProperty, duration: cs.transitionDuration };
    });
    expect(timing).toEqual({ property: "flex-grow", duration: "0.7s" });
    await items.nth(1).hover();
    // Half way the card is still growing, and after the transition it holds 1.4 against 1
    await page.waitForTimeout(250);
    const mid = await widths();
    await page.waitForTimeout(800);
    const after = await widths();
    console.log(JSON.stringify({ before, mid, after }));
    expect(mid[1]).toBeGreaterThan(before[1] + 4);
    expect(mid[1]).toBeLessThan(after[1] - 1);
    expect(after[1] / after[0]).toBeGreaterThan(1.3);
    expect(after[1] / after[0]).toBeLessThan(1.5);
    expect(await items.nth(1).evaluate((e) => getComputedStyle(e).transform)).toBe("none");
  });
});

test.describe("brand opening", () => {
  for (const viewport of [
    // The relloo mark (its dark box, 640.92 of the 790.92 light box): v6 (2026-10-26), the motion compact, the stage as
    // wide as its box (480 px at 1440, 0.111 of the width; 343 px on a 390 phone, 0.294)
    { width: 1440, height: 900, min: 0.1, max: 0.12 },
    { width: 390, height: 844, min: 0.28, max: 0.31 },
  ])
    test(`on the canvas in every frame, no blur, the logo at its share unscaled, at ${viewport.width}`, async ({ page }) => {
      test.setTimeout(40_000);
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "load" });
      await page.waitForTimeout(800);
      const link = page.locator('#main-content a[href="/products/relloo"]:visible').first();
      await link.scrollIntoViewIfNeeded();
      await page.evaluate(() => {
        const w = window as unknown as { __frames: unknown[] };
        w.__frames = [];
        const tick = () => {
          const sheet = document.querySelector<HTMLElement>("[data-intro]");
          if (sheet) {
            // v4 (2026-10-24): the mark is the wrapper of the endorsed file in the choreography's stage
            const mark = sheet.querySelector<HTMLElement>("[data-intro-logo]")!;
            const img = mark.querySelector("img")!;
            const all = [sheet, ...sheet.querySelectorAll("*")];
            // Every box from the logo file up to the sheet: a transform anywhere on it would resample the logo
            const chain: Element[] = [];
            for (let el: Element | null = img; el && el !== sheet.parentElement; el = el.parentElement) chain.push(el);
            w.__frames.push({
              bg: getComputedStyle(sheet).backgroundColor,
              blur:
                all.filter((el) => /blur/.test(getComputedStyle(el).filter + getComputedStyle(el).backdropFilter))
                  .length + sheet.querySelectorAll("feGaussianBlur").length,
              shown: getComputedStyle(mark).visibility === "visible",
              ratio: mark.getBoundingClientRect().width / window.innerWidth,
              transform: [...new Set(chain.map((el) => getComputedStyle(el).transform))].join(" "),
              svg: /-light-endorsed\.svg$/.test(img.src),
            });
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await link.click();
      await page.waitForFunction(() => !document.querySelector("[data-intro]"), null, { timeout: 15_000 });
      await expect(page).toHaveURL(/\/products\/relloo$/);
      const frames = (await page.evaluate(() => (window as unknown as { __frames: unknown[] }).__frames)) as {
        bg: string;
        blur: number;
        shown: boolean;
        ratio: number;
        transform: string;
        svg: boolean;
      }[];
      // The logo as it shows (the scene plays before the wipe opens it)
      const ratios = frames.filter((f) => f.shown).map((f) => f.ratio);
      expect(ratios.length, "frames with the logo").toBeGreaterThan(10);
      console.log(`${viewport.width}: ${frames.length} frames, logo ${Math.min(...ratios).toFixed(3)}..${Math.max(...ratios).toFixed(3)} of the width`);
      expect(frames.length).toBeGreaterThan(30);
      expect(new Set(frames.map((f) => f.bg))).toEqual(new Set(["rgb(247, 247, 245)"]));
      expect(Math.max(...frames.map((f) => f.blur))).toBe(0);
      expect(new Set(frames.map((f) => f.transform))).toEqual(new Set(["none"]));
      expect(frames.every((f) => f.svg)).toBe(true);
      expect(Math.min(...ratios)).toBeGreaterThanOrEqual(viewport.min);
      expect(Math.max(...ratios)).toBeLessThanOrEqual(viewport.max);
      // One size the whole time it shows: no zoom, also not on the way to the page
      expect(Math.max(...ratios) - Math.min(...ratios)).toBeLessThan(0.001);
    });
});

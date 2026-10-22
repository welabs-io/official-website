// LINGUAGEM VISUAL BASE (V3, F2)
// The acceptance of the phase F2 of the v3 plan (control/portfolio/site-redesign/v3-plan/plano.md, sections 4.1 and 5),
// measured on the six routes at 1440 × 900 and 390 × 844, with the scenes in their settled frame:
// - no visible text under 12 px, and at most seven distinct sizes above 12 px (the closed scale);
// - the home has at least two variants of section head (`data-head`);
// - axe finds no color-contrast violation, stages, scenes and plays included;
// - the three planes: the floor is the cream, a card is white with no shadow at rest.
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const PATHS = [
  "/",
  "/products/domus",
  "/products/relloo",
  "/products/magneto",
  "/products/tuner",
  "/products/knowly",
];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
const AXE = path.resolve(__dirname, "../node_modules/axe-core/axe.min.js");

// The computed size of every visible text node of the page (sr-only and transparent text left out)
const textSizes = (page: Page) =>
  page.evaluate(() => {
    const sizes: number[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent?.trim()) continue;
      const el = n.parentElement;
      if (!el || el.closest("script, style, noscript")) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      if (![...range.getClientRects()].some((r) => r.width > 0.5 && r.height > 0.5))
        continue;
      let shown = getComputedStyle(el).visibility !== "hidden";
      for (let a: Element | null = el; a && shown; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (Number(s.opacity) < 0.05 || s.clipPath === "inset(50%)") shown = false;
      }
      if (shown) sizes.push(parseFloat(getComputedStyle(el).fontSize));
    }
    return sizes;
  });

for (const viewport of VIEWPORTS)
  test.describe(`visual language at ${viewport.width}`, () => {
    test.use({ viewport, contextOptions: { reducedMotion: "reduce" } });

    test("no text under 12 px and at most seven sizes above it, on every route", async ({
      page,
    }) => {
      test.setTimeout(60_000);
      const all = new Set<number>();
      for (const route of PATHS) {
        await page.goto(route, { waitUntil: "load" });
        const sizes = await textSizes(page);
        expect(sizes.length, route).toBeGreaterThan(50);
        expect(Math.min(...sizes), route).toBeGreaterThanOrEqual(12);
        for (const s of sizes) all.add(Math.round(s * 100) / 100);
      }
      const above = [...all].filter((s) => s > 12).sort((a, b) => a - b);
      console.log(`${viewport.width}: sizes above 12 px ${above.join(" ")}`);
      expect(above.length).toBeLessThanOrEqual(7);
    });

    test("the home has at least two variants of section head", async ({ page }) => {
      await page.goto("/", { waitUntil: "load" });
      const variants = await page
        .locator("[data-head]:visible")
        .evaluateAll((heads) => [...new Set(heads.map((h) => h.getAttribute("data-head")))]);
      expect(variants.length).toBeGreaterThanOrEqual(2);
    });

    for (const route of PATHS)
      test(`${route}: axe finds no color-contrast violation`, async ({ page }) => {
        await page.goto(route, { waitUntil: "load" });
        await page.addScriptTag({ path: AXE });
        const violations = await page.evaluate(async () => {
          type Result = { violations: { nodes: { target: string[] }[] }[] };
          const axe = (
            window as unknown as {
              axe: { run: (ctx: Document, opts: object) => Promise<Result> };
            }
          ).axe;
          const r = await axe.run(document, {
            runOnly: { type: "rule", values: ["color-contrast"] },
          });
          return r.violations.flatMap((v) =>
            v.nodes.map((n) => n.target.join(" ")),
          );
        });
        expect(violations).toEqual([]);
      });

    test("three planes: the cream floor, white cards with no shadow at rest", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "load" });
      const planes = await page.evaluate(() => {
        const cs = (sel: string) => getComputedStyle(document.querySelector(sel)!);
        // A module of the Domus: a white card with the sand hairline
        const card = cs("#domus ul li");
        return {
          floor: cs("#top").backgroundColor,
          header: cs("header").backgroundColor,
          card: card.backgroundColor,
          cardShadow: card.boxShadow,
        };
      });
      expect(planes.floor).toBe("rgb(250, 245, 234)");
      expect(planes.header).toBe("rgb(250, 245, 234)");
      expect(planes.card).toBe("rgb(255, 255, 255)");
      expect(planes.cardShadow).toBe("none");
    });
  });

// PROVA DO KIT DE CENAS NO LAB
// The continuity contract of the scene kit (components/scene-kit), measured on the lab page of the Relloo scene: it
// autoplays and loops, a click on a channel takes over and gives the scene back, reduced motion shows the settled frame
// with nothing running, and every icon sits on the axis of the text it labels (1 px).
import { expect, test } from "@playwright/test";
import {
  expectContinuousLoop,
  expectFinalFrameUnderReducedMotion,
} from "./helpers/continuity";

const LAB = "/lab/scenes/relloo-inbox";

test.describe("scene kit: relloo-inbox", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("autoplays, loops, and after a click plays, holds, resets and resumes", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(LAB);
    const scene = page.getByRole("figure", { name: /Relloo/ });
    await expectContinuousLoop(scene, {
      windowMs: 10_000,
      afterMs: 10_000,
      trigger: scene.getByRole("button", { name: /^E-mail/ }),
    });
  });

  test("reduced motion shows the final frame, static", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(LAB);
    const scene = page.getByRole("figure", { name: /Relloo/ });
    await expectFinalFrameUnderReducedMotion(page, scene);
    await expect(scene.locator("[data-scene]")).toHaveAttribute("data-step", "merged");
    await page.waitForTimeout(1500);
    await expect(scene.locator("[data-scene]")).toHaveAttribute("data-step", "merged");
  });

  for (const width of [1440, 390]) {
    test(`icons sit on the axis of their text at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(LAB);
      const off = await page.evaluate(() => {
        const live = document.querySelector('[data-scene="relloo-inbox"] > :last-child')!;
        const mid = (el: Element) => {
          const r = el.getBoundingClientRect();
          return r.top + r.height / 2;
        };
        const pairs: [string, Element, Element][] = [];
        // A history line is the lib's TimelineItem: its marker (first column) against its title row (second column)
        live.querySelectorAll('[data-slot="timeline"] > li').forEach((e, i) =>
          pairs.push([`entry ${i}`, e.children[0].children[0], e.children[1].children[0]]),
        );
        // The record header and the system event line (Welabs UI v3: a meta line with its icon, no mark)
        live.querySelectorAll('[data-align="record"], [data-align="event"]').forEach((e) =>
          pairs.push([e.getAttribute("data-align")!, e.children[0], e.children[1]]),
        );
        live.querySelectorAll("[data-channel]").forEach((e) => {
          if ((e as HTMLElement).offsetParent === null || getComputedStyle(e).visibility === "hidden") return;
          pairs.push([`row ${e.getAttribute("data-channel")}`, e.children[0], e.children[1]]);
        });
        return pairs.map(([name, icon, text]) => ({ name, dy: Math.abs(mid(icon) - mid(text)) }));
      });
      expect(off.length).toBeGreaterThan(5);
      for (const { name, dy } of off) expect(dy, name).toBeLessThanOrEqual(1);
    });

    // RODADA 2: ALTURA, ORÇAMENTO DE ÂMBAR E CONECTOR
    // Over one loop (9.3 s), sampled on every animation frame: the window keeps one height (1 px), no frame shows more
    // than 3 pieces of amber (#ffb020 or a blend more than half way to it, as a fill), and at 1440 every arrival draws
    // the hand-off trace from its row to its history line while the settled frame draws none
    test(`one height, at most 3 amber pieces and the hand-off trace over a loop at ${width}`, async ({ page }) => {
      test.setTimeout(40_000);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(LAB);
      await page.getByRole("figure", { name: /Relloo/ }).scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: "Recomeçar" }).click();
      const seen = await page.evaluate(async () => {
        const figure = document.querySelector('[role="figure"]')!;
        const stage = figure.querySelector("[data-scene]")!;
        const live = stage.lastElementChild!;
        const amber = (c: string) => {
          const m = c.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?/);
          if (!m) return false;
          const [r, g, b] = m.slice(1, 4).map(Number);
          const a = m[4] === undefined ? 1 : Number(m[4]);
          return a > 0.5 && r > 230 && g > 140 && g < 210 && b < 140;
        };
        const heights = new Set<number>();
        const ambers: Record<string, number> = {};
        const traced: Record<string, boolean> = {};
        const t0 = performance.now();
        while (performance.now() - t0 < 9500) {
          await new Promise((r) => requestAnimationFrame(r));
          const step = stage.getAttribute("data-step")!;
          heights.add(Math.round(figure.getBoundingClientRect().height));
          const n = [...live.querySelectorAll("*")].filter((el) => {
            const cs = getComputedStyle(el);
            return el.getBoundingClientRect().width > 0 && Number(cs.opacity) > 0.05 && amber(cs.backgroundColor);
          }).length;
          ambers[step] = Math.max(ambers[step] ?? 0, n);
          traced[step] = traced[step] || !!live.querySelector("svg path[pathLength]");
        }
        return { heights: [...heights], ambers, traced };
      });
      expect(Math.max(...seen.heights) - Math.min(...seen.heights), seen.heights.join(",")).toBeLessThanOrEqual(1);
      for (const [step, n] of Object.entries(seen.ambers)) expect(n, `amber pieces at ${step}`).toBeLessThanOrEqual(3);
      expect(seen.ambers.merged, "the settled frame keeps only the live status dot").toBe(1);
      if (width === 1440) {
        for (const step of ["message", "email", "voice", "typing", "site"])
          expect(seen.traced[step], `hand-off trace at ${step}`).toBe(true);
      }
      expect(seen.traced.merged ?? false, "no trace on the settled frame").toBe(false);
    });
  }
});

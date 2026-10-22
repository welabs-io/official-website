// PROVA DAS CENAS DO KIT NO LAB
// The pattern of e2e/scene-kit.spec.ts (the Relloo scene) applied to every other kit scene, one entry per scene: it
// autoplays and loops, a click on its control takes over and gives the scene back, reduced motion shows the settled
// frame with nothing running, every icon sits on the axis of the text it labels (1 px, the `data-axis` pairs: first
// child the mark, second the text; not `data-align`, which the lib's InputGroupAddon writes), no text is cut, and the
// window keeps one height over the loop (1 px).
import { expect, test, type Page } from "@playwright/test";
import {
  expectContinuousLoop,
  expectFinalFrameUnderReducedMotion,
} from "./helpers/continuity";

type Entry = {
  id: string;
  // Accessible name of the window (the scene's label)
  figure: RegExp;
  // Accessible name of the control a visitor clicks
  trigger: RegExp;
  // The settled step
  final: string;
  // Least number of icon/text pairs measured at 1440 and at 390
  pairs: number;
  // Length of one loop, in ms (the sum of the holds)
  cycleMs: number;
};

const SCENES: Entry[] = [
  {
    id: "domus-modules",
    figure: /^Domus/,
    trigger: /^Novo módulo/,
    final: "saved",
    pairs: 18,
    cycleMs: 6000,
  },
];

// The icon/text pairs of the live layer whose centres are off by more than 1 px, and how many were measured
async function axisOffsets(page: Page, id: string) {
  return page.evaluate((sceneId) => {
    const live = document.querySelector(`[data-scene="${sceneId}"] > :last-child`)!;
    const mid = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    };
    const out: { name: string; dy: number }[] = [];
    live.querySelectorAll("[data-axis]").forEach((e, i) => {
      const el = e as HTMLElement;
      if (el.offsetParent === null || getComputedStyle(el).visibility === "hidden") return;
      out.push({
        name: `${el.dataset.axis} ${i}`,
        dy: Math.abs(mid(e.children[0]) - mid(e.children[1])),
      });
    });
    return out;
  }, id);
}

// Elements of the live layer whose text overflows their box (cut by an ellipsis or a hidden overflow)
async function cutTexts(page: Page, id: string) {
  return page.evaluate((sceneId) => {
    const live = document.querySelector(`[data-scene="${sceneId}"] > :last-child`)!;
    const cut: string[] = [];
    live.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (!el.childNodes.length || el.offsetParent === null) return;
      const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      const isInput = el instanceof HTMLInputElement && el.value;
      if (!ownText && !isInput) return;
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
        cut.push(`${el.tagName.toLowerCase()} "${(el.textContent || (el as HTMLInputElement).value).trim().slice(0, 40)}"`);
    });
    return cut;
  }, id);
}

for (const s of SCENES) {
  const LAB = `/lab/scenes/${s.id}`;

  test.describe(`scene kit: ${s.id}`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("autoplays, loops, and after a click plays, holds, resets and resumes", async ({ page }) => {
      test.setTimeout(60_000);
      await page.goto(LAB);
      const scene = page.getByRole("figure", { name: s.figure });
      await expectContinuousLoop(scene, {
        windowMs: 10_000,
        afterMs: 10_000,
        trigger: scene.getByRole("button", { name: s.trigger }),
      });
    });

    test("reduced motion shows the final frame, static", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(LAB);
      const scene = page.getByRole("figure", { name: s.figure });
      await expectFinalFrameUnderReducedMotion(page, scene);
      await expect(scene.locator("[data-scene]")).toHaveAttribute("data-step", s.final);
      await page.waitForTimeout(1500);
      await expect(scene.locator("[data-scene]")).toHaveAttribute("data-step", s.final);
    });

    for (const width of [1440, 390]) {
      test(`icons on the axis of their text, no text cut, at ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(LAB);
        await page.getByRole("figure", { name: s.figure }).waitFor();
        const off = await axisOffsets(page, s.id);
        expect(off.length).toBeGreaterThanOrEqual(s.pairs);
        for (const { name, dy } of off) expect(dy, name).toBeLessThanOrEqual(1);
        expect(await cutTexts(page, s.id)).toEqual([]);
      });

      test(`one window height over the loop at ${width}`, async ({ page }) => {
        test.setTimeout(40_000);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(LAB);
        const scene = page.getByRole("figure", { name: s.figure });
        await scene.scrollIntoViewIfNeeded();
        const heights = new Set<number>();
        const end = Date.now() + s.cycleMs + 1500;
        while (Date.now() < end) {
          const box = await scene.boundingBox();
          heights.add(Math.round(box!.height));
          await page.waitForTimeout(80);
        }
        const all = [...heights];
        expect(Math.max(...all) - Math.min(...all), all.join(",")).toBeLessThanOrEqual(1);
      });
    }
  });
}

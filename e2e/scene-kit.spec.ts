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
  }
});

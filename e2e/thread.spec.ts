// FIO NO EIXO CENTRAL
// Acceptance of the thread unit, at the three sizes: the hairline and the dock of every band sit on the centre axis
// (x = innerWidth / 2, 1 px of tolerance), the page has no horizontal scroll, and no animation runs off screen.
import { expect, test } from "@playwright/test";
import { ROUTES, VIEWPORTS } from "./viewports";

for (const route of ROUTES)
  for (const vp of VIEWPORTS)
    test.describe(`${route.name} at ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test("the thread and the docks are on the axis", async ({ page }) => {
        await page.goto(route.path, { waitUntil: "load" });
        const result = await page.evaluate(() => {
          const axis = window.innerWidth / 2;
          const centre = (band: Element, pseudo: "::before" | "::after") => {
            const style = getComputedStyle(band, pseudo);
            const box = band.getBoundingClientRect();
            return (
              box.left +
              parseFloat(style.left) +
              parseFloat(style.marginLeft) +
              parseFloat(style.width) / 2
            );
          };
          // Only the bands that are laid out: on a product route the tail of the home is display:none while the product
          // is open (descent.module.css), so its bands have no box
          return [...document.querySelectorAll("section[data-live]")]
            .filter((band) => band.getClientRects().length > 0)
            .map((band) => ({
              id: band.id,
              thread: (band as HTMLElement).dataset.thread,
              hairline: centre(band, "::before"),
              dock: centre(band, "::after"),
              axis,
            }));
        });
        expect(result.length).toBeGreaterThanOrEqual(4);
        for (const band of result) {
          // The closing has no dock on its top edge: its docks sit on the strip (see closing.spec.ts)
          if (band.thread !== "none")
            expect(
              Math.abs(band.dock - band.axis),
              `${band.id} dock`,
            ).toBeLessThanOrEqual(1);
          if (band.thread === "on")
            expect(
              Math.abs(band.hairline - band.axis),
              `${band.id} hairline`,
            ).toBeLessThanOrEqual(1);
        }
      });

      test("no horizontal scroll", async ({ page }) => {
        await page.goto(route.path, { waitUntil: "load" });
        const { scroll, width } = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          width: window.innerWidth,
        }));
        expect(scroll).toBe(width);
      });

      test("nothing animates off screen", async ({ page }) => {
        await page.goto(route.path, { waitUntil: "load" });
        await page.waitForTimeout(1500);
        const offscreen = await page.evaluate(() =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running")
            .filter((animation) => {
              const target = (animation.effect as KeyframeEffect | null)
                ?.target;
              if (!target) return false;
              // Judged by the live block that owns the animation (the one LiveObserver watches), not by the
              // element: a pulse can sit below the fold inside a block that is partly on screen
              const owner = target.closest("[data-live]") ?? target;
              const box = owner.getBoundingClientRect();
              return box.bottom < 0 || box.top > window.innerHeight;
            })
            .map(
              (animation) =>
                (animation as CSSAnimation).animationName ?? "transition",
            ),
        );
        expect(offscreen).toEqual([]);
      });
    });

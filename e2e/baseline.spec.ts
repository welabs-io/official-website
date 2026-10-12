// CAPTURA DE REFERÊNCIA
// Full-page screenshots of the home and of one product page at the three sizes, under reduced motion so the covers are
// static and the result is deterministic. First run (or --update-snapshots) writes the reference; later runs compare
// against it with a 0.5% pixel budget.
import { expect, test } from "@playwright/test";
import { ROUTES, VIEWPORTS } from "./viewports";

test.use({ contextOptions: { reducedMotion: "reduce" } });

for (const route of ROUTES)
  for (const vp of VIEWPORTS)
    test(`${route.name} at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route.path, { waitUntil: "load" });
      // Let lazy covers settle before the capture
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
        }
        window.scrollTo(0, 0);
      });
      // Every image that is drawn must be decoded, or the capture races the lazy loading (images of hidden tiles are
      // never loaded, so they do not count)
      await page.evaluate(() => {
        for (const img of document.images) img.loading = "eager";
      });
      await page.waitForFunction(
        () =>
          [...document.images]
            .filter((img) => img.offsetParent !== null)
            .every((img) => img.complete),
        undefined,
        { timeout: 15000 },
      );
      await page.waitForTimeout(600);
      await expect(page).toHaveScreenshot(`${route.name}-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.005,
        animations: "disabled",
      });
    });

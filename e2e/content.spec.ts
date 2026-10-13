// CAMADA DE CONTEÚDO
// Acceptance of the content layer: the caption and the lit name under the opening of a product page change together
// with the capability scene (rewritten on every `ring:swap` of the stage, before the event), the home lights the card of
// the active product, and no page scrolls sideways at 375 px. The caption test runs without reduced motion and waits for
// real swaps.
import { expect, test } from "@playwright/test";
import { capabilityOf, capabilityScenes } from "../lib/scenes/capabilities";
import { VIEWPORTS } from "./viewports";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;

for (const vp of VIEWPORTS.filter((v) => v.name !== "1024"))
  test(`the live caption changes with the scene at ${vp.name}`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.addInitScript(() => {
      const w = window as unknown as {
        __caption: { to: number; text: string }[];
      };
      w.__caption = [];
      window.addEventListener("ring:swap", (event) => {
        const detail = (event as CustomEvent).detail;
        if (detail.ring !== "product-scenes") return;
        // The caption and the lit name are written in the same task as the event, before it
        const text = document.querySelector("[data-caption]")!.textContent!;
        const on = document.querySelector('[data-cap][data-on="true"]');
        w.__caption.push({
          to: detail.to,
          text: `${on?.getAttribute("data-cap")}|${text}`,
        });
      });
    });
    await page.goto("/products/domus", { waitUntil: "load" });
    const caption = page.locator("#product-scenes [data-caption]");
    // Plain text: a carousel that changes by itself is not a live region
    await expect(caption).not.toHaveAttribute("aria-live", /.*/);
    const captions = capabilityScenes("domus").map(
      (scene) => capabilityOf(scene).detail,
    );
    await expect(caption).toHaveText(captions[0]);
    // Two swaps: the first scene to the second, then to the third
    await page.waitForFunction(
      () =>
        (window as unknown as { __caption: unknown[] }).__caption.length >= 2,
      undefined,
      { timeout: 100000 },
    );
    const seen = await page.evaluate(
      () =>
        (window as unknown as { __caption: { to: number; text: string }[] })
          .__caption,
    );
    for (const { to, text } of seen) expect(text).toBe(`${to}|${captions[to]}`);
    expect(new Set(seen.map((s) => s.text)).size).toBeGreaterThan(1);
  });

test("the card of the active product is lit on the home and follows the ring", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "load" });
  const lit = page.locator('[data-card][data-on="true"]');
  await expect(lit).toHaveCount(1);
  await expect(lit).toHaveAttribute("data-card", "domus");
  await page.locator("#products").scrollIntoViewIfNeeded();
  // The products ring swaps after the opening and film of the first product
  await expect(lit).not.toHaveAttribute("data-card", "domus", {
    timeout: 100000,
  });
  await expect(lit).toHaveCount(1);
});

for (const path of ["/", ...SLUGS.map((s) => `/products/${s}`)])
  test(`no horizontal scroll at 375 px on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(path, { waitUntil: "load" });
    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      inner: window.innerWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
    expect(widths.body).toBeLessThanOrEqual(widths.inner);
    // The page clips sideways overflow, so also check that no block of text leaves the window (the carousels and the
    // rings are regions that clip their own content on purpose)
    const outside = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("h1, h2, li, p, a")]
        .filter((el) => !el.closest('[role="region"]'))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > innerWidth + 0.5 || r.left < -0.5);
        })
        .map((el) => `${el.tagName}.${el.className}`),
    );
    expect(outside).toEqual([]);
  });

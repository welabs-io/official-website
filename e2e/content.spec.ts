// CAMADA DE CONTEÚDO
// Acceptance of the content layer: the live caption of the product page changes together with the scene (it is rewritten
// on every `ring:swap` of the film ring), the home lights the card of the active product, and no page scrolls
// sideways at 375 px. The caption test needs the player, so it runs without reduced motion and waits for real swaps.
import { expect, test } from "@playwright/test";
import { PRODUCT_CONTENT } from "../lib/content/products";
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
        if (detail.ring !== "product-ring") return;
        // The caption is written in the same task as the event, before it
        const text = document.querySelector("[data-caption]")!.textContent!;
        w.__caption.push({ to: detail.to, text });
      });
    });
    await page.goto("/products/domus", { waitUntil: "load" });
    // The films are under the opening (the native scene) now, and the ring plays only while it is on screen
    await page.locator("#product-ring").scrollIntoViewIfNeeded();
    const caption = page.locator("[data-caption]");
    // Plain text: a carousel that changes by itself is not a live region
    await expect(caption).not.toHaveAttribute("aria-live", /.*/);
    const captions = PRODUCT_CONTENT.domus.filmCaptions;
    await expect(caption).toHaveText(captions[0]);
    // Two swaps: opening and main film to the support film, and back
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
    for (const { to, text } of seen) expect(text).toBe(captions[to]);
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

// CAMADA DE CONTEÚDO
// No page scrolls sideways at 375 px, and no block of text leaves the window (the carousels and the stages are regions
// that clip their own content on purpose, and so is the sideways strip of the outcomes).
import { expect, test } from "@playwright/test";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;

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
    const outside = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("h1, h2, li, p, a")]
        // v2.2: the product selector is a strip that scrolls sideways on a phone too (audit M06)
        .filter(
          (el) =>
            !el.closest('[role="region"], #operation ul, [data-switch] ul'),
        )
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > innerWidth + 0.5 || r.left < -0.5);
        })
        .map((el) => `${el.tagName}.${el.className}`),
    );
    expect(outside).toEqual([]);
  });

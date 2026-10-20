// MENU DO CELULAR
// v2.2 (audit A04, B02): on a phone the panel must show the five products every time it opens (measured on 8187680:
// opacity 0 and visibility hidden in 5 of 5 openings), and the page behind it must not scroll while it is open.
import { expect, test } from "@playwright/test";

const PRODUCTS = ["Domus", "Relloo", "Magneto", "Tuner", "Knowly"];

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  for (const path of ["/", "/products/magneto"]) {
    test(`the five products are visible in 5 of 5 openings (${path})`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "load" });
      const button = page.locator('button[aria-controls="site-nav"]');
      let visibleOpenings = 0;
      for (let round = 0; round < 5; round++) {
        await button.click();
        await expect(button).toHaveAttribute("aria-expanded", "true");
        for (const wait of [100, 400]) {
          await page.waitForTimeout(wait);
          const seen = await page.evaluate((names) => {
            const nav = document.getElementById("site-nav")!;
            return names.filter((name) => {
              const img = nav.querySelector<HTMLImageElement>(
                `img[alt="${name}"]`,
              );
              if (!img) return false;
              const r = img.getBoundingClientRect();
              let ok = r.width > 0 && r.height > 0 && r.top < innerHeight;
              for (let n: Element | null = img; n; n = n.parentElement) {
                const cs = getComputedStyle(n);
                if (cs.visibility === "hidden" || Number(cs.opacity) < 0.99)
                  ok = false;
              }
              return ok;
            });
          }, PRODUCTS);
          expect(seen, `opening ${round + 1} at +${wait} ms`).toEqual(PRODUCTS);
        }
        // The page behind the open panel does not scroll
        const locked = await page.evaluate(
          () => getComputedStyle(document.documentElement).overflow,
        );
        expect(locked).toBe("hidden");
        visibleOpenings++;
        await button.click();
        await expect(button).toHaveAttribute("aria-expanded", "false");
      }
      console.log(`${path}: products visible in ${visibleOpenings} of 5`);
      expect(visibleOpenings).toBe(5);
      // Closed again, the page scrolls as before
      expect(
        await page.evaluate(
          () => getComputedStyle(document.documentElement).overflow,
        ),
      ).not.toBe("hidden");
    });
  }
});

// ABERTURA DE PRODUTO EM UM SÓ LEIAUTE
// v2.2 (audit M05, M06, M10). Measured on 8187680: the Domus opened in two columns and the four others in a pile, with
// the scene starting at y=456 (0.96 of it in a 1440 × 900 window) and the right of the text empty; 98 px empty between
// the header and the selector; on a phone the five logos broke 3 + 2, the Tuner lower and smaller; on the Domus page
// "Produtos" and "Domus" both active. Acceptance, on a direct visit to each product:
//  - 1440 and 1024: text on the left and the screen on the right, the same columns on the five, the whole screen above
//    the fold; at most 40 px between the header and the selector;
//  - 375: the screen right after the sentence and the button, the five logos on one row;
//  - one current entry in the header: "Domus" on the Domus page, "Produtos" on the four others.
import { expect, test, type Page } from "@playwright/test";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;

const geometry = (page: Page) =>
  page.evaluate(() => {
    const product = document.querySelector("[data-descent-slot] #product")!;
    const text = product.querySelector("h1")!.parentElement!.parentElement!;
    const screen = product.querySelector(
      "[data-mini], [data-ring], #product-scenes",
    )!;
    const sw = product.querySelector("[data-switch]")!;
    const header = document.querySelector("header")!.getBoundingClientRect();
    const t = text.getBoundingClientRect();
    const s = screen.getBoundingClientRect();
    const logos = [...sw.querySelectorAll("li")].map((li) =>
      Math.round(li.getBoundingClientRect().top),
    );
    return {
      textLeft: Math.round(t.left),
      textRight: Math.round(t.right),
      textBottom: Math.round(t.bottom),
      screenLeft: Math.round(s.left),
      screenTop: Math.round(s.top),
      screenBottom: Math.round(s.bottom),
      gap: Math.round(sw.getBoundingClientRect().top - header.bottom),
      logoRows: new Set(logos).size,
      vh: innerHeight,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });

for (const width of [1440, 1024])
  test(`one layout at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const lefts: number[] = [];
    for (const slug of SLUGS) {
      await page.goto(`/products/${slug}`, { waitUntil: "load" });
      await page.waitForTimeout(500);
      const g = await geometry(page);
      console.log(`${width} ${slug}: ${JSON.stringify(g)}`);
      lefts.push(g.screenLeft);
      expect(g.textLeft).toBe(width === 1440 ? 120 : 24);
      expect(g.screenLeft, "screen right of the text").toBeGreaterThan(
        g.textRight,
      );
      expect(g.screenBottom, "screen above the fold").toBeLessThanOrEqual(g.vh);
      expect(g.gap, "header to selector").toBeLessThanOrEqual(40);
    }
    // The same columns on the five (the Domus screen sits in a 1 px border)
    expect(
      Math.max(...lefts) - Math.min(...lefts),
      "the same columns on the five",
    ).toBeLessThanOrEqual(2);
  });

test("on a phone the screen follows the sentence and the selector is one row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const slug of SLUGS) {
    await page.goto(`/products/${slug}`, { waitUntil: "load" });
    await page.waitForTimeout(500);
    const g = await geometry(page);
    console.log(`375 ${slug}: ${JSON.stringify(g)}`);
    expect(g.logoRows).toBe(1);
    // The logo of the page is wholly in view in the row (the row scrolls it to its middle)
    await page.waitForTimeout(300);
    const inView = await page.evaluate(() => {
      const ul = document.querySelector(
        "[data-descent-slot] [data-switch] ul",
      )!;
      const cur = ul.querySelector("[aria-current]")!.getBoundingClientRect();
      const row = ul.getBoundingClientRect();
      return cur.left >= row.left - 1 && cur.right <= row.right + 1;
    });
    expect(inView, `${slug} logo in view`).toBe(true);
    expect(g.screenTop).toBeGreaterThanOrEqual(g.textBottom);
    expect(g.screenTop - g.textBottom).toBeLessThanOrEqual(48);
    expect(g.overflow).toBeLessThanOrEqual(0);
  }
});

test("one current entry in the header", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const slug of SLUGS) {
    await page.goto(`/products/${slug}`, { waitUntil: "load" });
    const current = await page
      .locator("header nav > ul > li > a[aria-current]")
      .allTextContents();
    expect(current, slug).toEqual([slug === "domus" ? "Domus" : "Produtos"]);
  }
});

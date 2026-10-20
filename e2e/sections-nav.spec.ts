// CAMINHO DE VOLTA E ÂNCORAS DAS SEÇÕES
// What a visitor uses to get around: the menu entry "Produtos" lands on the five cards and the button of the header on the
// contact, both under the fixed header; every product opens with the selector of the five products (v2.1: in place of
// the door "Próximo produto" at its end), whose logos lead to the other products through their brand openings; and the
// logo of the header leads home from any page.
import { expect, test } from "@playwright/test";

test.setTimeout(45000);

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;
const NAMES = {
  domus: "Domus",
  relloo: "Relloo",
  magneto: "Magneto",
  tuner: "Tuner",
  knowly: "Knowly",
} as const;

test("'Produtos' and the button land on their sections of the home under the header", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/domus", { waitUntil: "load" });
  const nav = page.getByRole("navigation", { name: "Principal" });
  await nav.getByRole("link", { name: "Produtos" }).click();
  await page.waitForURL(
    (url) => url.pathname === "/" && url.hash === "#products",
  );
  await page.waitForTimeout(700);
  await expect(page.locator("#products h2")).toBeInViewport();
  await expect(page.locator("#products [data-card]")).toHaveCount(5);
  await page.locator("header > div > a[href='/#contact']").click();
  await page.waitForURL((url) => url.hash === "#contact");
  await page.waitForTimeout(400);
  const top = await page.evaluate(() => ({
    title: document.querySelector("#contact h2")!.getBoundingClientRect().top,
    header: document.querySelector("header")!.getBoundingClientRect().bottom,
  }));
  expect(top.title).toBeGreaterThanOrEqual(top.header);
  await expect(page.locator("#contact h2")).toBeInViewport();
});

for (const [i, slug] of SLUGS.entries())
  test(`the ${slug} page has ${NAMES[slug]} as the product in the slot, the selector of the five products at its top and the logo to the home`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/products/${slug}`, { waitUntil: "load" });
    // v2.1: no door at the end, no list of the others; the selector at the top names the five, this one current
    await expect(page.locator("[data-descent-slot] #next")).toHaveCount(0);
    await expect(page.locator("[data-descent-slot] [data-door]")).toHaveCount(0);
    await expect(page.locator("#product h1 img")).toHaveAttribute(
      "alt",
      new RegExp(NAMES[slug]),
    );
    const selector = page.getByRole("navigation", { name: "Os cinco produtos" });
    await expect(selector.getByRole("link")).toHaveCount(5);
    await expect(selector.locator('[aria-current="page"]')).toHaveAttribute(
      "href",
      `/products/${slug}`,
    );
    // Its logo leads to another product, through the brand opening of that product
    const target = SLUGS[(i + 1) % SLUGS.length];
    await selector.getByRole("link", { name: NAMES[target] }).click();
    await expect(page.locator(`[data-intro="${target}"]`)).toHaveCount(1);
    await page.waitForURL(`**/products/${target}`);
    await page.waitForFunction(
      () => !document.querySelector("[data-intro]") && !document.querySelector("body > img"),
      undefined,
      { timeout: 12000 },
    );
    // The next product opens at the top of the slot, under the fixed header
    const g = await page.evaluate(() => ({
      slot: document
        .querySelector("[data-descent-slot]")!
        .getBoundingClientRect().top,
      h1Top: document.querySelector("#product h1")!.getBoundingClientRect().top,
      headerBottom: document.querySelector("header")!.getBoundingClientRect()
        .bottom,
    }));
    expect(Math.abs(g.slot)).toBeLessThanOrEqual(2);
    expect(g.h1Top).toBeGreaterThanOrEqual(g.headerBottom);
    // The logo of the header leads to the home
    await page.getByRole("link", { name: "Welabs, início" }).click();
    await page.waitForURL((url) => url.pathname === "/");
    await expect(page.locator("#message")).toBeVisible();
  });

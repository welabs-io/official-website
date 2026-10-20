// CAMINHO DE VOLTA E ÂNCORAS DAS SEÇÕES
// What a visitor uses to get around: the menu entry "Produtos" lands on the five cards and the button of the header on the
// contact, both under the fixed header; every product ends on the door to the next product (the way back is up the page,
// there is no switcher since the descent of PR #27), and the logo of the header leads home from any page.
import { expect, test } from "@playwright/test";

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
  test(`the ${slug} page has ${NAMES[slug]} as the product in the slot, the door "Próximo" to the next one at the end and the logo to the home`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/products/${slug}`, { waitUntil: "load" });
    // The descent model (PR #27): no product switcher and no list of the others
    await expect(
      page.getByRole("navigation", { name: "Trocar de produto" }),
    ).toHaveCount(0);
    await expect(page.locator("#others")).toHaveCount(0);
    await expect(page.locator("#product h1 img")).toHaveAttribute(
      "alt",
      new RegExp(NAMES[slug]),
    );
    // The door leads to the next product of the list (the last leads back to the first)
    const target = SLUGS[(i + 1) % SLUGS.length];
    const door = page.locator("[data-descent-slot] #next a[data-door]");
    await door.scrollIntoViewIfNeeded();
    await expect(door).toHaveAttribute("data-door", target);
    await expect(door).toHaveAttribute("href", `/products/${target}`);
    await expect(door).toContainText("Próximo");
    await door.click();
    await page.waitForURL(`**/products/${target}`);
    await page.waitForTimeout(1600);
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
    await expect(page.locator("#chain")).toBeVisible();
  });

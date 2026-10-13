// CAMINHO DE VOLTA E ÂNCORAS DAS SEÇÕES
// What a visitor uses to get around once the pages are long: the menu entry "Como funciona" lands on the order from start
// to end right under the fixed header, every product page has the trail "Welabs / <product>" at the top and "Outros
// produtos" at the end, and the logo of the header leads home from any page.
import { expect, test } from "@playwright/test";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;
const NAMES = {
  domus: "Domus",
  relloo: "Relloo",
  magneto: "Magneto",
  tuner: "Tuner",
  knowly: "Knowly",
} as const;

test("'Como funciona' and 'Contato' land on their sections under the header", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/domus", { waitUntil: "load" });
  const nav = page.getByRole("navigation", { name: "Principal" });
  await nav.getByRole("link", { name: "Como funciona" }).click();
  await page.waitForURL((url) => url.pathname === "/" && url.hash === "#how");
  await page.waitForTimeout(700);
  const top = await page.evaluate(() => ({
    section: document.querySelector("#how")!.getBoundingClientRect().top,
    header: document.querySelector("header")!.getBoundingClientRect().bottom,
  }));
  expect(top.section).toBeGreaterThanOrEqual(top.header - 2);
  expect(top.section).toBeLessThan(top.header + 40);
  await expect(page.locator("#how h2")).toHaveText(
    "Um pedido, do começo ao fim",
  );
  await expect(page.locator("#how li")).toHaveCount(7);
  await nav.getByRole("link", { name: "Contato" }).click();
  await page.waitForURL((url) => url.hash === "#contact");
  await expect(page.locator("#contact h2")).toBeInViewport();
});

for (const slug of SLUGS)
  test(`the ${slug} page has the trail "Welabs / ${NAMES[slug]}", the logo to the home and the other four products at the end`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/products/${slug}`, { waitUntil: "load" });
    const trail = page.getByRole("navigation", { name: "Você está em" });
    await expect(trail.getByRole("link", { name: "Welabs" })).toBeVisible();
    await expect(trail.locator('[aria-current="page"]')).toHaveText(
      NAMES[slug],
    );
    const others = page.locator("#others");
    await others.scrollIntoViewIfNeeded();
    await expect(others.locator("a[data-card]")).toHaveCount(4);
    await expect(others.locator(`a[href="/products/${slug}"]`)).toHaveCount(0);
    // One of them leads to another page, which opens at its top
    const target = SLUGS.find((s) => s !== slug)!;
    await others.locator(`a[href="/products/${target}"]`).click();
    await page.waitForURL(`**/products/${target}`);
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => Math.round(scrollY))).toBe(0);
    // The logo of the header leads to the home
    await page.getByRole("link", { name: "Welabs, início" }).click();
    await page.waitForURL((url) => url.pathname === "/");
    await expect(page.locator("#chain")).toBeVisible();
  });

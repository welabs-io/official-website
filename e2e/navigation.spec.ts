// NAVEGAÇÃO ENTRE A HOME E OS PRODUTOS
// The operator's report of 2026-10-12: "when I click a product the page eats the first block and there is no way back".
// Measured cause: `html { scroll-behavior: smooth }` made Next 16 reach the new route by a 0.5 s scroll through its own body,
// and made the browser's restoration on back and forward an animation too (the page has no smooth scroll now). These specs
// pin what the visitor must get: the top
// of the product page in view, never under the fixed header and never crossed by a scroll; the browser's back button
// returning to the card that was clicked; and a menu with the five products, "Como funciona" and "Contato" (a drop-down
// list on a desktop, a panel on a phone). The trail, the logo and "Outros produtos" are in sections-nav.spec.ts.
import { expect, test, type Page } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;

// Records scrollY on every frame (it survives the client navigation, which keeps the document)
const sample = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __y: [string, number][] };
    w.__y = [];
    const tick = () => {
      w.__y.push([location.pathname, Math.round(scrollY)]);
      requestAnimationFrame(tick);
    };
    tick();
  });

const heroGeometry = (page: Page) =>
  page.evaluate(() => {
    const header = document.querySelector("header")!.getBoundingClientRect();
    const h1 = document.querySelector("h1")!.getBoundingClientRect();
    return {
      y: Math.round(scrollY),
      headerBottom: header.bottom,
      h1Top: h1.top,
      h1Bottom: h1.bottom,
      vh: innerHeight,
    };
  });

for (const vp of VIEWPORTS.filter((v) => v.name !== "1024")) {
  test(`a click on a product card lands on the visible top of its page, with no scroll through it, at ${vp.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/", { waitUntil: "load" });
    const card = page.locator('a[data-card="relloo"]');
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await sample(page);
    await card.click();
    await page.waitForURL("**/products/relloo");
    await page.waitForTimeout(900);
    // Every frame on the product page is at the top: nothing animated the page through its body
    const frames = await page.evaluate(
      () => (window as unknown as { __y: [string, number][] }).__y,
    );
    const onProduct = frames.filter(([path]) => path === "/products/relloo");
    expect(onProduct.length).toBeGreaterThan(5);
    expect(onProduct.filter(([, y]) => y > 2)).toEqual([]);
    // The logo (the h1) is in view and below the fixed header, not hidden under it
    const g = await heroGeometry(page);
    expect(g.y).toBe(0);
    expect(g.h1Top).toBeGreaterThanOrEqual(g.headerBottom);
    expect(g.h1Bottom).toBeLessThanOrEqual(g.vh);
  });

  test(`the browser's back button returns to the position the visitor left at ${vp.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/", { waitUntil: "load" });
    const card = page.locator('a[data-card="tuner"]');
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const before = await page.evaluate(() => Math.round(scrollY));
    expect(before).toBeGreaterThan(300);
    await card.click();
    await page.waitForURL("**/products/tuner");
    await page.waitForTimeout(700);
    await page.goBack();
    await page.waitForURL((url) => url.pathname === "/");
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => Math.round(scrollY));
    expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
    // And forward again shows the opening of the product page (the browser restores where the visitor was on it)
    await page.goForward();
    await page.waitForURL("**/products/tuner");
    await page.waitForTimeout(700);
    const g = await heroGeometry(page);
    expect(g.y).toBeLessThan(40);
    expect(g.h1Bottom).toBeGreaterThan(g.headerBottom);
  });
}

test("the desktop menu lists the five products, Como funciona and Contato, and each leads where it says", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "load" });
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Produtos" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Como funciona" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Contato" })).toBeVisible();
  // The list of products opens on hover and on keyboard focus
  await nav.getByRole("link", { name: "Produtos" }).hover();
  for (const slug of SLUGS)
    await expect(nav.locator(`a[href="/products/${slug}"]`)).toBeVisible();
  await nav.locator('a[href="/products/magneto"]').click();
  await page.waitForURL("**/products/magneto");
  await expect(page.locator("h1 img")).toHaveAttribute("alt", /Magneto/);
  // "Contato" leads to the closing of the home
  await nav.getByRole("link", { name: "Contato" }).click();
  await page.waitForURL(
    (url) => url.pathname === "/" && url.hash === "#contact",
  );
  await expect(page.locator("#contact a")).toBeInViewport();
});

test("on a phone the menu is a panel with the same entries; it closes on Escape and on a link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/", { waitUntil: "load" });
  const button = page.getByRole("button", { name: "Abrir o menu" });
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav).toBeHidden();
  await button.click();
  await expect(
    page.getByRole("button", { name: "Fechar o menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  for (const slug of SLUGS)
    await expect(nav.locator(`a[href="/products/${slug}"]`)).toBeVisible();
  await expect(nav.getByRole("link", { name: "Como funciona" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Contato" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  // A link closes the panel and the next page opens with the panel shut
  await button.click();
  await nav.locator('a[href="/products/knowly"]').click();
  await page.waitForURL("**/products/knowly");
  await expect(nav).toBeHidden();
  const g = await heroGeometry(page);
  expect(g.y).toBe(0);
  expect(g.h1Top).toBeGreaterThanOrEqual(g.headerBottom);
});

// NAVEGAÇÃO ENTRE A HOME E OS PRODUTOS
// The operator's report of 2026-10-12: "when I click a product the page eats the first block and there is no way back".
// Measured cause: `html { scroll-behavior: smooth }` made Next 16 reach the new route by a 0.5 s scroll through its own body,
// and made the browser's restoration on back and forward an animation too (the page has no smooth scroll now). v3
// (operator, 2026-10-21): the product is a page of its own, opened at its top. These specs pin what the visitor must
// get: the top of the product in view, never under the fixed header, with no part of the home left; the browser's back button
// returning to the card that was clicked; and a menu with the five products and the Domus (a drop-down list on a
// desktop, a panel on a phone). The selector of the products and the logo are in sections-nav.spec.ts.
// v2.1: every way into a product plays the brand opening of that product (about 5 s) before it lands, so every check of
// the landing waits for the opening to leave (`landed`); the move itself is measured by e2e/transitions.spec.ts.
import { expect, test, type Page } from "@playwright/test";

// The brand opening has played and left: no sheet of the opening and no travelling logo over the page
const landed = (page: Page) =>
  page.waitForFunction(
    () =>
      !document.querySelector("[data-intro]") &&
      !document.querySelector("body > img"),
    undefined,
    { timeout: 12000 },
  );
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

// The opening of the product: v3, the product is a page of its own in the slot of the site frame, so "the top of the
// product page" is the top of the slot at the top of the window
const heroGeometry = (page: Page) =>
  page.evaluate(() => {
    const header = document.querySelector("header")!.getBoundingClientRect();
    const h1 = document.querySelector("#product h1")!.getBoundingClientRect();
    const slot = document
      .querySelector("[data-descent-slot]")!
      .getBoundingClientRect();
    return {
      y: Math.round(slot.top),
      headerBottom: header.bottom,
      h1Top: h1.top,
      h1Bottom: h1.bottom,
      vh: innerHeight,
    };
  });

for (const vp of VIEWPORTS.filter((v) => v.name !== "1024")) {
  // v3 (operator, 2026-10-21): the product is a page of its own, so the card opens it at the top of the window, with
  // no part of the home left above or under it
  test(`a click on a product card opens its product at the top of its own page, at ${vp.name}`, async ({
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
    await landed(page);
    // Once on the product, the page never moves away from its top (no descent through the home)
    const frames = await page.evaluate(
      () => (window as unknown as { __y: [string, number][] }).__y,
    );
    const onProduct = frames
      .filter(([path]) => path === "/products/relloo")
      .map(([, y]) => y);
    expect(onProduct.length).toBeGreaterThan(0);
    expect(onProduct.at(-1)).toBeLessThanOrEqual(2);
    for (const id of ["intro", "message", "products", "platforms"])
      await expect(page.locator(`section#${id}`), id).toHaveCount(0);
    // The logo (the h1) is in view and below the fixed header, not hidden under it
    const g = await heroGeometry(page);
    expect(Math.abs(g.y)).toBeLessThanOrEqual(2);
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
    await landed(page);
    await page.goBack();
    await page.waitForURL((url) => url.pathname === "/");
    await page.waitForTimeout(1600);
    const after = await page.evaluate(() => Math.round(scrollY));
    expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
    // And forward again shows the opening of the product
    await page.goForward();
    await page.waitForURL("**/products/tuner");
    await page.waitForTimeout(900);
    const g = await heroGeometry(page);
    expect(Math.abs(g.y)).toBeLessThan(40);
    expect(g.h1Bottom).toBeGreaterThan(g.headerBottom);
  });
}

test("the desktop menu lists the five products and the Domus, and each leads where it says", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "load" });
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Produtos" })).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "Domus", exact: true }),
  ).toBeVisible();
  // The list of products opens on hover and on keyboard focus
  await nav.getByRole("link", { name: "Produtos" }).hover();
  for (const slug of SLUGS)
    await expect(
      nav.locator(`a[href="/products/${slug}"]`).first(),
    ).toBeVisible();
  await nav.locator('a[href="/products/magneto"]').first().click();
  await page.waitForURL("**/products/magneto");
  await landed(page);
  await expect(page.locator("[data-descent-slot] h1 img")).toHaveAttribute(
    "alt",
    /Magneto/,
  );
  // The Domus entry leads to the Domus
  await nav.getByRole("link", { name: "Domus", exact: true }).click();
  await page.waitForURL("**/products/domus");
  await landed(page);
  await expect(page.locator("[data-descent-slot] h1 img")).toHaveAttribute(
    "alt",
    /Domus/,
  );
  // The button of the header leads to the contact of the home
  await page.locator("header > div > a[href='/#contact']").click();
  await page.waitForURL(
    (url) => url.pathname === "/" && url.hash === "#contact",
  );
  await expect(page.locator("#contact h2")).toBeInViewport();
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
    await expect(
      nav.locator(`a[href="/products/${slug}"]`).first(),
    ).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "Domus", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  // A link closes the panel and the next page opens with the panel shut
  await button.click();
  await nav.locator('a[href="/products/knowly"]').click();
  await page.waitForURL("**/products/knowly");
  await expect(nav).toBeHidden();
  await landed(page);
  const g = await heroGeometry(page);
  expect(Math.abs(g.y)).toBeLessThanOrEqual(2);
  expect(g.h1Top).toBeGreaterThanOrEqual(g.headerBottom);
});

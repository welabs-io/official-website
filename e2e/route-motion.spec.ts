// TRANSIÇÃO E CAMINHO DE VOLTA ENTRE A HOME E OS PRODUTOS
// Acceptance of components/onepage/RouteMotion.tsx and of the product switcher: a click on a card of the home enters the
// product inside a view transition (the logo morphs into the hero) and lands on the top of the page; a click on another
// product of the switcher swaps the page in place (the history entry is replaced); "Voltar" returns to the home at the
// position the visitor left; a visitor who landed on a product page directly goes to the top of the home; under reduced
// motion the same navigations run with no transition; the switcher never scrolls the page sideways.
import { expect, test, type Page } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

// Counts the view transitions the page starts
const countTransitions = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { __vt: number };
    w.__vt = 0;
    const start = document.startViewTransition?.bind(document);
    if (start)
      document.startViewTransition = ((cb: ViewTransitionUpdateCallback) => {
        w.__vt++;
        return start(cb);
      }) as typeof document.startViewTransition;
  });

const state = (page: Page) =>
  page.evaluate(() => ({
    y: Math.round(scrollY),
    vt: (window as unknown as { __vt: number }).__vt,
    length: history.length,
    path: location.pathname,
  }));

test("card, switcher and Voltar: one transition each, the history kept, the home back at its position", async ({
  page,
}) => {
  await countTransitions(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "load" });
  const card = page.locator('a[data-card="relloo"]');
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const left = await page.evaluate(() => Math.round(scrollY));
  expect(left).toBeGreaterThan(300);

  await card.click();
  await page.waitForURL("**/products/relloo");
  await page.waitForTimeout(900);
  const onProduct = await state(page);
  expect(onProduct.vt).toBe(1);
  expect(onProduct.y).toBe(0);

  const switcher = page.getByRole("navigation", { name: "Trocar de produto" });
  await switcher.locator('a[href="/products/magneto"]').click();
  await page.waitForURL("**/products/magneto");
  await page.waitForTimeout(900);
  const switched = await state(page);
  expect(switched.vt).toBe(2);
  expect(switched.y).toBe(0);
  // Replaced, not pushed: back still leads to the home
  expect(switched.length).toBe(onProduct.length);
  await expect(switcher.locator('[aria-current="page"] img')).toHaveAttribute(
    "alt",
    "Magneto",
  );

  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(400);
  await switcher.getByRole("link", { name: "Voltar para a página inicial" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await page.waitForTimeout(900);
  const home = await state(page);
  expect(home.vt).toBe(3);
  expect(Math.abs(home.y - left)).toBeLessThanOrEqual(2);
});

test("Voltar on a product page reached directly goes to the top of the home", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/tuner", { waitUntil: "load" });
  await page
    .getByRole("navigation", { name: "Trocar de produto" })
    .getByRole("link", { name: "Voltar para a página inicial" })
    .click();
  await page.waitForURL((url) => url.pathname === "/");
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => Math.round(scrollY))).toBe(0);
});

test("under reduced motion the navigation runs with no view transition", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await countTransitions(page);
  await page.goto("/products/domus", { waitUntil: "load" });
  await page
    .getByRole("navigation", { name: "Trocar de produto" })
    .locator('a[href="/products/knowly"]')
    .click();
  await page.waitForURL("**/products/knowly");
  await page.waitForTimeout(400);
  expect((await state(page)).vt).toBe(0);
  await context.close();
});

for (const vp of VIEWPORTS)
  test(`the switcher fits the width at ${vp.name}, every product reachable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/products/knowly", { waitUntil: "load" });
    const m = await page.evaluate(() => {
      const nav = document.querySelector(
        'nav[aria-label="Trocar de produto"]',
      )!;
      const box = nav.getBoundingClientRect();
      return {
        overflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        right: box.right,
        items: [...nav.querySelectorAll("li")].map((li) => {
          const r = li.getBoundingClientRect();
          return { w: r.width, h: r.height, right: r.right };
        }),
      };
    });
    expect(m.overflow).toBeLessThanOrEqual(0);
    expect(m.items).toHaveLength(5);
    for (const item of m.items) {
      expect(item.right).toBeLessThanOrEqual(vp.width);
      // A target a finger can hit
      expect(item.h).toBeGreaterThanOrEqual(40);
    }
  });

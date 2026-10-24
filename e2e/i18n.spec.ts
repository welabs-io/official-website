// IDIOMAS: PT-BR SEM PREFIXO, EN E ES COM PREFIXO
// The site speaks three languages: pt-BR is served with no prefix (`/`, `/products/<slug>`), en and es under `/en` and
// `/es`; routes stay in English. These specs pin what the visitor gets in each: the page answers 200, <html lang> says the
// language, the head names the same page in the other languages (hreflang), the selector of the header changes the
// language keeping the page (and the hash), nothing redirects by Accept-Language, and the brand opening of a product plays
// from the home of any language and lands on the prefixed address.
import { expect, test, type Page } from "@playwright/test";

const LOCALES = [
  { id: "pt-BR", prefix: "", lang: "pt-BR", code: "PT", name: "Português" },
  { id: "en", prefix: "/en", lang: "en", code: "EN", name: "English" },
  { id: "es", prefix: "/es", lang: "es", code: "ES", name: "Español" },
] as const;

// The selector: its button in the header, and the option of a language in the list it opens
const trigger = (page: Page) => page.locator("header [data-locale-trigger]");
const choose = async (page: Page, name: string) => {
  await trigger(page).click();
  await page.getByRole("menuitemradio", { name }).click();
};

for (const l of LOCALES) {
  for (const path of ["/", "/products/relloo"]) {
    const url = path === "/" ? l.prefix || "/" : `${l.prefix}${path}`;

    test(`${url} answers 200 in ${l.id}, with its lang and its hreflang`, async ({
      page,
    }) => {
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", l.lang);
      // The head names the same page in the three languages and the default one
      const alternates = await page.evaluate(() =>
        Object.fromEntries(
          [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(
            (el) => [
              el.getAttribute("hreflang"),
              new URL((el as HTMLLinkElement).href).pathname,
            ],
          ),
        ),
      );
      const base = path === "/" ? "" : path;
      expect(alternates).toEqual({
        "pt-BR": base || "/",
        en: `/en${base}`,
        es: `/es${base}`,
        "x-default": base || "/",
      });
      const canonical = await page
        .locator('link[rel="canonical"]')
        .evaluate((el) => new URL((el as HTMLLinkElement).href).pathname);
      expect(canonical).toBe(url);
      // The selector shows the code of the current language
      await expect(trigger(page)).toHaveText(l.code);
    });
  }
}

test("the selector changes the language and keeps the page", async ({
  page,
}) => {
  await page.goto("/en/products/knowly", { waitUntil: "load" });
  await choose(page, "Español");
  await page.waitForURL("**/es/products/knowly");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("#product h1 img")).toBeVisible();

  await choose(page, "Português");
  await page.waitForURL((u) => u.pathname === "/products/knowly");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

  await choose(page, "English");
  await page.waitForURL("**/en/products/knowly");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("the selector keeps the home and its hash", async ({ page }) => {
  await page.goto("/es#contact", { waitUntil: "load" });
  await choose(page, "English");
  await page.waitForURL((u) => u.pathname === "/en" && u.hash === "#contact");
  await choose(page, "Português");
  await page.waitForURL((u) => u.pathname === "/" && u.hash === "#contact");
});

test("the language never changes by itself: Accept-Language is ignored", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "es-ES" });
  const page = await context.newPage();
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await context.close();
});

test("the prefix of pt-BR redirects to the plain address, and an unknown language is a 404", async ({
  request,
}) => {
  const base = new URL((await request.get("/")).url()).origin;
  for (const [from, to] of [
    ["/pt-BR", "/"],
    ["/pt-BR/products/tuner", "/products/tuner"],
    ["/en/products/rello", "/en/products/relloo"],
    ["/es/products", "/es#products"],
  ]) {
    const r = await request.get(from, { maxRedirects: 0 });
    expect(r.status(), from).toBe(308);
    expect(
      new URL(r.headers().location, base).pathname +
        new URL(r.headers().location, base).hash,
      from,
    ).toBe(to);
  }
  expect((await request.get("/fr")).status()).toBe(404);
  expect((await request.get("/en/products/unknown")).status()).toBe(404);
});

test("the links of a page carry its language", async ({ page }) => {
  await page.goto("/en", { waitUntil: "load" });
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("header a, footer a, #products a")].map(
      (a) => new URL((a as HTMLAnchorElement).href).pathname,
    ),
  );
  expect(hrefs.length).toBeGreaterThan(8);
  for (const href of hrefs) expect(href, href).toMatch(/^\/en(\/|$)/);
});

test("the brand opening of a product plays from the home of each language and lands on the prefixed address", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const l of LOCALES) {
    await page.goto(l.prefix || "/", { waitUntil: "load" });
    await page.evaluate(() => sessionStorage.clear());
    await page.waitForTimeout(1200);
    const card = page.locator('a[data-card="relloo"]');
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await page.waitForTimeout(900);
    await card.click();
    // The opening of the product draws its sheet over the page, and the route changes under it
    await page.waitForSelector("[data-intro]", { timeout: 4000 });
    await page.waitForURL((u) => u.pathname === `${l.prefix}/products/relloo`, {
      timeout: 8000,
    });
    // It leaves, and the page of the product is there with its logo as the h1
    await page.waitForFunction(
      () => !document.querySelector("[data-intro]"),
      undefined,
      {
        timeout: 14000,
      },
    );
    await expect(page.locator("#product h1 img")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", l.lang);
  }
});

test("the logo and the menu of a product lead home in the same language", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/es/products/tuner", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.locator("header a[aria-label]").first().click();
  await page.waitForURL((u) => u.pathname === "/es", { timeout: 8000 });
  await expect(page.locator("#intro h1")).toBeVisible();
});

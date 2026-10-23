// REGRAS DE CONTEÚDO E FUNIL DO CONTATO (V3, F1)
// The acceptance of the phase F1 of the v3 plan (control/portfolio/site-redesign/v3-plan/plano.md, section 5), measured
// on the rendered pages at 1440 × 900 and 390 × 844:
// - no person by name in the text of any route (the shared list of copy-rules.json, with no tolerance);
// - the strip of platforms names the four clouds and nothing else;
// - every link to the contact lands on a band that has an action, and no link of that band leads back to it;
// - the questions of a contact are plain text: no pointer, no shadow, no box, nothing a visitor would try to click.
import { expect, test, type Page } from "@playwright/test";
import rules from "../lib/content/copy-rules.json";

const PATHS = [
  "/",
  "/products/domus",
  "/products/relloo",
  "/products/magneto",
  "/products/tuner",
  "/products/knowly",
];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
const CLOUDS = ["AWS", "Google Cloud", "DigitalOcean", "HostDime"];
// A name of the list as a whole word, with a unicode edge (\b breaks on an accented letter)
const PERSON = new RegExp(
  `(?:^|[^\\p{L}])(${rules.persons.join("|")})(?=[^\\p{L}]|$)`,
  "u",
);

// The contact band a visitor sees on the page (a product route also carries the hidden tail of the home)
const visibleContact = (page: Page) => page.locator("section#contact:visible");

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewport.width}`, () => {
    test.use({ viewport });

    for (const path of PATHS)
      test(`${path} names no person`, async ({ page }) => {
        await page.goto(path, { waitUntil: "load" });
        const text = await page.evaluate(() => document.body.innerText);
        expect(text.match(PERSON)?.[1] ?? null).toBeNull();
      });

    test("the strip of platforms names only the four clouds", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "load" });
      const names = await page
        .locator("#platforms li")
        .evaluateAll((items) =>
          items.map((li) => (li as HTMLElement).innerText.trim()),
        );
      expect(names).toEqual(CLOUDS);
    });

    test("every link to the contact lands on a band with an action that does not lead back to it", async ({
      page,
    }) => {
      const targets = new Set<string>();
      for (const path of PATHS) {
        await page.goto(path, { waitUntil: "load" });
        for (const href of await page
          .locator('a[href*="contact"]')
          .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href)))
          targets.add(href);
      }
      expect(targets.size).toBeGreaterThan(0);
      for (const target of targets) {
        await page.goto(target, { waitUntil: "load" });
        const url = new URL(target);
        const band = page.locator(`section${url.hash}:visible`);
        await expect(band).toHaveCount(1);
        const actions = await band
          .locator("a[href], button, [role='button'], input, select, textarea")
          .evaluateAll((els) =>
            els.map((el) =>
              el instanceof HTMLAnchorElement ? el.href : el.tagName,
            ),
          );
        const self = actions.filter((a) => {
          if (!a.startsWith("http")) return false;
          const to = new URL(a);
          return to.pathname === url.pathname && to.hash === url.hash;
        });
        expect(self, `${target}: links that lead back to the band`).toEqual(
          [],
        );
        expect(actions.length, `${target}: actions of the band`).toBeGreaterThan(0);
      }
    });

    for (const path of PATHS)
      test(`${path}: the questions of the contact are not shaped like controls`, async ({
        page,
      }) => {
        await page.goto(path, { waitUntil: "load" });
        const asks = visibleContact(page).locator("li");
        expect(await asks.count()).toBeGreaterThanOrEqual(3);
        const looks = await asks.evaluateAll((items) =>
          items.map((li) => {
            const s = getComputedStyle(li);
            return {
              cursor: s.cursor,
              shadow: s.boxShadow,
              radius: s.borderTopLeftRadius,
              sides: [s.borderLeftWidth, s.borderRightWidth],
              interactive: !!li.closest("a, button, [role='button'], label"),
            };
          }),
        );
        for (const look of looks) {
          expect(look.cursor).not.toBe("pointer");
          expect(look.shadow).toBe("none");
          expect(look.radius).toBe("0px");
          expect(look.sides).toEqual(["0px", "0px"]);
          expect(look.interactive).toBe(false);
        }
      });
  });
}

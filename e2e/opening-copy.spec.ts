// TEXTO DAS ABERTURAS DE MARCA, MEDIDO NO CLIQUE
// v3 (F1 review): the brand opening of a product is a chunk fetched on the click into it, so a scan of the page on load
// never sees it; the Relloo opening drew four people by name for about 2 s, and the Tuner opening two brands as channels.
// For each product, at 1440 and 390, a fresh visit clicks into it from the home and samples, every 100 ms until the
// opening is gone, the text the window shows (document.body.innerText) and every text of the opening sheet
// (textContent, also what has not faded in yet): no person's name, no third-party brand, no internal stack.
import { expect, test, type Page } from "@playwright/test";
import rules from "../lib/content/copy-rules.json";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"];
// A label each opening with text draws: the record of a Relloo card and the category of a Tuner chip
const DRAWN: Record<string, string> = {
  relloo: "Contato 4821",
  tuner: "Comunidade",
};
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
// A name of a list as a whole word, with a unicode edge (\b breaks on an accented letter)
const matcher = (list: readonly string[], flags = "u") =>
  new RegExp(`(?:^|[^\\p{L}])(${list.join("|")})(?=[^\\p{L}]|$)`, flags);
const PERSON = matcher(rules.persons);
const STACK = matcher(rules.stack);
// No brand at all: an opening draws labels, with no brackets to hold an example
const VENDOR = matcher(rules.vendors, "iu");

// A brand outside brackets (the window may show a product page, where a brand stands as an example of its category)
const looseVendor = (text: string) => {
  for (const m of text.matchAll(matcher(rules.vendors, "gu"))) {
    // The match starts on the edge before the name (it may be the bracket itself)
    const before = text.slice(0, m.index + m[0].length - m[1].length);
    if (before.lastIndexOf("(") <= before.lastIndexOf(")")) return m[1];
  }
  return null;
};

type Sampled = { __window: Set<string>; __sheet: Set<string>; __seen: boolean };
// Starts the sampler before the click; it keeps every distinct text until the opening sheet has come and gone
const startSampling = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as Sampled;
    w.__window = new Set();
    w.__sheet = new Set();
    w.__seen = false;
    const id = setInterval(() => {
      const sheet = document.querySelector<HTMLElement>("[data-intro]");
      w.__window.add(document.body.innerText);
      if (sheet) {
        w.__seen = true;
        w.__sheet.add(sheet.textContent ?? "");
      } else if (w.__seen) clearInterval(id);
    }, 100);
  });

for (const viewport of VIEWPORTS)
  test.describe(`brand openings at ${viewport.width}`, () => {
    test.use({ viewport });
    for (const slug of SLUGS)
      test(`${slug}: the opening names no person, no brand and no stack`, async ({
        page,
      }) => {
        test.setTimeout(30_000);
        await page.goto("/", { waitUntil: "load" });
        await page.waitForTimeout(800);
        // A link to the product inside the page (the stage, a card, a strip): the engine opens it with its opening
        const link = page
          .locator(`#main-content a[href="/products/${slug}"]:visible`)
          .first();
        await link.scrollIntoViewIfNeeded();
        await startSampling(page);
        await link.click();
        await page.waitForFunction(
          () =>
            (window as unknown as Sampled).__seen &&
            !document.querySelector("[data-intro]"),
          null,
          { timeout: 15_000, polling: 100 },
        );
        const { shown, sheet } = await page.evaluate(() => {
          const w = window as unknown as Sampled;
          return { shown: [...w.__window], sheet: [...w.__sheet] };
        });
        expect(sheet.length, "samples of the opening").toBeGreaterThan(0);
        const drawn = sheet.join(" | ");
        // The sampler reads the drawn labels (a scan that reads nothing would pass on anything)
        if (DRAWN[slug]) expect(drawn).toContain(DRAWN[slug]);
        const all = [...shown, drawn].join(" | ");
        expect(all.match(PERSON)?.[1] ?? null, "person").toBeNull();
        expect(all.match(STACK)?.[1] ?? null, "stack").toBeNull();
        expect(drawn.match(VENDOR)?.[1] ?? null, "brand in the opening").toBeNull();
        expect(looseVendor(shown.join(" | ")), "loose brand on screen").toBeNull();
      });
  });

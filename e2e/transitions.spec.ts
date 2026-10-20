// TRANSIÇÃO FLUIDA, 10 DE 10
// v2.1, the operator's report: "Menu → Produtos → Domus não tem efeito de transição fluida sempre, e antes era
// intermitente". Measured on 2e98392 (control/portfolio/site-redesign/v13-proposta/v2-1/causas.md): the menu swapped the
// page with no move at all (components/onepage/descent-run.ts:440 of that commit), 10 out of 10, and a click that came
// before the descent chunk was plain navigation. Now every way into a product plays the brand opening of that product
// and lands on it. Each flow runs 10 times in a row, and on every run this spec samples the page frame by frame and
// asserts that the move really animated (the sheet of the opening is there, its clip opens over several frames, the
// opening draws different frames) and that it lands on the product, with nothing left over the page.
import { expect, test, type Page } from "@playwright/test";

const RUNS = Number(process.env.TRANSITION_RUNS ?? 10);

// Samples, every frame for `ms`, the sheet of the opening and the scroll
async function record(page: Page, ms: number) {
  return page.evaluate((ms) => {
    type Frame = {
      t: number;
      sheet: string | null;
      clip: string;
      opacity: string;
      draw: string;
      fly: boolean;
      y: number;
      path: string;
    };
    return new Promise<Frame[]>((done) => {
      const out: Frame[] = [];
      const t0 = performance.now();
      const tick = () => {
        const sheet = document.querySelector<HTMLElement>("[data-intro]");
        // A cheap fingerprint of what the opening draws: the transforms of its first groups
        const draw = sheet
          ? [...sheet.querySelectorAll("svg [transform], .zoom")]
              .slice(0, 6)
              .map(
                (el) =>
                  el.getAttribute("transform") ??
                  (el as HTMLElement).style.transform,
              )
              .join("|")
          : "";
        out.push({
          t: Math.round(performance.now() - t0),
          sheet: sheet?.dataset.intro ?? null,
          clip: sheet?.style.clipPath ?? "",
          opacity: sheet?.style.opacity ?? "",
          draw,
          fly: !!document.querySelector("body > img[class]"),
          y: Math.round(scrollY),
          path: location.pathname,
        });
        if (performance.now() - t0 < ms) requestAnimationFrame(tick);
        else done(out);
      };
      requestAnimationFrame(tick);
    });
  }, ms);
}

async function expectOpening(page: Page, slug: string, start: () => Promise<void>) {
  const frames = record(page, 6200);
  await start();
  const f = await frames;
  const withSheet = f.filter((x) => x.sheet === slug);
  // The sheet of the opening of this product came in at once and stayed for the opening
  expect(withSheet.length, "frames with the opening").toBeGreaterThan(120);
  expect(f.findIndex((x) => x.sheet === slug), "first frame with the opening").toBeLessThan(30);
  // Its clip opened over several frames (from the box clicked to the window), and the opening drew many frames
  expect(new Set(withSheet.map((x) => x.clip)).size, "clip frames").toBeGreaterThan(8);
  expect(new Set(withSheet.map((x) => x.draw)).size, "drawn frames").toBeGreaterThan(40);
  // The hand-over: the logo travelled and the sheet faded over several frames
  expect(f.some((x) => x.fly), "travelling logo").toBe(true);
  expect(new Set(withSheet.map((x) => x.opacity)).size, "fade frames").toBeGreaterThan(8);
  // It landed: the product is the route, the sheet is gone, the opening of the product sits under the header
  const last = f.at(-1)!;
  expect(last.path).toBe(`/products/${slug}`);
  expect(last.sheet).toBeNull();
  const geo = await page.evaluate(() => {
    const h1 = document.querySelector("[data-descent-slot] #product h1 img")!;
    const header = document.querySelector("header")!.getBoundingClientRect();
    const r = h1.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, header: header.bottom, vh: innerHeight, vis: getComputedStyle(h1).visibility };
  });
  expect(geo.top).toBeGreaterThanOrEqual(geo.header);
  expect(geo.bottom).toBeLessThan(geo.vh);
  expect(geo.vis).toBe("visible");
}

test.describe.configure({ mode: "serial" });
test.setTimeout(RUNS * 12_000 + 30_000);

test(`Menu → Produtos → Domus plays the opening of the Domus, ${RUNS} of ${RUNS}`, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (let i = 0; i < RUNS; i++) {
    await page.goto("/", { waitUntil: "load" });
    // Half of the runs click right after the load, before the descent chunk may have landed
    await page.waitForTimeout(i % 2 ? 1200 : 50);
    await page.hover("header nav >> text=Produtos");
    await expectOpening(page, "domus", () =>
      page.locator('header nav a[href="/products/domus"]').first().click(),
    );
  }
});

test(`a card of the home plays the opening of its product, ${RUNS} of ${RUNS}`, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (let i = 0; i < RUNS; i++) {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(i % 2 ? 1200 : 50);
    const card = page.locator('a[data-card="relloo"]');
    await card.scrollIntoViewIfNeeded();
    await expectOpening(page, "relloo", () => card.click());
  }
});

test(`the selector of a product plays the opening of the next one, ${RUNS} of ${RUNS}`, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const order = ["relloo", "magneto", "tuner", "knowly", "domus"];
  await page.goto("/products/domus", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  for (let i = 0; i < RUNS; i++) {
    const slug = order[i % order.length];
    await expectOpening(page, slug, () =>
      page
        .locator(`nav[aria-label="Os cinco produtos"] a[href="/products/${slug}"]`)
        .click(),
    );
  }
});

test(`the browser's back from a product returns to the card with a move, ${RUNS} of ${RUNS}`, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (let i = 0; i < RUNS; i++) {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const card = page.locator('a[data-card="magneto"]');
    await card.scrollIntoViewIfNeeded();
    const homeY = await page.evaluate(() => scrollY);
    await card.click();
    await page.waitForURL("**/products/magneto");
    await page.waitForFunction(() => !document.querySelector("[data-intro]"));
    // The way back: the layers of the reverse move are over the page for many frames, moving
    const frames = page.evaluate(
      () =>
        new Promise<string[]>((done) => {
          const out: string[] = [];
          const t0 = performance.now();
          const tick = () => {
            const layer = [...document.body.children].find(
              (el) => el.tagName === "DIV" && (el as HTMLElement).style.transform,
            ) as HTMLElement | undefined;
            out.push(layer ? layer.style.transform : "");
            if (performance.now() - t0 < 1600) requestAnimationFrame(tick);
            else done(out);
          };
          requestAnimationFrame(tick);
        }),
    );
    await page.goBack();
    const moved = (await frames).filter(Boolean);
    expect(new Set(moved).size, "frames of the way back").toBeGreaterThan(20);
    await page.waitForURL((u) => u.pathname === "/");
    await page.waitForTimeout(300);
    expect(Math.abs((await page.evaluate(() => scrollY)) - homeY)).toBeLessThan(4);
  }
});

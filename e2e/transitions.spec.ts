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
      seal: string;
      y: number;
      path: string;
    };
    return new Promise<Frame[]>((done) => {
      const out: Frame[] = [];
      const t0 = performance.now();
      const tick = () => {
        const sheet = document.querySelector<HTMLElement>("[data-intro]");
        // A cheap fingerprint of what the opening draws. v4 (2026-10-24): the choreography of the product on its stage,
        // so the camera layer, the first moving pieces of the scene (their transform and opacity attributes) and the
        // clip of the logo that the wipe opens
        const stage = sheet?.querySelector<HTMLElement>("[data-intro-stage]");
        const draw = stage
          ? [
              stage.querySelector<HTMLElement>(".zoom")?.style.transform ?? "",
              ...[...stage.querySelectorAll("svg [transform]")]
                .slice(0, 6)
                .map(
                  (el) =>
                    `${el.getAttribute("transform")} ${el.getAttribute("opacity")}`,
                ),
              stage.querySelector<HTMLElement>("[data-intro-logo]")?.style
                .clipPath ?? "",
            ].join("|")
          : "";
        out.push({
          t: Math.round(performance.now() - t0),
          sheet: sheet?.dataset.intro ?? null,
          // v5 (2026-10-24): computed, since the clip and the fade-in of the sheet are Web Animations (intro-run.ts)
          clip: sheet ? getComputedStyle(sheet).clipPath : "",
          opacity: sheet ? getComputedStyle(sheet).opacity : "",
          draw,
          fly: !!document.querySelector("body > img[class]"),
          // The closing frame fading on the canvas (the stage, which holds the logo and its seal)
          seal: stage ? getComputedStyle(stage).opacity : "",
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

// v4 (operator, 2026-10-24): the whole opening plays on every entry into a product, from any link, the product selector
// included (no flash any more); at SPEED 1.6 it takes about 3.9 s from the click to a settled page
async function expectOpening(
  page: Page,
  slug: string,
  start: () => Promise<void>,
) {
  const frames = record(page, 6200);
  await start();
  const f = await frames;
  const withSheet = f.filter((x) => x.sheet === slug);
  console.log(
    `${slug}: ${withSheet.length} frames with the sheet of ${f.length}`,
  );
  expect(
    f.findIndex((x) => x.sheet === slug),
    "first frame with the opening",
  ).toBeLessThan(30);
  // The sheet of the opening of this product came in at once and stayed for the opening (by its time on screen, over
  // 3 s, since a loaded machine draws fewer frames in the same time)
  expect(withSheet.length, "frames with the opening").toBeGreaterThan(60);
  expect(
    withSheet.at(-1)!.t - withSheet[0].t,
    "ms of the opening",
  ).toBeGreaterThan(3000);
  // Its clip opened over several frames (from the box clicked to the window), and the opening drew many frames (at SPEED
  // 1.6 the same choreography draws 1/1.6 of the distinct frames it drew at 1: 40 became 25)
  expect(
    new Set(withSheet.map((x) => x.clip)).size,
    "clip frames",
  ).toBeGreaterThan(8);
  expect(
    new Set(withSheet.map((x) => x.draw)).size,
    "drawn frames",
  ).toBeGreaterThan(25);
  // The hand-over. v4 (brief-v4, artboard 8): no logo travels any more (its raster was scaled in flight, which blurred
  // it); the closing frame (logo and seal) fades on the canvas over several frames and the page comes in under the
  // same canvas
  expect(
    f.some((x) => x.fly),
    "no travelling logo",
  ).toBe(false);
  expect(
    // The sheet fading in and the logo fading out, frame by frame
    new Set(withSheet.map((x) => `${x.opacity}/${x.seal}`)).size,
    "fade frames",
  ).toBeGreaterThan(8);
  // It landed: the product is the route, the sheet is gone, the opening of the product sits under the header
  const last = f.at(-1)!;
  expect(last.path).toBe(`/products/${slug}`);
  expect(last.sheet).toBeNull();
  const geo = await page.evaluate(() => {
    const h1 = document.querySelector("[data-descent-slot] #product h1 img")!;
    const header = document.querySelector("header")!.getBoundingClientRect();
    const r = h1.getBoundingClientRect();
    return {
      top: r.top,
      bottom: r.bottom,
      header: header.bottom,
      vh: innerHeight,
      vis: getComputedStyle(h1).visibility,
    };
  });
  expect(geo.top).toBeGreaterThanOrEqual(geo.header);
  expect(geo.bottom).toBeLessThan(geo.vh);
  expect(geo.vis).toBe("visible");
}

test.describe.configure({ mode: "serial" });
test.setTimeout(RUNS * 12_000 + 30_000);

test(`Menu → Produtos → Domus plays the opening of the Domus, ${RUNS} of ${RUNS}`, async ({
  page,
}) => {
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

test(`a card of the home plays the opening of its product, ${RUNS} of ${RUNS}`, async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (let i = 0; i < RUNS; i++) {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(i % 2 ? 1200 : 50);
    const card = page.locator('a[data-card="relloo"]');
    await card.scrollIntoViewIfNeeded();
    // v4: the card is the logo of an accordion panel, which gains width under the pointer (~700 ms); the pointer rests
    // on it first, as a visitor's does, so the click is not held by Playwright waiting for the logo to stop moving
    await card.hover();
    await page.waitForTimeout(900);
    await expectOpening(page, "relloo", () => card.click());
  }
});

test(`the selector of a product plays the whole opening of the next one, ${RUNS} of ${RUNS}`, async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const order = ["relloo", "magneto", "tuner", "knowly", "domus"];
  await page.goto("/products/domus", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  for (let i = 0; i < RUNS; i++) {
    const slug = order[i % order.length];
    await expectOpening(page, slug, () =>
      page
        .locator(
          `nav[aria-label="Os cinco produtos"] a[href="/products/${slug}"]`,
        )
        .click(),
    );
  }
});

// v3 (operator, 2026-10-21): the product is a page of its own, so the way back no longer shrinks the product into its
// card; it crosses the plain sheet (descent-run.ts, `cross`) and the home comes back where the visitor left it
test(`the browser's back from a product crosses the sheet and returns to the card, ${RUNS} of ${RUNS}`, async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (let i = 0; i < RUNS; i++) {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const card = page.locator('a[data-card="magneto"]');
    await card.scrollIntoViewIfNeeded();
    // v2.2: the position at the instant of the click, not before it: when the card is covered for a moment, Playwright
    // scrolls it again before clicking (measured: 3 of 8 runs on 5fc85df ended "344 px off", with the card exactly where
    // it was clicked)
    await page.evaluate(() =>
      addEventListener(
        "pointerdown",
        () => ((window as unknown as { __clickY: number }).__clickY = scrollY),
        { capture: true, once: true },
      ),
    );
    await card.click();
    const homeY = await page.evaluate(
      () => (window as unknown as { __clickY: number }).__clickY,
    );
    await page.waitForURL("**/products/magneto");
    await page.waitForFunction(() => !document.querySelector("[data-intro]"));
    // The way back: the sheet is over the page for many frames, fading in and out (never a cut)
    const frames = page.evaluate(
      () =>
        new Promise<string[]>((done) => {
          const out: string[] = [];
          const t0 = performance.now();
          const tick = () => {
            const layer = [...document.body.children].find(
              (el) => el.tagName === "DIV" && (el as HTMLElement).style.opacity,
            ) as HTMLElement | undefined;
            out.push(layer ? layer.style.opacity : "");
            if (performance.now() - t0 < 1200) requestAnimationFrame(tick);
            else done(out);
          };
          requestAnimationFrame(tick);
        }),
    );
    await page.goBack();
    const faded = (await frames).filter(Boolean);
    expect(new Set(faded).size, "frames of the way back").toBeGreaterThan(10);
    await page.waitForURL((u) => u.pathname === "/");
    await page.waitForTimeout(300);
    expect(Math.abs((await page.evaluate(() => scrollY)) - homeY)).toBeLessThan(
      4,
    );
  }
});

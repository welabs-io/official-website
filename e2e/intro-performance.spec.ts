// DESEMPENHO DA ABERTURA DE CADA PRODUTO
// Operator (2026-10-24): "percebo uma latência nos intro e pequenas travadas perceptíveis". Measured on 709ccb0, on the
// production build: the render of the product page was pushed half a second into the opening, a 50 to 190 ms frame in
// the middle of the choreography; the sheet's first frame was a blank one; and a click with no hover before it waited
// for the chunk of its opening. For the five products, at 1440 and at 390, a fresh visit points at the product on the
// home and clicks it, and this spec samples every frame from the click to the page:
//  (a) latency: from the pointer down to the first frame where the sheet is painted (opacity above 0);
//  (b) the interval between frames while the opening moves (the clip opening, the choreography, the fade of the closing
//      frame): no pause above the limit, p95 at most one frame. The stretch where the closing frame holds still is left
//      out (the next page renders there, under a picture that does not change), and it is bounded on its own;
//  (c) one swap by the product selector, at each width, under the same limits.
// The limits are those of the production build (`next build` + `next start`); against the dev server (its bundles are
// not minified and its HMR client runs) the spec keeps the shape of the check with a looser limit.
import { expect, test, type Page } from "@playwright/test";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
// `still`: the closing frame holds still for its HOLD (156 ms) and until the next page has rendered (descent-run.ts
// `calm`, 400 ms at most after the commit); the dev server renders the page slower, so it holds longer there.
// The frames come on the 60 Hz clock, so an interval is a whole number of 16.7 ms periods: 50 ms is three periods,
// which the clock stamps as 50.1 ms, hence the half millisecond over each limit in periods
const PERIOD = 1000 / 60;
const LIMITS = {
  prod: {
    latency: 100,
    pause: 3 * PERIOD + 0.5,
    p95: PERIOD + 0.5,
    still: 600,
  },
  dev: {
    latency: 150,
    pause: 5 * PERIOD + 0.5,
    p95: 2 * PERIOD + 0.5,
    still: 1500,
  },
};

type Frame = { t: number; shown: boolean; phase: string; hidden: boolean };

// Arms the sampler: the instant of the pointer down and, on every frame until the sheet leaves, whether it is painted,
// its phase (intro-run.ts `data-intro-phase`) and whether the page already shows through it
const arm = (page: Page) =>
  page.evaluate(() => {
    type Perf = { down: number; frames: Frame[]; gone: boolean };
    const w = window as unknown as { __perf: Perf };
    const perf: Perf = { down: -1, frames: [], gone: false };
    w.__perf = perf;
    addEventListener("pointerdown", () => (perf.down = performance.now()), {
      capture: true,
      once: true,
    });
    let seen = false;
    let shown = false;
    const tick = (now: number) => {
      const sheet = document.querySelector<HTMLElement>("[data-intro]");
      if (sheet) {
        seen = true;
        // The computed opacity is read until the sheet was painted once (the Web Animations of its opening set it)
        shown = shown || Number(getComputedStyle(sheet).opacity) > 0;
        perf.frames.push({
          t: now,
          shown,
          phase: sheet.dataset.introPhase ?? "",
          hidden: sheet.style.visibility === "hidden",
        });
      } else if (seen) {
        perf.gone = true;
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

async function measure(page: Page, click: () => Promise<void>) {
  await arm(page);
  await click();
  await page.waitForFunction(
    () => (window as unknown as { __perf: { gone: boolean } }).__perf.gone,
    null,
    {
      timeout: 15_000,
    },
  );
  const { down, frames } = await page.evaluate(
    () =>
      (window as unknown as { __perf: { down: number; frames: Frame[] } })
        .__perf,
  );
  const first = frames.find((f) => f.shown);
  const shown = frames.filter((f) => f.shown && !f.hidden);
  const moving: number[] = [];
  let still = 0;
  for (let i = 1; i < shown.length; i++) {
    const gap = shown[i].t - shown[i - 1].t;
    if (shown[i - 1].phase === "still") still += gap;
    else moving.push(gap);
  }
  const sorted = [...moving].sort((a, b) => a - b);
  return {
    latency: first ? first.t - down : Infinity,
    p95:
      sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ??
      Infinity,
    pause: Math.max(0, ...moving),
    frames: moving.length,
    still,
  };
}

// The server is the dev one when its HMR client is on the page
const limitsOf = async (page: Page) =>
  (await page.evaluate(
    () => !!document.querySelector('script[src*="hmr-client"]'),
  ))
    ? LIMITS.dev
    : LIMITS.prod;

const report = (name: string, m: Awaited<ReturnType<typeof measure>>) =>
  console.log(
    `${name}: latency ${Math.round(m.latency)} ms, ${m.frames} moving frames, p95 ${m.p95.toFixed(1)} ms, longest ${m.pause.toFixed(1)} ms, still ${Math.round(m.still)} ms`,
  );

function check(
  m: Awaited<ReturnType<typeof measure>>,
  limits: (typeof LIMITS)["prod"],
) {
  expect(
    m.latency,
    "click to the first painted frame of the sheet",
  ).toBeLessThanOrEqual(limits.latency);
  expect(m.frames, "moving frames of the opening").toBeGreaterThan(100);
  expect(
    m.pause,
    "longest interval between frames while the opening moves",
  ).toBeLessThanOrEqual(limits.pause);
  expect(
    m.p95,
    "p95 of the interval between frames while the opening moves",
  ).toBeLessThanOrEqual(limits.p95);
  expect(m.still, "the closing frame holds still").toBeLessThanOrEqual(
    limits.still,
  );
}

for (const viewport of VIEWPORTS)
  test.describe(`performance of the opening at ${viewport.width}`, () => {
    test.use({ viewport });
    for (const slug of SLUGS)
      test(`${slug}: the sheet on the next frames, no pause while it moves`, async ({
        page,
      }) => {
        test.setTimeout(45_000);
        await page.goto("/", { waitUntil: "load" });
        await page.waitForTimeout(1500);
        const limits = await limitsOf(page);
        const link = page
          .locator(`#main-content a[href="/products/${slug}"]:visible`)
          .first();
        await link.scrollIntoViewIfNeeded();
        await link.hover();
        await page.waitForTimeout(900);
        const m = await measure(page, () => link.click());
        report(`${slug} at ${viewport.width}`, m);
        await expect(page).toHaveURL(new RegExp(`/products/${slug}$`));
        check(m, limits);
      });

    test("a swap by the product selector", async ({ page }) => {
      test.setTimeout(45_000);
      await page.goto("/products/domus", { waitUntil: "load" });
      await page.waitForTimeout(1500);
      const limits = await limitsOf(page);
      const link = page.locator(
        '[data-descent-slot] [data-switch] a[href="/products/knowly"]',
      );
      await link.scrollIntoViewIfNeeded();
      await link.hover();
      await page.waitForTimeout(900);
      const m = await measure(page, () => link.click());
      report(`selector to knowly at ${viewport.width}`, m);
      await expect(page).toHaveURL(/\/products\/knowly$/);
      check(m, limits);
    });
  });

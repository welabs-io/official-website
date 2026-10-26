// ABERTURA DE MARCA: COMPLETA EM TODA ENTRADA
// v2.2 (audit A08): the sheet faded from 15% of the flight, leaving the large logo over the page at half opacity
// (measured on 8187680). v4 (operator, 2026-10-24: "depois não abre mais a intro no clique dos produtos"): the short
// flash of later entries is gone. Acceptance at 1440: the whole opening (sheet present, about 3 to 4.5 s from the click
// to a settled page at SPEED 1.6) on the first entry into a product, on a swap by the selector and on a second entry
// into the same product, and the sheet whole while the logo is still large.
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

// Records, frame by frame, the opacity of the sheet and the width of the travelling logo
const sample = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __frames: number[][]; __t0: number };
    w.__frames = [];
    w.__t0 = performance.now();
    const tick = () => {
      // v6 (2026-10-26): the opening plays in a compact panel; its opacity is the card's (the panel and its shadow)
      const sheet = document.querySelector<HTMLElement>("[data-intro-card]");
      const fly = [...document.body.children].find(
        (el) => el.tagName === "IMG",
      );
      w.__frames.push([
        performance.now() - w.__t0,
        sheet ? Number(getComputedStyle(sheet).opacity) : -1,
        fly ? fly.getBoundingClientRect().width : 0,
      ]);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

// Milliseconds from the click until the sheet is gone and the page is no longer moving
async function timeTo(page: Page, click: () => Promise<void>) {
  await sample(page);
  await click();
  await page.waitForFunction(
    () =>
      !document.querySelector("[data-intro]") &&
      !document.documentElement.hasAttribute("data-moving"),
    null,
    { timeout: 10_000, polling: 16 },
  );
  return page.evaluate(() => {
    const w = window as unknown as { __frames: number[][]; __t0: number };
    const frames = w.__frames;
    // The width the logo lands at is the last width of the flight
    const last = [...frames].reverse().find((f) => f[2] > 0)?.[2] ?? 0;
    const doubled = frames.filter(
      (f) => f[2] > last * 1.3 && f[1] >= 0 && f[1] < 0.99,
    ).length;
    return { ms: Math.round(performance.now() - w.__t0), doubled };
  });
}

// The whole opening takes about 3.9 s from the click to a settled page (measured at SPEED 1.6). v5 (2026-10-24): the
// closing frame holds until the next page has rendered under it (intro-run.ts `closing`, descent-run.ts `calm`), 0.2 to
// 0.3 s on the production build and 0.4 to 0.7 s on the dev server (measured on 5d82d61: 4.0 to 4.4 s there)
const WHOLE_MIN_MS = 3000;
const WHOLE_MAX_MS = 5000;

test("whole opening on the first entry, on the selector and on a second entry", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const card = page.locator('a[data-card="magneto"]').first();
  await card.scrollIntoViewIfNeeded();

  const first = await timeTo(page, () => card.click());
  console.log(
    `first entry: ${first.ms} ms, half-faded frames with a large logo: ${first.doubled}`,
  );
  expect(first.ms).toBeGreaterThanOrEqual(WHOLE_MIN_MS);
  expect(first.ms).toBeLessThanOrEqual(WHOLE_MAX_MS);
  expect(first.doubled).toBe(0);
  await expect(page).toHaveURL(/\/products\/magneto$/);

  const swaps: number[] = [];
  for (const slug of ["tuner", "knowly", "relloo"]) {
    const link = page
      .locator(`[data-descent-slot] [data-switch] a[href="/products/${slug}"]`)
      .first();
    await link.scrollIntoViewIfNeeded();
    const swap = await timeTo(page, () => link.click());
    swaps.push(swap.ms);
    console.log(
      `selector to ${slug}: ${swap.ms} ms, half-faded: ${swap.doubled}`,
    );
    expect(swap.doubled).toBe(0);
    await expect(page).toHaveURL(new RegExp(`/products/${slug}$`));
  }
  // The selector plays the whole opening too, not a flash
  for (const ms of swaps) {
    expect(ms).toBeGreaterThanOrEqual(WHOLE_MIN_MS);
    expect(ms).toBeLessThanOrEqual(WHOLE_MAX_MS);
  }

  // Home by the logo, then the same product again: the whole opening again, not a flash
  await page.locator("header a").first().click();
  await expect(page).toHaveURL(/\/$/);
  await page.waitForTimeout(600);
  const again = page.locator('a[data-card="magneto"]').first();
  await again.scrollIntoViewIfNeeded();
  const second = await timeTo(page, () => again.click());
  console.log(`second entry into magneto: ${second.ms} ms`);
  expect(second.ms).toBeGreaterThanOrEqual(WHOLE_MIN_MS);
  expect(second.ms).toBeLessThanOrEqual(WHOLE_MAX_MS);
  expect(second.doubled).toBe(0);
});

// ABERTURA DE MARCA: COMPLETA UMA VEZ, FLASH DEPOIS
// v2.2 (audit A08): every entry and every swap by the product selector played the whole opening, 5.15 to 5.38 s from the
// click to a usable page, and the sheet faded from 15% of the flight, leaving the large logo over the page at half
// opacity (measured on 8187680). Acceptance at 1440: the whole opening on the first entry into a product, a flash of
// about 700 ms on a swap by the selector and on a second entry, and the sheet whole while the logo is still large.
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

// Records, frame by frame, the opacity of the sheet and the width of the travelling logo
const sample = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __frames: number[][]; __t0: number };
    w.__frames = [];
    w.__t0 = performance.now();
    const tick = () => {
      const sheet = document.querySelector<HTMLElement>("[data-intro]");
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

test("whole opening on the first entry, a flash on the selector and on a second entry", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const card = page.locator('a[data-card="magneto"]').first();
  await card.scrollIntoViewIfNeeded();

  const first = await timeTo(page, () => card.click());
  console.log(
    `first entry: ${first.ms} ms, half-faded frames with a large logo: ${first.doubled}`,
  );
  expect(first.ms).toBeGreaterThan(3000);
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
  for (const ms of swaps) {
    expect(ms).toBeGreaterThanOrEqual(500);
    expect(ms).toBeLessThanOrEqual(1000);
  }

  // Home by the logo, then the same product again: the flash, not the whole opening
  await page.locator("header a").first().click();
  await expect(page).toHaveURL(/\/$/);
  await page.waitForTimeout(600);
  const again = page.locator('a[data-card="magneto"]').first();
  await again.scrollIntoViewIfNeeded();
  const second = await timeTo(page, () => again.click());
  console.log(`second entry into magneto: ${second.ms} ms`);
  expect(second.ms).toBeLessThanOrEqual(1000);
});

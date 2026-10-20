// A MENSAGEM QUE ATRAVESSA
// v2.2 (audit M01, M02). Measured on 8187680: the Domus waited as a 132 px sand ring, the message only faded (it did not
// travel), "Recomeçar" showed on the click, and on a phone the end state of the 1st send differed 18% from the next four
// (the button changed height and the page scrolled about 22 px) with "Confirmado: sábado" under the fold. Acceptance:
//  - at rest the symbol of the Domus is a thin outline (stroke ≤ 2 px on screen) next to its logo;
//  - the message travels the whole rail and stops at each of the five products (4 or more holds of 250 ms or longer);
//  - "Recomeçar" is not shown while the message runs, and is after it lands;
//  - on a phone the section fits one screen (≤ 760 px), the record is in view at the end, and five sends end on the same
//    scroll position and the same pixels.
import { expect, test, type Page } from "@playwright/test";

const SECTION = "#message";

async function toSection(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await page
    .locator(SECTION)
    .evaluate((n) => n.scrollIntoView({ block: "start", behavior: "instant" }));
  await page.waitForTimeout(400);
}

test("desktop: outline at rest, the message travels with stops, Recomeçar only at the end", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toSection(page);
  const ring = await page.evaluate((sel) => {
    const rect = document.querySelector<SVGRectElement>(`${sel} svg rect`)!;
    const svg = rect.ownerSVGElement!;
    const k = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    return parseFloat(getComputedStyle(rect).strokeWidth) * k;
  }, SECTION);
  console.log(`ring stroke at rest: ${ring.toFixed(2)} px`);
  expect(ring).toBeLessThanOrEqual(2);

  // Sample the left of the travelling message every frame for 6 s
  const samples = page.evaluate((sel) => {
    const token = document.querySelector<HTMLElement>(
      `${sel} li[aria-hidden] > span:last-child`,
    )!;
    const rail = token.parentElement!;
    return new Promise<number[][]>((done) => {
      const out: number[][] = [];
      const t0 = performance.now();
      const tick = () => {
        const r = rail.getBoundingClientRect();
        const t = token.getBoundingClientRect();
        out.push([
          performance.now() - t0,
          (t.left + t.width / 2 - r.left) / r.width,
          Number(getComputedStyle(token).opacity),
        ]);
        if (performance.now() - t0 < 6000) requestAnimationFrame(tick);
        else done(out);
      };
      requestAnimationFrame(tick);
    });
  }, SECTION);
  await page.locator(`${SECTION} label[for="msg-go"]`).click();
  await page.waitForTimeout(2500);
  const mid = await page
    .locator(`${SECTION} label[for="msg-go"] [data-on]`)
    .evaluate((el) => getComputedStyle(el).visibility);
  const s = await samples;
  // Holds: runs of frames with the message visible and still (within 0.2% of the rail) for 250 ms or more
  let holds = 0;
  let start = 0;
  for (let i = 1; i < s.length; i++) {
    const still = Math.abs(s[i][1] - s[i - 1][1]) < 0.002 && s[i][2] > 0.5;
    if (!still) {
      if (s[i - 1][0] - s[start][0] >= 250 && s[start][2] > 0.5) holds++;
      start = i;
    }
  }
  if (s.at(-1)![0] - s[start][0] >= 250 && s[start][2] > 0.5) holds++;
  const reach = Math.max(...s.filter((x) => x[2] > 0.5).map((x) => x[1]));
  console.log(
    `holds ${holds}, reach ${(reach * 100).toFixed(0)}%, Recomeçar at 2.5 s: ${mid}`,
  );
  expect(holds).toBeGreaterThanOrEqual(4);
  expect(reach).toBeGreaterThan(0.95);
  expect(mid).toBe("hidden");
  await page.waitForTimeout(1500);
  await expect(
    page.locator(`${SECTION} label[for="msg-go"] [data-on]`),
  ).toBeVisible();
});

test("phone: one screen, the record in view, five sends end the same", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 375, height: 812 });
  await toSection(page);
  const height = await page
    .locator(SECTION)
    .evaluate((el) => el.getBoundingClientRect().height);
  console.log(`section height at 375: ${Math.round(height)} px`);
  expect(height).toBeLessThanOrEqual(760);
  const ends: { y: number; shot: string; record: boolean }[] = [];
  for (let run = 0; run < 5; run++) {
    await page.locator(`${SECTION} label[for="msg-go"]`).click();
    await page.waitForTimeout(7000);
    const y = await page.evaluate(() => Math.round(scrollY));
    const record = await page.evaluate((sel) => {
      // The element whose own text is the confirmation
      const el = [...document.querySelectorAll(`${sel} *`)].find((n) =>
        [...n.childNodes].some(
          (c) =>
            c.nodeType === 3 && c.textContent?.trim() === "Confirmado: sábado",
        ),
      )!;
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight;
    }, SECTION);
    const shot = (await page.locator(SECTION).screenshot()).toString("base64");
    ends.push({ y, shot, record });
    // Back to rest for the next send
    await page.locator(`${SECTION} label[for="msg-go"]`).click();
    await page.waitForTimeout(400);
  }
  console.log(
    `ends: y ${ends.map((e) => e.y).join(",")}, record in view ${ends.map((e) => e.record).join(",")}, distinct frames ${new Set(ends.map((e) => e.shot)).size}`,
  );
  expect(new Set(ends.map((e) => e.y)).size).toBe(1);
  expect(ends.every((e) => e.record)).toBe(true);
  expect(new Set(ends.map((e) => e.shot)).size).toBe(1);
});

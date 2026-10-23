// HOME V4: GEOMETRIA E COMPORTAMENTO DOS TRÊS BLOCOS
// brief-v4 (2026-10-23), artboards Main, Chain and Accordion. Measured on the running page (PORTFOLIO_PREVIEW_URL):
//  - the opening: the title is the h1, the controls are the lib's 40 px, the frame sits centred in its well with equal
//    insets, the five marks share one line, the stage turns to the next product after its cycle, and under reduced
//    motion it stays on the Domus with no blades;
//  - the chain: the scroll walks it (no pinning: the stage scrolls with the page), from the message to the settled
//    order, and scrolling back undoes it; the stations share one column width and equal gaps, the stage has equal
//    insets, the 1st, 3rd and 5th sit lower; on a phone they stack with equal insets;
//  - the accordion: at rest the Domus is the wide panel, the pointer moves the width to another one by flex-grow (never a
//    scale), the open face shows its frame and the Relloo answer keeps its box while it types; on a phone the panels
//    stack at full width and the "+" opens one at a time;
//  - no width overflows the window at 1440, 1024 and 375.
import { expect, test, type Page } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

const box = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        r: r.right,
        b: r.bottom,
      };
    });

test.describe("the v4 home", () => {
  test.setTimeout(90_000);

  for (const vp of VIEWPORTS) {
    test(`no overflow and 40 px controls at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.locator("[data-hub='blades']").waitFor();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(0);
      const heights = await page
        .locator(
          "#intro [data-slot='button'], #products [data-panel] [data-slot='button']",
        )
        .evaluateAll((els) =>
          els
            .filter((e) => (e as HTMLElement).offsetParent)
            .map((e) => e.getBoundingClientRect().height),
        );
      expect(heights.length).toBeGreaterThan(1);
      for (const h of heights) expect(h).toBeGreaterThanOrEqual(39.5);
    });
  }

  test("the opening: the frame centred in its well, the marks on one line, the stage turns", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    expect(await page.locator("#intro h1").count()).toBe(1);
    const well = await box(page, "[data-hub='blades'] [data-mini]");
    const frame = await box(page, "[data-hub='blades'] [data-frame]");
    const left = frame.x - well.x;
    const right = well.r - frame.r;
    const top = frame.y - well.y;
    const bottom = well.b - frame.b;
    expect(
      Math.abs(left - right),
      `insets ${left} / ${right}`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(top - bottom),
      `insets ${top} / ${bottom}`,
    ).toBeLessThanOrEqual(1);
    expect(Math.abs(top - left)).toBeLessThanOrEqual(1);
    const marks = await page
      .locator("[data-hub='blades'] ul[aria-label] img")
      .evaluateAll((els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().bottom)),
      );
    expect(marks).toHaveLength(5);
    expect(new Set(marks).size).toBe(1);
    // The cycle: the Domus first, the Relloo after ~7 s
    await expect(page.locator("[data-hub='blades']")).toHaveAttribute(
      "data-product",
      "domus",
    );
    await expect(page.locator("[data-hub='blades']")).toHaveAttribute(
      "data-product",
      "relloo",
      { timeout: 9_000 },
    );
  });

  test("the opening under reduced motion stays on the Domus, with no blades", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(8_000);
    await expect(page.locator("[data-hub='blades']")).toHaveAttribute(
      "data-product",
      "domus",
    );
    expect(
      await page
        .locator("[data-hub='blades'] [data-mini] > div")
        .nth(1)
        .evaluate((el) => getComputedStyle(el).display),
    ).toBe("none");
  });

  test("the chain follows the scroll, with no pinning, and undoes going up", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const chain = page.locator("[data-chain]");
    const scrollAt = async (share: number) => {
      const top = await chain.evaluate(
        (el) => el.getBoundingClientRect().top + scrollY,
      );
      await page.evaluate(
        (y) => window.scrollTo(0, y),
        top - 900 * 0.7 + 900 * 0.9 * share,
      );
      await page.waitForTimeout(250);
    };
    await scrollAt(-0.2);
    await expect(chain).toHaveAttribute("data-step", "0");
    await expect(
      page.locator("[data-chain] [data-station='tuner']"),
    ).toHaveAttribute("data-state", "live");
    // Never pinned: the stage moves with the page
    const before = await box(page, "[data-chain]");
    await scrollAt(0.5);
    await expect(chain).toHaveAttribute("data-step", "2");
    const after = await box(page, "[data-chain]");
    expect(before.y - after.y).toBeGreaterThan(300);
    expect(
      await page.locator("[data-chain] svg[data-state='live']").count(),
    ).toBeGreaterThanOrEqual(1);
    await scrollAt(1.2);
    await expect(chain).toHaveAttribute("data-step", "5");
    await expect(page.locator("[data-chain] [data-record]")).toBeVisible();
    await scrollAt(0.1);
    await expect(chain).toHaveAttribute("data-step", "0");
    expect(await page.locator("[role='progressbar']").count()).toBe(0);
  });

  test("the chain stations: equal columns, equal gaps, equal insets, the zigzag", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const stage = await box(page, "[data-chain]");
    const st = await page
      .locator("[data-chain] [data-station]")
      .evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { x: r.left, r: r.right, y: r.top, w: r.width };
        }),
      );
    expect(st).toHaveLength(5);
    for (const s of st) expect(Math.abs(s.w - st[0].w)).toBeLessThanOrEqual(1);
    const gaps = st.slice(1).map((s, i) => s.x - st[i].r);
    for (const g of gaps) expect(Math.abs(g - gaps[0])).toBeLessThanOrEqual(1);
    expect(
      Math.abs(st[0].x - stage.x - (stage.r - st[4].r)),
    ).toBeLessThanOrEqual(1);
    expect(st[0].y - st[1].y).toBeCloseTo(80, 0);
    expect(st[2].y).toBeCloseTo(st[0].y, 0);
    expect(st[4].y).toBeCloseTo(st[0].y, 0);
  });

  test("the chain on a phone: the stations stack at one width, with equal insets", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const stage = await box(page, "[data-chain]");
    const st = await page
      .locator("[data-chain] [data-station]")
      .evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { x: r.left, r: r.right, y: r.top };
        }),
      );
    for (const s of st) {
      expect(Math.abs(s.x - stage.x - (stage.r - s.r))).toBeLessThanOrEqual(1);
      expect(Math.abs(s.x - st[0].x)).toBeLessThanOrEqual(0.5);
    }
    for (let i = 1; i < st.length; i++)
      expect(st[i].y).toBeGreaterThan(st[i - 1].y);
  });

  test("the accordion: the Domus wide at rest, the pointer moves the width by flex-grow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const panel = (slug: string) => `#products [data-panel="${slug}"]`;
    await page.locator("#products").scrollIntoViewIfNeeded();
    await page.mouse.move(5, 5);
    const domus = await box(page, panel("domus"));
    const relloo = await box(page, panel("relloo"));
    expect(domus.w / relloo.w).toBeGreaterThan(4.5);
    expect(
      await page
        .locator(panel("domus"))
        .evaluate((el) => getComputedStyle(el).transform),
    ).toBe("none");
    // The "+" of a phone is not drawn on a desktop
    expect(
      await page
        .locator(`${panel("domus")} [data-slot='button'][data-size='icon']`)
        .isVisible(),
    ).toBe(false);
    await page.hover(panel("relloo"));
    await page.waitForTimeout(1_000);
    const domus2 = await box(page, panel("domus"));
    const relloo2 = await box(page, panel("relloo"));
    expect(relloo2.w / domus2.w).toBeGreaterThan(4.5);
    expect(
      await page
        .locator(panel("relloo"))
        .evaluate((el) => getComputedStyle(el).flexGrow),
    ).toBe("6");
    await expect(
      page.locator(`${panel("relloo")} [data-frame="relloo"]`),
    ).toBeVisible();
    // The answer types into a box that is already its final size
    const bubble = page.locator(`${panel("relloo")} [data-type-in]`).first();
    const h1 = await bubble.evaluate(
      (el) => el.parentElement!.getBoundingClientRect().height,
    );
    await page.waitForTimeout(1_500);
    const h2 = await bubble.evaluate(
      (el) => el.parentElement!.getBoundingClientRect().height,
    );
    expect(h2).toBe(h1);
    // Every panel shares the row's height and top
    const tops = await page
      .locator("#products [data-panel]")
      .evaluateAll((els) =>
        els.map((e) => [
          Math.round(e.getBoundingClientRect().top),
          Math.round(e.getBoundingClientRect().height),
        ]),
      );
    for (const t of tops) expect(t).toEqual(tops[0]);
  });

  test("the accordion on a phone: stacked at full width, the + opens one at a time", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const panels = page.locator("#products [data-panel]");
    const xs = await panels.evaluateAll((els) =>
      els.map((e) => [
        Math.round(e.getBoundingClientRect().left),
        Math.round(e.getBoundingClientRect().width),
      ]),
    );
    for (const x of xs) expect(x).toEqual(xs[0]);
    await expect(
      page.locator('#products [data-panel="domus"]'),
    ).toHaveAttribute("data-phone-open", "true");
    await page
      .locator(
        '#products [data-panel="relloo"] [data-slot="button"][data-size="icon"]',
      )
      .click();
    await expect(
      page.locator('#products [data-panel="relloo"]'),
    ).toHaveAttribute("data-phone-open", "true");
    expect(await page.locator("#products [data-phone-open]").count()).toBe(1);
    await expect(
      page.locator('#products [data-panel="relloo"] [data-frame="relloo"]'),
    ).toBeVisible();
  });
});

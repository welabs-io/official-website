// INTERAÇÕES DA V2
// The visitor plays the page: pointing at a product lights its ties and its stamp, the word of the title turns with the
// stage, the message dragged onto the track (or sent with the button) walks through the five products to the phone,
// "+ Sua área" makes a new room in the Domus, and every product page has its own play. Each one is a native control
// with a visible label, so the keyboard reaches it too; under reduced motion nothing runs and the final frame shows.
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

const opacity = (page: Page, selector: string) =>
  page.evaluate(
    (sel) =>
      [...document.querySelectorAll(sel)].map((el) =>
        Number(getComputedStyle(el).opacity),
      ),
    selector,
  );

test("pointing at a product lights its ties and its stamp, and stops the cycle", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" });
  const orbit = page.locator('#intro [data-orbit="cycle"]');
  await orbit.locator('[data-p="tuner"]').hover();
  await page.waitForTimeout(200);
  const tuner = await opacity(page, '#intro [data-orbit] [data-of="tuner"]');
  const others = await opacity(
    page,
    '#intro [data-orbit] [data-of]:not([data-of="tuner"])',
  );
  expect(tuner.length).toBeGreaterThan(2);
  expect(tuner.every((o) => o === 1)).toBe(true);
  expect(others.every((o) => o === 0)).toBe(true);
  await expect(orbit.locator('span[data-of="tuner"]')).toBeVisible();
});

test("the word of the title turns with the stage", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const track = page.locator("#intro h1 span[aria-hidden]");
  const at = () =>
    track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
  expect(await at()).toBe(0);
  // One word every 2.5 s
  await expect.poll(at, { timeout: 5000 }).toBeLessThan(0);
});

test("the message sent with the button walks through the five products to the phone", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" });
  await page.locator("#message").scrollIntoViewIfNeeded();
  await page.getByText("Enviar a mensagem").click();
  await expect(page.locator("#msg-go")).toBeChecked();
  await page.waitForTimeout(6500);
  const phone = await opacity(page, "#message [aria-hidden] span");
  expect(Math.max(...phone)).toBe(1);
  await expect(page.getByText("Recomeçar")).toBeVisible();
});

test("the message dragged onto the track is sent", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  await page.locator("#message").scrollIntoViewIfNeeded();
  const bubble = page.locator("#message [data-drag]");
  const track = page.locator("#msg-track");
  await bubble.dragTo(track);
  await expect(page.locator("#msg-go")).toBeChecked();
});

test("'+ Sua área' makes a new room in the Domus, and the keyboard does it too", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" });
  await page.locator("#domus").scrollIntoViewIfNeeded();
  await page.locator('label[for="area-add"]').click();
  await expect(page.locator("#area-add")).toBeChecked();
  await expect(page.locator('label[for="area-add"]')).toContainText("Vistorias");
  await page.locator("#area-add").focus();
  await page.keyboard.press("Space");
  await expect(page.locator("#area-add")).not.toBeChecked();
});

test.describe("one play per product", () => {
  test("domus: a field dragged onto the table becomes a column", async ({
    page,
  }) => {
    await page.goto("/products/domus", { waitUntil: "load" });
    const play = page.locator('[data-descent-slot] [data-play="domus"]');
    await play.scrollIntoViewIfNeeded();
    await play.locator("[data-drag]").dragTo(page.locator("#field-table"));
    await expect(page.locator("#field-add")).toBeChecked();
    await expect(play.locator("th").last()).toBeVisible();
    await expect(play.locator("th").last()).toHaveText("Foto");
  });
  test("relloo: a channel lands in the conversation of the same person", async ({
    page,
  }) => {
    await page.goto("/products/relloo", { waitUntil: "load" });
    const play = page.locator('[data-play="relloo"]');
    await play.scrollIntoViewIfNeeded();
    await expect(play.locator('[data-ch="call"]').last()).toBeHidden();
    await play.locator('label[for="ch-call"]').click();
    await expect(play.locator('li[data-ch="call"]')).toBeVisible();
  });
  test("magneto: the flow waits for the approval and then goes on", async ({
    page,
  }) => {
    await page.goto("/products/magneto", { waitUntil: "load" });
    const play = page.locator('[data-play="magneto"]');
    await play.scrollIntoViewIfNeeded();
    await play.getByText("Aprovar", { exact: true }).click();
    await expect(page.locator("#flow-ok")).toBeChecked();
    await page.waitForTimeout(1600);
    const last = await play
      .locator('li[data-step="3"] span')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(last).toBe("rgb(31, 138, 76)");
  });
  test("tuner: an option of the menu sends the call to the right person, recorded", async ({
    page,
  }) => {
    await page.goto("/products/tuner", { waitUntil: "load" });
    const play = page.locator('[data-play="tuner"]');
    await play.scrollIntoViewIfNeeded();
    await play.locator('label[for="ivr-2"]').click();
    await expect(play.locator('li[data-key="2"] span').last()).toBeVisible();
    await expect(play.locator('li[data-key="1"] span').last()).toBeHidden();
  });
  test("knowly: an answer with its source, and a source that stays closed", async ({
    page,
  }) => {
    await page.goto("/products/knowly", { waitUntil: "load" });
    const play = page.locator('[data-play="knowly"]');
    await play.scrollIntoViewIfNeeded();
    await expect(play.locator('[data-ask="0"]').last()).toBeVisible();
    await play.locator('label[for="ask-2"]').click();
    await expect(play.locator('div[data-ask="2"]')).toBeVisible();
    await expect(play.locator('div[data-ask="2"]')).toContainText(
      "não tem acesso",
    );
  });
});

test("on a phone the fitted pieces stay inside their stage and the bar shows under the first word", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "load" });
  const g = await page.evaluate(() => {
    const stage = document.querySelector("#chain [role=img]")!;
    const box = stage.getBoundingClientRect();
    const word = document.querySelector("#intro h1 span[aria-hidden] span")!;
    return {
      out: [...stage.children].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.left < box.left || r.right > box.right;
      }).length,
      bar: getComputedStyle(word, "::after").zIndex,
      isolated: getComputedStyle(word).isolation,
    };
  });
  expect(g.out).toBe(0);
  expect(g.isolated).toBe("isolate");
  await context.close();
});

test("under reduced motion nothing runs: the Domus is lit, the pieces fitted, the first word shown", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const state = await page.evaluate(() => ({
    running: document
      .getAnimations()
      .filter((a) =>
        (a.effect as KeyframeEffect | null)?.target instanceof Element
          ? ((a.effect as KeyframeEffect).target as Element).closest(
              "#intro, #chain",
            )
          : false,
      ).length,
    domus: [...document.querySelectorAll('#intro [data-of="domus"]')].map(
      (el) => Number(getComputedStyle(el).opacity),
    ),
    pieces: [...document.querySelectorAll("#chain [data-p]")].map((el) =>
      Number(getComputedStyle(el).opacity),
    ),
  }));
  expect(state.running).toBe(0);
  expect(state.domus.every((o) => o === 1)).toBe(true);
  expect(state.pieces.every((o) => o === 1)).toBe(true);
  await context.close();
});

// INTERAÇÕES DA V2.1
// The visitor plays the page: pointing at a product lights it, its tie and its line in the record of the Domus (v2.1:
// the stage is a grid, the effect lights in the record instead of a floating stamp), the word of the title turns with
// the stage, the message dragged onto the track (or sent with the button) walks through the five products and lands in
// the Domus that forms, "+ Novo módulo" makes a new module in the house of the Domus, and every product page has its own
// play. Each one is a native control with a visible label, so the keyboard reaches it too; under reduced motion nothing
// runs and the final frame shows.
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

// The opacity of the lit layer of every piece of the stage: `::after` of a card, `::before` of a line of the record and,
// since v2.2, the lit copy of the SVG curve of a tie (its second path)
const lit = (page: Page, selector: string) =>
  page.evaluate(
    (sel) =>
      [...document.querySelectorAll(sel)].map((el) => {
        const hot = el.querySelector("svg path:nth-of-type(2)");
        if (hot) return Number(getComputedStyle(hot).opacity);
        return Number(
          getComputedStyle(
            el,
            el.hasAttribute("data-p") ? "::after" : "::before",
          ).opacity,
        );
      }),
    selector,
  );

test("pointing at a product lights it, its tie and its line in the record, and stops the cycle", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" });
  const stage = page.locator('#intro [data-hub="cycle"]');
  await stage.locator('[data-p="tuner"]').hover();
  await page.waitForTimeout(400);
  // The card, its tie and its line of the record
  const tuner = await lit(
    page,
    '#intro [data-hub] :is([data-p="tuner"], [data-of="tuner"])',
  );
  const others = await lit(
    page,
    '#intro [data-hub] :is([data-p]:not([data-p="tuner"]), [data-of]:not([data-of="tuner"]))',
  );
  expect(tuner.length).toBe(3);
  expect(tuner.every((o) => o === 1)).toBe(true);
  expect(others.every((o) => o === 0)).toBe(true);
  await expect(stage.locator('[data-of="tuner"]').last()).toContainText(
    "Ligação gravada",
  );
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

test("the message sent with the button walks through the five products and lands in the Domus", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" });
  await page.locator("#message").scrollIntoViewIfNeeded();
  await page.getByText("Enviar a mensagem").click();
  await expect(page.locator("#msg-go")).toBeChecked();
  await page.waitForTimeout(7000);
  // The Domus formed: the outline in ink, the amber square in, the record of the order confirmed
  const domus = await page.evaluate(() => {
    const rects = document.querySelectorAll("#message svg rect");
    return {
      ring: getComputedStyle(rects[0]).stroke,
      square: Number(getComputedStyle(rects[rects.length - 1]).opacity),
    };
  });
  expect(domus).toEqual({ ring: "rgb(28, 26, 22)", square: 1 });
  await expect(
    page.locator("#message").getByText("Confirmado: sábado"),
  ).toBeVisible();
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

test("'+ Novo módulo' makes a new module in the Domus, with its seal, and the keyboard does it too", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" });
  await page.locator("#domus").scrollIntoViewIfNeeded();
  await expect(page.locator('label[for="area-add"]')).toContainText(
    "Novo módulo",
  );
  // Pilot of the lib (2026-10-21): the button only restarts the new module (it loops on its own; e2e/domus.spec.ts),
  // so each press, by pointer or keyboard, sends it back to its first frame and it is born again with its seal
  const slot = page.locator("#domus li[aria-label='Vistorias']");
  const born = () =>
    slot.evaluate((li) => Number(getComputedStyle(li.children[1]).opacity));
  await page.locator('label[for="area-add"]').click();
  await expect(page.locator("#area-add")).toBeChecked();
  expect(await born()).toBeLessThan(0.5);
  await expect.poll(born, { timeout: 3000 }).toBeGreaterThan(0.9);
  await expect(slot.locator("[data-slot='badge']")).toHaveText("Novo módulo");
  await page.locator("#area-add").focus();
  await page.keyboard.press("Space");
  await expect(page.locator("#area-add")).not.toBeChecked();
  expect(await born()).toBeLessThan(0.5);
  await expect.poll(born, { timeout: 3000 }).toBeGreaterThan(0.9);
});

// v2.2: the play of each product page (a chain of states with a choice, a record and the effect on the Domus) is
// accepted by e2e/plays.spec.ts

test("on a phone the pieces of the stage stay inside it and the bar shows under the first word", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "load" });
  const g = await page.evaluate(() => {
    // v2.1: the film of the fitting pieces (#chain) left; the stage of the opening is the one that must fit a phone
    const stage = document.querySelector("#intro [role=group]")!;
    const box = stage.getBoundingClientRect();
    const word = document.querySelector("#intro h1 span[aria-hidden] span")!;
    return {
      // The pieces drawn on a phone (the ties have no room there and are not drawn)
      out: [...stage.children].filter((el) => {
        if (getComputedStyle(el).display === "none") return false;
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

test("under reduced motion nothing runs: the Domus is lit and the first word shown", async ({
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
          ? ((a.effect as KeyframeEffect).target as Element).closest("#intro")
          : false,
      ).length,
    // The record of the Domus lit and its line of the Domus lit; no product lit
    domus: [
      Number(
        getComputedStyle(
          document.querySelector('#intro [data-p="domus"]')!,
          "::after",
        ).opacity,
      ),
      Number(
        getComputedStyle(
          document.querySelector('#intro [data-of="domus"]')!,
          "::before",
        ).opacity,
      ),
    ],
    products: [
      ...document.querySelectorAll('#intro [data-p]:not([data-p="domus"])'),
    ].map((el) => Number(getComputedStyle(el, "::after").opacity)),
    word: new DOMMatrix(
      getComputedStyle(document.querySelector("#intro h1 span[aria-hidden]")!)
        .transform,
    ).m42,
  }));
  expect(state.running).toBe(0);
  expect(state.domus).toEqual([1, 1]);
  expect(state.products.every((o) => o === 0)).toBe(true);
  expect(state.word).toBe(0);
  await context.close();
});

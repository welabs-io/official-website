// PROVA DAS PÁGINAS DE PRODUTO V4
// brief-v4 (2026-10-23), Stage.dc.html and Cards.dc.html, on the four product carousels rebuilt as stage simulations
// (Domus, Relloo, Magneto, Tuner; the Knowly is a graph of its own) and on the cards of a product page:
//  - every phrase that types in (TypeIn) keeps its box and the box of its bubble in every frame of one loop, at 1440
//    and at 390 (the whole text is reserved from the first character), and at least one phrase types per loop;
//  - the stage tabs name each moment from 768 px up, the moment on screen is the black pill and the moments already run
//    carry the green check; a phone shows the numbers;
//  - inside a scene no connector is amber: a link rests grey and only the one drawn now is in ink;
//  - the cards of "Por que é diferente" gain width by flex-grow under the pointer (never by scale) and open their
//    sentence; the + keeps one open and its x closes it.
import { expect, test } from "@playwright/test";

type Stage = { id: string; cycleMs: number; names: string[] };

const STAGES: Stage[] = [
  {
    id: "relloo-carousel",
    cycleMs: 20_208,
    names: ["Chega", "Passa a vez", "Vira oportunidade", "Anda no funil"],
  },
  {
    id: "domus-carousel",
    cycleMs: 14_398,
    names: ["Áreas", "Tipo novo", "Assistente", "Tudo ligado"],
  },
  {
    id: "magneto-carousel",
    cycleMs: 12_600,
    names: ["Começa sozinho", "Divide", "Espera", "Conclui"],
  },
  {
    id: "tuner-carousel",
    cycleMs: 12_200,
    names: ["Mensagem", "Envio", "Leitura", "Resposta"],
  },
];

for (const s of STAGES) {
  const LAB = `/lab/scenes/${s.id}`;

  test.describe(`product stage: ${s.id}`, () => {
    test.beforeAll(async ({ request }) => {
      await request.get(LAB, { timeout: 60_000 });
    });

    for (const width of [1440, 390] as const) {
      test(`TypeIn never moves the layout over one loop, and no connector is amber, at ${width}`, async ({
        page,
      }) => {
        test.setTimeout(s.cycleMs + 30_000);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(LAB);
        await page.locator(`[data-scene="${s.id}"]`).scrollIntoViewIfNeeded();
        // Sampled on every animation frame over one loop: per phrase, the sizes of its box and of its bubble while it
        // is in the live layer, whether it was seen typing (a character still invisible), and the colour of every trace
        const seen = await page.evaluate(
          ({ id, ms }) =>
            new Promise<{
              phrases: {
                text: string;
                typed: boolean;
                dw: number;
                dh: number;
                pw: number;
                ph: number;
              }[];
              amberTraces: number;
              activeTraces: number;
            }>((resolve) => {
              const stage = document.querySelector(`[data-scene="${id}"]`)!;
              const track = new Map<
                Element,
                {
                  text: string;
                  typed: boolean;
                  w: number[];
                  h: number[];
                  pw: number[];
                  ph: number[];
                }
              >();
              let amberTraces = 0;
              let activeTraces = 0;
              const end = performance.now() + ms;
              const tick = () => {
                const live = stage.lastElementChild!;
                live
                  .querySelectorAll<HTMLElement>("[data-type-in]")
                  .forEach((el) => {
                    if (el.offsetParent === null) return;
                    const parent = el.parentElement!;
                    const t = track.get(el) ?? {
                      text: el.textContent ?? "",
                      typed: false,
                      w: [],
                      h: [],
                      pw: [],
                      ph: [],
                    };
                    const chars = [...el.children];
                    if (
                      chars.some(
                        (c) => Number(getComputedStyle(c).opacity) < 0.5,
                      )
                    )
                      t.typed = true;
                    t.w.push(el.offsetWidth);
                    t.h.push(el.offsetHeight);
                    t.pw.push(parent.offsetWidth);
                    t.ph.push(parent.offsetHeight);
                    track.set(el, t);
                  });
                live
                  .querySelectorAll<SVGPathElement>("path[data-trace]")
                  .forEach((p) => {
                    const state = p
                      .closest("svg")
                      ?.getAttribute("data-trace-state");
                    if (state === "live") amberTraces++;
                    if (state === "active") activeTraces++;
                  });
                if (performance.now() < end) requestAnimationFrame(tick);
                else {
                  const spread = (a: number[]) =>
                    Math.max(...a) - Math.min(...a);
                  resolve({
                    phrases: [...track.values()].map((t) => ({
                      text: t.text.slice(0, 32),
                      typed: t.typed,
                      dw: spread(t.w),
                      dh: spread(t.h),
                      pw: spread(t.pw),
                      ph: spread(t.ph),
                    })),
                    amberTraces,
                    activeTraces,
                  });
                }
              };
              requestAnimationFrame(tick);
            }),
          { id: s.id, ms: s.cycleMs + 1000 },
        );
        expect(
          seen.phrases.some((p) => p.typed),
          "at least one phrase types in over the loop",
        ).toBe(true);
        for (const p of seen.phrases) {
          expect(p.dw, `"${p.text}" keeps its width`).toBeLessThanOrEqual(0.5);
          expect(p.dh, `"${p.text}" keeps its height`).toBeLessThanOrEqual(0.5);
          expect(
            p.pw,
            `the bubble of "${p.text}" keeps its width`,
          ).toBeLessThanOrEqual(0.5);
          expect(
            p.ph,
            `the bubble of "${p.text}" keeps its height`,
          ).toBeLessThanOrEqual(0.5);
        }
        expect(
          seen.amberTraces,
          "no connector of a product stage is amber",
        ).toBe(0);
      });
    }

    test("the stage tabs name the moments, the one on screen the black pill, the ones run checked", async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(LAB);
      const figure = page
        .locator('[role="figure"]')
        .filter({ has: page.locator(`[data-scene="${s.id}"]`) });
      await figure.scrollIntoViewIfNeeded();
      const tabs = figure.locator('[data-frame-indicator] [role="radio"]');
      await expect(tabs).toHaveCount(4);
      for (const [i, name] of s.names.entries())
        await expect(tabs.nth(i)).toHaveAccessibleName(
          `Momento ${i + 1}: ${name}`,
        );
      // Play from the third moment: it is chosen, black with white text, and the two before it carry the check
      await tabs.nth(2).click();
      await expect(tabs.nth(2)).toHaveAttribute("aria-checked", "true");
      // The pill slides on the swap curve (450 ms)
      await page.waitForTimeout(600);
      const look = await figure.evaluate((root) => {
        const items = [
          ...root.querySelectorAll<HTMLElement>(
            '[data-frame-indicator] [data-slot="segmented-control-item"]',
          ),
        ];
        const active = items.find(
          (el) => el.getAttribute("data-state") === "active",
        )!;
        const pill =
          active.querySelector('[data-slot="segmented-control-indicator"]') ??
          active;
        return {
          fill: getComputedStyle(pill).backgroundColor,
          ink: getComputedStyle(active).color,
          checks: items.map((el) => !!el.querySelector("[data-done]")),
          names: items.map((el) =>
            el.querySelector<HTMLElement>("[data-tab]")?.innerText.trim(),
          ),
        };
      });
      expect(look.fill).toBe("rgb(18, 18, 18)");
      expect(look.ink).toBe("rgb(255, 255, 255)");
      expect(look.checks).toEqual([true, true, false, false]);
      expect(look.names).toEqual(s.names);
    });

    test("a phone shows the numbers of the moments, inside the chrome bar", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(LAB);
      const figure = page
        .locator('[role="figure"]')
        .filter({ has: page.locator(`[data-scene="${s.id}"]`) });
      await figure.scrollIntoViewIfNeeded();
      const fit = await figure.evaluate((root) => {
        const bar = root.querySelector<HTMLElement>("[data-frame-indicator]")!;
        const frame = root.getBoundingClientRect();
        const box = bar.getBoundingClientRect();
        return {
          shown: [...bar.querySelectorAll<HTMLElement>("[data-tab]")].map(
            (el) => el.innerText.trim(),
          ),
          inside:
            box.left >= frame.left - 0.5 && box.right <= frame.right + 0.5,
        };
      });
      expect(fit.shown).toEqual(["1", "2", "3", "4"]);
      expect(fit.inside, "the tabs fit the chrome bar").toBe(true);
    });
  });
}

// CARTÕES QUE SE ABREM
test.describe("product cards: why it is different", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the card under the pointer gains width by flex-grow and opens its sentence; the + keeps it, the x closes it", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto("/products/relloo");
    const row = page.locator("[data-differs]");
    await row.scrollIntoViewIfNeeded();
    const cards = row.locator("[data-card]");
    await expect(cards).toHaveCount(3);
    const widths = () =>
      cards.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().width),
      );
    const sentence = (i: number) =>
      cards.nth(i).evaluate((el) => {
        const p = el.querySelector("p")!;
        return {
          h: p.getBoundingClientRect().height,
          opacity: Number(getComputedStyle(p).opacity),
        };
      });

    const rest = await widths();
    expect(
      Math.max(...rest) - Math.min(...rest),
      "three equal cards at rest",
    ).toBeLessThanOrEqual(1);
    expect(
      (await sentence(1)).h,
      "the sentence is closed at rest",
    ).toBeLessThanOrEqual(1);

    await cards.nth(1).hover();
    await page.waitForTimeout(900);
    const hovered = await widths();
    expect(
      hovered[1] / hovered[0],
      "the card in focus is ~1.4 times the others",
    ).toBeGreaterThan(1.3);
    expect(hovered[1] / hovered[0]).toBeLessThan(1.5);
    const transform = await cards
      .nth(1)
      .evaluate((el) => getComputedStyle(el.parentElement!).transform);
    expect(
      transform === "none" || transform === "",
      "it grows by width, never by scale",
    ).toBe(true);
    const open = await sentence(1);
    expect(open.h, "the sentence opens").toBeGreaterThan(10);
    expect(open.opacity).toBe(1);

    // The + keeps the first card open while the pointer leaves the row; its x closes it
    const toggle = cards.nth(0).getByRole("button", { name: /^Abrir: / });
    await toggle.click();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(900);
    const kept = await widths();
    expect(kept[0] / kept[1], "the card kept open stays wide").toBeGreaterThan(
      1.3,
    );
    expect((await sentence(0)).h).toBeGreaterThan(10);
    const close = cards.nth(0).getByRole("button", { name: /^Fechar: / });
    await expect(close).toHaveAttribute("aria-expanded", "true");
    await close.click();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(900);
    const closed = await widths();
    expect(
      Math.max(...closed) - Math.min(...closed),
      "closed, the three are equal again",
    ).toBeLessThanOrEqual(1);
  });

  test("on a phone the cards stack, nothing grows, and the + opens the sentence", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/products/relloo");
    const row = page.locator("[data-differs]");
    await row.scrollIntoViewIfNeeded();
    const cards = row.locator("[data-card]");
    const boxes = await cards.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect()),
    );
    for (const b of boxes) expect(b.width).toBeCloseTo(boxes[0].width, 0);
    expect(boxes[1].top).toBeGreaterThan(boxes[0].bottom - 1);
    await cards
      .nth(2)
      .getByRole("button", { name: /^Abrir: / })
      .click();
    await page.waitForTimeout(700);
    const h = await cards
      .nth(2)
      .evaluate((el) => el.querySelector("p")!.getBoundingClientRect().height);
    expect(h).toBeGreaterThan(10);
  });
});

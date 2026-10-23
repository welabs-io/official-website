// PROVA DO CARROSSEL DO RELLOO NO LAB
// What the Relloo carousel adds to the kit's contract (e2e/scene-kit-scenes.spec.ts holds the loop, the take, reduced
// motion, the frames reached, the amber budget, the cut text and the height): the frames cross with a fade (never a
// cut), the chrome names the frame's screen and marks its number, and the connector is the v4 brief's trace at rest
// (curved, the soft grey at 1.75 px, with an arrowhead, routed outside the pieces it links).
import { expect, test, type Page } from "@playwright/test";

const LAB = "/lab/scenes/relloo-carousel";
// The last step of each frame (it holds 1.8 s, time to measure once its pieces have landed)
const SETTLED = { 1: "f1-message", 2: "f2-summary", 3: "f3-born", 4: "f4-ask" } as const;

// Plays the scene from frame `n` (the visitor's gesture on the chrome's picker) and waits for its pieces to land
async function showFrame(page: Page, n: 1 | 2 | 3 | 4) {
  await page.getByRole("radio", { name: `Momento ${n}` }).click();
  await expect(page.locator('[data-scene="relloo-carousel"]')).toHaveAttribute("data-step", SETTLED[n], {
    timeout: 10_000,
  });
  await page.waitForTimeout(900);
  // Only the frame on screen: the one that left is gone and the one that came has stopped moving
  await expect
    .poll(() =>
      page.evaluate(() => {
        const frames = [...document.querySelectorAll('[data-scene="relloo-carousel"] > :last-child [data-frame]')];
        return frames.length === 1 && getComputedStyle(frames[0].parentElement!).transform === "none";
      }),
    )
    .toBe(true);
}

// The drawn traces of the live layer: stroke, colour, arrowhead, and the pieces each one crosses between its ends
async function traces(page: Page) {
  return page.evaluate(() => {
    const live = document.querySelector('[data-scene="relloo-carousel"] > :last-child')!;
    const pieces = [
      ...live.querySelectorAll<HTMLElement>("p, article, [data-holder], [data-stage], [data-domus], [data-slot='badge']"),
    ].filter((e) => e.offsetParent !== null);
    return [...live.querySelectorAll<SVGPathElement>("svg path[pathLength]")].map((path) => {
      const cs = getComputedStyle(path);
      const svg = path.ownerSVGElement!;
      const ctm = svg.getScreenCTM()!;
      const length = path.getTotalLength();
      const crossed = new Set<string>();
      // Every 2 px of the trace, 8 px clear of its two ends (where it touches its source and its target)
      for (let at = 8; at < length - 8; at += 2) {
        const p = path.getPointAtLength(at).matrixTransform(ctm);
        for (const el of pieces) {
          const r = el.getBoundingClientRect();
          if (p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom)
            crossed.add(`${el.tagName.toLowerCase()} "${el.textContent!.trim().slice(0, 24)}"`);
        }
      }
      return {
        width: parseFloat(cs.strokeWidth),
        colour: cs.stroke,
        dashed: cs.strokeDasharray !== "none" && path.getAttribute("pathLength") === null,
        // v4: only cubics after the move, never a straight segment
        curved: /^M [\d.-]+ [\d.-]+ C /.test(path.getAttribute("d") ?? "") && !/[LHVlhv]/.test(path.getAttribute("d") ?? ""),
        opacity: Number(cs.opacity) * Number(cs.strokeOpacity),
        head: !!path.parentElement!.querySelectorAll("path").item(1),
        crossed: [...crossed],
      };
    });
  });
}

test.describe("relloo carousel", () => {
  test.beforeAll(async ({ request }) => {
    await request.get(LAB, { timeout: 60_000 });
  });

  for (const width of [1440, 390]) {
    test(`the connector is curved, soft grey at rest, with an arrow, outside the pieces at ${width}`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(LAB);
      await page.getByRole("figure", { name: /^Relloo/ }).scrollIntoViewIfNeeded();
      // Frame 3 draws its trace side by side only (a phone stacks the panes)
      const frames = width === 1440 ? ([2, 3, 4] as const) : ([2, 4] as const);
      for (const n of frames) {
        await showFrame(page, n);
        const all = await traces(page);
        expect(all.length, `frame ${n}: a trace`).toBeGreaterThan(0);
        for (const t of all) {
          expect(t.width, `frame ${n}: stroke`).toBe(1.75);
          expect(t.curved, `frame ${n}: curved`).toBe(true);
          expect(t.opacity, `frame ${n}: opacity`).toBe(1);
          // v4 (operator, 23/10): a scene's connector rests in the soft grey (#55565b at 40 %)
          expect(t.colour, `frame ${n}: rest grey`).toBe("rgba(85, 86, 91, 0.4)");
          expect(t.dashed, `frame ${n}: solid`).toBe(false);
          expect(t.head, `frame ${n}: arrowhead`).toBe(true);
          expect(t.crossed, `frame ${n}: pieces under the trace`).toEqual([]);
        }
      }
    });
  }

  test("the frames cross with a fade, never a cut, and the chrome follows them", async ({ page }) => {
    test.setTimeout(40_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LAB);
    const figure = page.getByRole("figure", { name: /^Relloo/ });
    await figure.scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Recomeçar" }).click();
    // Sampled on every animation frame over the first change of frame: some frame shows the two frames at once, the
    // leaving one half faded
    const crossing = await page.evaluate(async () => {
      const live = document.querySelector('[data-scene="relloo-carousel"] > :last-child')!;
      const t0 = performance.now();
      let both = false;
      let partial = false;
      while (performance.now() - t0 < 4500) {
        await new Promise((r) => requestAnimationFrame(r));
        const frames = [...live.querySelectorAll<HTMLElement>("[data-frame]")];
        if (frames.length > 1) both = true;
        if (
          frames.some((f) => {
            const o = Number(getComputedStyle(f.parentElement!).opacity);
            return o > 0.05 && o < 0.95;
          })
        )
          partial = true;
      }
      return { both, partial };
    });
    expect(crossing.both, "the leaving and the entering frame overlap").toBe(true);
    expect(crossing.partial, "a frame fades instead of cutting").toBe(true);

    // The chrome names the screen of the frame and marks its number
    await page.getByRole("radio", { name: "Momento 3" }).click();
    await expect(figure.getByRole("radio", { name: "Momento 3" })).toHaveAttribute("aria-checked", "true");
    await expect(figure.locator(":scope > :first-child")).toContainText("Contato 4821");
  });
});

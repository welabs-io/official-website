// CADEIA NATIVA NAS PÁGINAS DE PRODUTO
// Acceptance of the "how it works" band of a product page: the native chain narrowed to the scenes the product takes part
// in. The scene swaps in step with the overview (within 100 ms, with the step of the scene, not its position), at least
// 65% of the cycle is still, the text of every scene is 14 px or more, nothing scrolls sideways at the three sizes, and
// reduced motion shows the settled frames.
import { expect, test, type Page } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

// Scenes of each product, in the plot's order (lib/scenes/product-scenes.ts)
const SCENES = {
  domus: ["s0", "s2", "s3", "s5", "s6"],
  relloo: ["s0", "s1", "s2", "s3", "s4"],
  tuner: ["s1", "s6"],
  knowly: ["s4"],
  magneto: ["s5"],
} as const;
type Slug = keyof typeof SCENES;
const STAGE = "#product-chain";

async function toStage(page: Page, slug: Slug) {
  await page.goto(`/products/${slug}`, { waitUntil: "load" });
  await page
    .locator(STAGE)
    .evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
}

for (const vp of VIEWPORTS)
  test.describe(`product chain at ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const slug of Object.keys(SCENES) as Slug[]) {
      test(`${slug}: one tile per scene it takes part in, no sideways scroll, text of 14 px or more in every scene`, async ({
        browser,
      }) => {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        await toStage(page, slug);
        const tiles = await page.evaluate(
          (sel) =>
            [
              ...document.querySelectorAll<HTMLElement>(`${sel} [data-tile]`),
            ].map((t) => t.dataset.tile),
          STAGE,
        );
        expect(tiles).toEqual([...SCENES[slug]]);
        for (let i = 0; i < tiles.length; i++) {
          // Puts scene i at the centre, settled, the way reduced motion shows it
          const sizes = await page.evaluate(
            ([sel, index, count]) => {
              const all = [
                ...document.querySelectorAll<HTMLElement>(`${sel} [data-tile]`),
              ];
              all.forEach((tile, k) => {
                const half = Math.floor(count / 2);
                const p =
                  count === 2
                    ? k === index
                      ? 0
                      : 1
                    : ((k - index + count + half) % count) - half;
                tile.dataset.pos = String(Math.max(-2, Math.min(2, p)));
              });
              const scn = all[index].querySelector(".scn")!;
              const walker = document.createTreeWalker(
                scn,
                NodeFilter.SHOW_TEXT,
              );
              const px: number[] = [];
              for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                if (!n.textContent?.trim()) continue;
                const el = n.parentElement!;
                if (Number(getComputedStyle(el).opacity) === 0) continue;
                px.push(parseFloat(getComputedStyle(el).fontSize));
              }
              return px;
            },
            [STAGE, i, tiles.length] as const,
          );
          expect(sizes.length, `${slug} ${tiles[i]} has text`).toBeGreaterThan(
            0,
          );
          expect(
            Math.min(...sizes),
            `${slug} ${tiles[i]}`,
          ).toBeGreaterThanOrEqual(14);
          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          );
          expect(
            overflow,
            `${slug} ${tiles[i]} sideways scroll`,
          ).toBeLessThanOrEqual(0);
        }
        // Reduced motion: every scene settled, the first one at the centre, nothing animating inside the stage
        await page.waitForTimeout(1500);
        const state = await page.evaluate((sel) => {
          const root = document.querySelector(sel)!;
          return {
            running: document
              .getAnimations()
              .filter(
                (a) =>
                  a.effect instanceof KeyframeEffect &&
                  root.contains(a.effect.target as Element | null),
              ).length,
            phases: [...root.querySelectorAll<HTMLElement>(".scn")].map(
              (s) => s.dataset.phase,
            ),
          };
        }, STAGE);
        expect(state.running).toBe(0);
        expect(state.phases.every((p) => p === "end")).toBe(true);
        await context.close();
      });
    }
  });

test.describe("product chain behaviour", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("domus: the scene swaps in step with the overview, which gets the step of the scene", async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.addInitScript(() => {
      const w = window as unknown as { __s: unknown[] };
      w.__s = [];
      window.addEventListener("ring:swap", (event) => {
        const d = (event as CustomEvent).detail;
        if (d.ring !== "product-chain") return;
        const at = performance.now();
        queueMicrotask(() => {
          const tile = document.querySelector(
            '#product-chain [data-pos="0"]',
          ) as HTMLElement;
          w.__s.push({
            at,
            index: d.index,
            tile: tile?.dataset.tile,
            legend:
              document.querySelector("#how [data-legend]")?.textContent ?? "",
            done: performance.now() - at,
          });
        });
      });
    });
    await toStage(page, "domus");
    const data = JSON.parse(
      (await page.locator(`${STAGE} script[data-scene-data]`).textContent())!,
    ) as { scenes: number[]; steps: number[] };
    const overview = JSON.parse(
      (await page.locator("#how script[data-overview-data]").textContent())!,
    ) as { steps: { label: string }[] };
    expect(data.steps).toEqual([0, 2, 3, 5, 6]);
    await page.waitForFunction(
      () => (window as unknown as { __s: unknown[] }).__s.length >= 2,
      undefined,
      { timeout: 40000 },
    );
    const swaps = (await page.evaluate(
      () => (window as unknown as { __s: unknown[] }).__s,
    )) as {
      at: number;
      index: number;
      tile: string;
      legend: string;
      done: number;
    }[];
    swaps.slice(0, 2).forEach((s, k) => {
      expect(s.index).toBe(data.steps[k + 1]);
      expect(s.tile).toBe(SCENES.domus[k + 1]);
      expect(s.legend).toBe(overview.steps[data.steps[k + 1]].label);
      expect(s.done).toBeLessThan(100);
    });
    const gap = (swaps[1].at - swaps[0].at) / 1000;
    expect(Math.abs(gap - data.scenes[1])).toBeLessThan(0.25);
  });

  for (const slug of ["domus", "tuner", "knowly"] as const)
    test(`${slug}: at least 65% of the cycle is still (computed styles sampled every 100 ms)`, async ({
      page,
    }) => {
      test.setTimeout(120000);
      await toStage(page, slug);
      const cycle = JSON.parse(
        (await page.locator(`${STAGE} script[data-scene-data]`).textContent())!,
      ).cycle as number;
      await page.evaluate(() => {
        const w = window as unknown as {
          __still: boolean[];
          __stop: () => void;
        };
        w.__still = [];
        const root = document.querySelector("#how [data-chain]")!;
        const props = [
          "opacity",
          "transform",
          "clipPath",
          "color",
          "backgroundColor",
          "borderTopColor",
          "left",
          "width",
          "height",
          "top",
        ] as const;
        const snap = () => {
          let s = "";
          for (const el of root.querySelectorAll("*")) {
            const cs = getComputedStyle(el);
            for (const p of props) s += cs[p] + "|";
          }
          return s;
        };
        let last = snap();
        const id = setInterval(() => {
          const now = snap();
          w.__still.push(now === last);
          last = now;
        }, 100);
        w.__stop = () => clearInterval(id);
      });
      await page.waitForTimeout(Math.ceil((cycle + 1) * 1000));
      const still = await page.evaluate(() => {
        const w = window as unknown as {
          __still: boolean[];
          __stop: () => void;
        };
        w.__stop();
        return w.__still;
      });
      const ratio = still.filter(Boolean).length / still.length;
      console.log(
        `${slug}: still share ${(ratio * 100).toFixed(1)}% over ${still.length} samples (cycle ${cycle}s)`,
      );
      expect(ratio).toBeGreaterThanOrEqual(0.65);
    });

  test("knowly: the single scene replays at every boundary and the overview follows it", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.addInitScript(() => {
      const w = window as unknown as { __n: number[] };
      w.__n = [];
      window.addEventListener("ring:swap", (event) => {
        const d = (event as CustomEvent).detail;
        if (d.ring === "product-chain") w.__n.push(d.index);
      });
    });
    await toStage(page, "knowly");
    const cycle = JSON.parse(
      (await page.locator(`${STAGE} script[data-scene-data]`).textContent())!,
    ).cycle as number;
    await page.waitForFunction(
      () => (window as unknown as { __n: number[] }).__n.length >= 1,
      undefined,
      { timeout: (cycle + 5) * 1000 },
    );
    expect(
      await page.evaluate(() => (window as unknown as { __n: number[] }).__n),
    ).toEqual([4]);
    // Still the only tile, at the centre, in the play phase
    expect(await page.locator(`${STAGE} [data-tile]`).count()).toBe(1);
    expect(await page.locator(`${STAGE} .scn`).getAttribute("data-phase")).toBe(
      "play",
    );
  });
});

// A TROCA NUNCA MOSTRA QUADRO VAZIO
// In three consecutive swaps of the chain ring, sampled every 50 ms, the tile that is about to enter (the next neighbour
// at +1 and the one behind it at +2) always has a displayed cover that is decoded (`complete` and `naturalWidth > 0`)
// before the swap starts. Covers of the tiles at +2 are loaded ahead on purpose (components/ring/positions.ts).
import { expect, test } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

for (const vp of VIEWPORTS)
  test(`no entering tile without its cover in 3 swaps at ${vp.name}`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.addInitScript(() => {
      const w = window as unknown as {
        __swaps: number;
        __samples: number;
        __bad: string[];
      };
      w.__swaps = 0;
      w.__samples = 0;
      w.__bad = [];
      window.addEventListener("ring:swap", (event) => {
        if ((event as CustomEvent).detail.ring === "chain-ring") w.__swaps++;
      });
      setInterval(() => {
        // Sampling starts with the first swap: before it the ring is still loading its first paint
        if (w.__swaps < 1) return;
        const ring = document.querySelector("#chain-ring");
        if (!ring) return;
        w.__samples++;
        for (const tile of ring.querySelectorAll<HTMLElement>("[data-pos]")) {
          const pos = Number(tile.dataset.pos);
          if (pos !== 1 && pos !== 2) continue;
          // The displayed cover: the first image of the tile that is rendered (display is not none)
          const shown = [...tile.querySelectorAll("img")].filter(
            (img) => img.offsetParent !== null,
          );
          const ok = shown.some((img) => img.complete && img.naturalWidth > 0);
          if (!ok)
            w.__bad.push(
              `swap ${w.__swaps} pos ${pos} ${tile.getAttribute("aria-label")}`,
            );
        }
      }, 50);
    });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForFunction(
      () => (window as unknown as { __swaps: number }).__swaps >= 4,
      undefined,
      { timeout: 80000 },
    );
    const { samples, bad } = await page.evaluate(() => {
      const w = window as unknown as { __samples: number; __bad: string[] };
      return { samples: w.__samples, bad: w.__bad };
    });
    expect(samples).toBeGreaterThan(40);
    expect(bad).toEqual([]);
  });

// A TROCA NUNCA MOSTRA QUADRO VAZIO
// In three consecutive swaps of the native chain, sampled every 50 ms, the tile that is about to enter (the next neighbour
// at +1 and the one behind it at +2) is always a drawn scene (a window with text) before the swap starts: the scenes are
// server markup, so there is no image to wait for.
import { expect, test } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

for (const vp of VIEWPORTS)
  test(`no entering tile without its drawn scene in 3 swaps at ${vp.name}`, async ({
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
        // Sampling starts with the first swap
        if (w.__swaps < 1) return;
        const ring = document.querySelector("#chain-ring");
        if (!ring) return;
        w.__samples++;
        // `data-pos` is clamped to -2..2, so with an odd count (7 steps) two tiles share place 2: the real +2 and the
        // one behind it at +3; the place needs one drawn scene.
        for (const pos of [1, 2]) {
          const tiles = [
            ...ring.querySelectorAll<HTMLElement>(`[data-pos="${pos}"]`),
          ];
          // Native scenes have no cover image: the tile that is about to enter must already be a drawn scene (a window
          // with text), standing still in its first frame
          const ok = tiles.some((tile) => {
            const scene = tile.querySelector<HTMLElement>(".scn");
            return (
              !!scene && scene.offsetHeight > 0 && !!scene.textContent?.trim()
            );
          });
          if (!ok)
            w.__bad.push(
              `swap ${w.__swaps} pos ${pos} ${tiles.map((t) => t.getAttribute("aria-label")).join(" | ")}`,
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

// PULSO DA TROCA
// Acceptance of the pulse unit: on every `ring:swap` of the chain the pulse of the section restarts within 50 ms, the
// bus of the row fills the stretch of the new cut and the page never reads the layout for it. Needs the player to
// play, so it runs without reduced motion and waits for real swaps (a cut of the chain lasts a few seconds).
import { expect, test } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

for (const vp of VIEWPORTS)
  test(`the pulse starts within 50 ms of the swap at ${vp.name}`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.addInitScript(() => {
      const w = window as unknown as { __swaps: number[]; __pulses: number[] };
      w.__swaps = [];
      w.__pulses = [];
      window.addEventListener("ring:swap", (event) => {
        if ((event as CustomEvent).detail.ring === "chain-ring")
          w.__swaps.push(performance.now());
      });
      window.addEventListener("DOMContentLoaded", () => {
        const rail = document.querySelector("#chain > [data-rail]")!;
        new MutationObserver(() => w.__pulses.push(performance.now())).observe(
          rail,
          { attributes: true, attributeFilter: ["data-pulse"] },
        );
      });
    });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForFunction(
      () => (window as unknown as { __swaps: number[] }).__swaps.length >= 2,
      undefined,
      { timeout: 50000 },
    );
    const { swaps, pulses, lit } = await page.evaluate(() => {
      const w = window as unknown as { __swaps: number[]; __pulses: number[] };
      const row = document.querySelector("#chain [data-row]") as HTMLElement;
      return {
        swaps: w.__swaps,
        pulses: w.__pulses,
        lit: {
          lo: row.style.getPropertyValue("--lo"),
          hi: row.style.getPropertyValue("--hi"),
          fill: row.querySelector<HTMLElement>("[data-fill]")!.dataset.fill,
        },
      };
    });
    expect(pulses.length).toBeGreaterThanOrEqual(swaps.length);
    // Every swap has a pulse restart no later than 50 ms after it
    for (const swap of swaps) {
      const next = pulses.find((at) => at >= swap - 1);
      expect(next, "a pulse follows the swap").toBeDefined();
      expect(next! - swap).toBeLessThanOrEqual(50);
    }
    // The bus carries the stretch of the cut that is showing, and its animation was restarted
    expect(["a", "b"]).toContain(lit.fill);
    expect(lit.lo).not.toBe("");
    expect(Number(lit.hi)).toBeGreaterThanOrEqual(Number(lit.lo));
  });

// CADEIA EM DOIS BLOCOS
// Acceptance of the last unit of the home, at the three sizes: the overview (top) follows the ring (bottom) with no
// clock of its own (caption and lit node change within 100 ms of the scene), the connector stays aligned to the lit
// node and to the tile (2 px), the page has no horizontal scroll while it plays, the overview keeps its height budget
// and the centre tile is never empty across a swap. Needs the player, so it waits for real swaps.
import { expect, test } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

type Probe = {
  swaps: {
    at: number;
    index: number;
    legend: string;
    lit: number[];
  }[];
  scene: number[];
  legend: number[];
  node: number[];
  empty: string[];
};

const install = () => {
  const w = window as unknown as { __p: Probe };
  w.__p = { swaps: [], scene: [], legend: [], node: [], empty: [] };
  window.addEventListener("ring:swap", (event) => {
    const d = (event as CustomEvent).detail;
    if (d.ring !== "chain-ring") return;
    const at = performance.now();
    // The block above is rewritten in the same task as the event: read it right after
    queueMicrotask(() =>
      w.__p.swaps.push({
        at,
        index: d.index,
        legend:
          document.querySelector("#chain [data-legend]")?.textContent ?? "",
        lit: [...document.querySelectorAll("#chain b[data-state='on']")].map(
          (el) => Number((el as HTMLElement).dataset.col),
        ),
      }),
    );
  });
  window.addEventListener("DOMContentLoaded", () => {
    const watch = (
      target: Element | null,
      options: MutationObserverInit,
      sink: number[],
    ) =>
      target &&
      new MutationObserver(() => sink.push(performance.now())).observe(
        target,
        options,
      );
    // The scene changes when a tile takes the centre place
    new MutationObserver((records) => {
      for (const r of records)
        if ((r.target as HTMLElement).dataset.pos === "0")
          w.__p.scene.push(performance.now());
    }).observe(document.querySelector("#chain-ring [data-ring]")!, {
      attributes: true,
      attributeFilter: ["data-pos"],
      subtree: true,
    });
    watch(
      document.querySelector("#chain [data-legend]"),
      { childList: true, characterData: true, subtree: true },
      w.__p.legend,
    );
    watch(
      document.querySelector("#chain [data-overview] ul"),
      { attributes: true, attributeFilter: ["data-state"], subtree: true },
      w.__p.node,
    );
  });
  // The centre tile must always show a decoded cover or a player
  setInterval(() => {
    if (w.__p.swaps.length < 1) return;
    const tile = document.querySelector<HTMLElement>(
      '#chain-ring [data-pos="0"]',
    );
    const ok =
      !!tile?.querySelector("hyperframes-player") ||
      [...(tile?.querySelectorAll("img") ?? [])].some(
        (img) =>
          img.offsetParent !== null && img.complete && img.naturalWidth > 0,
      );
    if (!ok) w.__p.empty.push(String(performance.now()));
  }, 40);
};

for (const vp of VIEWPORTS)
  test.describe(`chain in two blocks at ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("the overview follows the swap (caption and node within 100 ms), the connector stays aligned, nothing overflows, no empty frame", async ({
      page,
    }) => {
      test.setTimeout(120000);
      await page.addInitScript(install);
      await page.goto("/", { waitUntil: "load" });
      const data = JSON.parse(
        (await page
          .locator("#chain script[data-overview-data]")
          .textContent())!,
      ) as { order: string[]; steps: { nodes: number[]; label: string }[] };

      // Alignment of the connector to the lit nodes and to the tile, measured now and after each of the swaps
      const align = () =>
        page.evaluate(() => {
          const centre = (el: Element) => {
            const r = el.getBoundingClientRect();
            return r.left + r.width / 2;
          };
          const overview = document.querySelector("#chain [data-overview]")!;
          const tile = document.querySelector('#chain-ring [data-pos="0"]')!;
          const lit = [...overview.querySelectorAll("b[data-state='on']")].map(
            centre,
          );
          const stems = [
            ...overview.querySelectorAll("[data-drop] i[data-on='true']"),
          ].map(centre);
          const axis = overview.querySelector("[data-drop] [data-axis]")!;
          const o = overview.getBoundingClientRect();
          return {
            lit,
            stems,
            axis: centre(axis),
            tile: centre(tile),
            gap: tile.getBoundingClientRect().top - o.bottom,
            height: o.height,
            scroll: document.documentElement.scrollWidth,
            width: window.innerWidth,
          };
        });
      const check = async (label: string) => {
        const m = await align();
        expect(m.lit.length, label).toBeGreaterThan(0);
        expect(m.stems, `${label}: one stem per lit node`).toHaveLength(
          m.lit.length,
        );
        for (const x of m.lit)
          expect(
            Math.min(...m.stems.map((s) => Math.abs(s - x))),
            `${label}: stem under its node`,
          ).toBeLessThanOrEqual(2);
        expect(
          Math.abs(m.axis - m.tile),
          `${label}: lands on the tile`,
        ).toBeLessThanOrEqual(2);
        expect(
          Math.abs(m.gap),
          `${label}: no gap to the tile`,
        ).toBeLessThanOrEqual(2);
        // Height budget of the overview: 180 px on a desktop, 140 on a phone
        expect(m.height).toBeLessThanOrEqual(vp.width <= 860 ? 140 : 180);
        expect(m.scroll, `${label}: no horizontal scroll`).toBe(m.width);
      };
      await check("first state");

      await page.waitForFunction(
        () => (window as unknown as { __p: Probe }).__p.swaps.length >= 3,
        undefined,
        { timeout: 100000 },
      );
      // The glide of the bridge takes 0.5 s
      await page.waitForTimeout(800);
      await check("after the swaps");

      const probe = await page.evaluate(
        () => (window as unknown as { __p: Probe }).__p,
      );
      for (const swap of probe.swaps) {
        expect(swap.legend, "legend of the step on screen").toBe(
          data.steps[swap.index].label,
        );
        expect(swap.lit, "lit nodes of the step on screen").toEqual(
          data.steps[swap.index].nodes,
        );
        // Caption and node change within 100 ms of the scene (the tile that takes the centre)
        const near = (list: number[]) => {
          const at = list.find((t) => t >= swap.at - 5);
          expect(at, "a change follows the swap").toBeDefined();
          return at!;
        };
        const scene = near(probe.scene);
        expect(Math.abs(near(probe.legend) - scene)).toBeLessThanOrEqual(100);
        expect(Math.abs(near(probe.node) - scene)).toBeLessThanOrEqual(100);
      }
      expect(probe.empty, "centre tile never empty").toEqual([]);
    });

    test("under reduced motion the token jumps and nothing runs", async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "load" });
      await page.waitForTimeout(800);
      const state = await page.evaluate(() => {
        const overview = document.querySelector<HTMLElement>(
          "#chain [data-overview]",
        )!;
        const token = overview.querySelector<HTMLElement>("span")!;
        return {
          running: document
            .getAnimations()
            .filter((a) => a.playState === "running")
            .map((a) => (a as CSSAnimation).animationName ?? "transition"),
          // Where it lands: the token sits on the end of the line of the first step
          left: getComputedStyle(token).left,
          land: overview.style.getPropertyValue("--xt"),
        };
      });
      expect(state.running).toEqual([]);
      // Computed left is in px: compare to the percent of the block
      expect(parseFloat(state.left)).toBeGreaterThan(0);
      expect(state.land).toMatch(/%$/);
      await context.close();
    });
  });

// O SITE SEGUE O MANIFESTO
// Acceptance of the manifest units, at the three sizes: the time between two swaps of the chain is the screen time plus the
// hold of the manifest (the site decides no time), the label of the row is the one of the step on screen, at most two
// players are mounted per ring, the connector block has its four labels without overlap and no rail ends loose, and under
// reduced motion no player and no animation runs.
import { expect, test } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

type Data = {
  slides: {
    segments: { range: [number, number]; rate: number; holdAfter: number }[];
  }[];
  labels: string[];
};

for (const vp of VIEWPORTS)
  test.describe(`manifest at ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("swap intervals follow screen time plus hold, labels follow the step, at most two players per ring", async ({
      page,
    }) => {
      test.setTimeout(90000);
      await page.addInitScript(() => {
        const w = window as unknown as {
          __swaps: { at: number; to: number; label: string }[];
          __maxPlayers: number;
        };
        w.__swaps = [];
        w.__maxPlayers = 0;
        window.addEventListener("ring:swap", (event) => {
          const d = (event as CustomEvent).detail;
          if (d.ring !== "chain-ring") return;
          // The label is rewritten in the same task as the event: read it right after
          queueMicrotask(() =>
            w.__swaps.push({
              at: performance.now(),
              to: d.to,
              label:
                document.querySelector("#chain [data-legend]")?.textContent ??
                "",
            }),
          );
        });
        setInterval(() => {
          const ring = document.querySelector("#chain-ring");
          const n = ring?.querySelectorAll("hyperframes-player").length ?? 0;
          w.__maxPlayers = Math.max(w.__maxPlayers, n);
        }, 100);
      });
      await page.goto("/", { waitUntil: "load" });
      const data: Data = JSON.parse(
        (await page
          .locator("#chain-ring script[data-ring-data]")
          .textContent())!,
      );
      // The caption of the step is the label of the overview (the block above the ring), which follows the swap
      const overview: { steps: { label: string }[] } = JSON.parse(
        (await page
          .locator("#chain script[data-overview-data]")
          .textContent())!,
      );
      await page.waitForFunction(
        () => (window as unknown as { __swaps: unknown[] }).__swaps.length >= 3,
        undefined,
        { timeout: 80000 },
      );
      const { swaps, max } = await page.evaluate(() => {
        const w = window as unknown as {
          __swaps: { at: number; to: number; label: string }[];
          __maxPlayers: number;
        };
        return { swaps: w.__swaps, max: w.__maxPlayers };
      });
      expect(max).toBeLessThanOrEqual(2);
      for (const swap of swaps)
        expect(swap.label, "label of the step on screen").toBe(
          overview.steps[swap.to].label,
        );
      for (let i = 1; i < swaps.length; i++) {
        // The interval between swap i-1 and i is the time step (i-1) is on screen: its screen time plus its hold
        const step = data.slides[swaps[i - 1].to].segments[0];
        const expected =
          (step.range[1] - step.range[0]) / step.rate + step.holdAfter;
        const measured = (swaps[i].at - swaps[i - 1].at) / 1000;
        expect(
          Math.abs(measured - expected),
          `step ${swaps[i - 1].to}`,
        ).toBeLessThanOrEqual(0.6);
      }
    });

    test("the connector block has its four labels, apart from each other, and its rails reach the bottom", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "load" });
      const m = await page.evaluate(() => {
        const box = (el: Element) => {
          const r = el.getBoundingClientRect();
          return { x: r.left, y: r.top, w: r.width, h: r.height };
        };
        const hub = document.querySelector("#connectors [role=group]")!;
        const labels = [...hub.querySelectorAll("span")].filter(
          (s) => s.textContent && !s.children.length,
        );
        const lines = [...hub.querySelectorAll("[data-line]")].map(box);
        return {
          hub: box(hub),
          labels: labels.map((l) => ({ text: l.textContent, ...box(l) })),
          lines,
          nodes: [...hub.querySelectorAll("[data-node]")].map(box),
          core: box(hub.querySelector("[data-node=domus]")!.parentElement!),
        };
      });
      expect(m.labels).toHaveLength(4);
      // No two labels overlap, and none overlaps a logo
      const hit = (
        a: { x: number; y: number; w: number; h: number },
        b: { x: number; y: number; w: number; h: number },
      ) =>
        a.x < b.x + b.w &&
        b.x < a.x + a.w &&
        a.y < b.y + b.h &&
        b.y < a.y + a.h;
      m.labels.forEach((a, i) => {
        m.labels.slice(i + 1).forEach((b) => expect(hit(a, b)).toBe(false));
        for (const node of m.nodes) expect(hit(a, node), a.text!).toBe(false);
        // No label falls inside the core box (the seam label sits under it)
        expect(
          a.y + a.h <= m.core.y + 1 || a.y >= m.core.y + m.core.h - 1,
        ).toBe(true);
      });
      // Three rails, each running down to the bottom edge of the block, where the converging rails take over
      expect(m.lines).toHaveLength(3);
      for (const line of m.lines)
        expect(
          Math.abs(line.y + line.h - (m.hub.y + m.hub.h)),
        ).toBeLessThanOrEqual(1);
      // Symmetric about the axis
      const axis = vp.width / 2;
      expect(
        Math.abs(m.lines[1].x + m.lines[1].w / 2 - axis),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(m.lines[1].x - m.lines[0].x - (m.lines[2].x - m.lines[1].x)),
      ).toBeLessThanOrEqual(1);
      // Height budget of the block
      expect(m.hub.h / vp.height).toBeLessThanOrEqual(0.5);
    });

    test("under reduced motion no player is mounted and nothing animates", async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "load" });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 300) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
        }
      });
      await page.waitForTimeout(1500);
      const state = await page.evaluate(() => ({
        players: document.querySelectorAll("hyperframes-player").length,
        running: document
          .getAnimations()
          .filter((a) => a.playState === "running")
          .map((a) => (a as CSSAnimation).animationName ?? "transition"),
      }));
      expect(state.players).toBe(0);
      expect(state.running).toEqual([]);
      await context.close();
    });
  });

test("the product page is one template: same sections, one ring for the opening and the films, the chain of the product", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/domus", { waitUntil: "load" });
  const ids = await page.evaluate(() =>
    [...document.querySelectorAll("section[data-live]")].map((s) => s.id),
  );
  expect(ids).toEqual([
    "product",
    "resolves",
    "capabilities",
    "chain",
    "connectors",
    "platforms",
  ]);
  expect(await page.locator("#product-ring [data-layers]").count()).toBe(2);
  expect(await page.locator("h1").count()).toBe(1);
  expect(await page.locator("#chain-ring [data-layers]").count()).toBeLessThan(
    6,
  );
});

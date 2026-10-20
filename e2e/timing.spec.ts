// O SITE SEGUE O ROTEIRO
// Acceptance of the timing of the chain and of the connector block, at the three sizes: the time between two swaps of
// the chain is the time of the scene in the script (settle plus hold), the caption of the overview is the one of the
// step on screen, the connector block has its four labels without overlap and no rail ends loose, and under reduced
// motion no video and no animation runs.
import { expect, test } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

for (const vp of VIEWPORTS)
  test.describe(`timing at ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("swap intervals follow the time of each scene and labels follow the step", async ({
      page,
    }) => {
      test.setTimeout(90000);
      await page.addInitScript(() => {
        const w = window as unknown as {
          __swaps: { at: number; to: number; label: string }[];
        };
        w.__swaps = [];
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
      });
      await page.goto("/", { waitUntil: "load" });
      // The durations are the script's (settle + hold of each native scene), written next to the stage
      const data = JSON.parse(
        (await page
          .locator("#chain-ring script[data-scene-data]")
          .textContent())!,
      ) as { scenes: number[] };
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
      const swaps = await page.evaluate(
        () =>
          (
            window as unknown as {
              __swaps: { at: number; to: number; label: string }[];
            }
          ).__swaps,
      );
      for (const swap of swaps)
        expect(swap.label, "label of the step on screen").toBe(
          overview.steps[swap.to].label,
        );
      for (let i = 1; i < swaps.length; i++) {
        // The interval between swap i-1 and i is the time scene (i-1) is on screen: its settle plus its hold
        const expected = data.scenes[swaps[i - 1].to];
        const measured = (swaps[i].at - swaps[i - 1].at) / 1000;
        expect(
          Math.abs(measured - expected),
          `step ${swaps[i - 1].to}`,
        ).toBeLessThanOrEqual(0.3);
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

    test("under reduced motion no video is mounted and nothing animates", async ({
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
        players: document.querySelectorAll("video, iframe").length,
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

test("the product page is one template: a native opening with the capability scenes, the reading bands and the door to the next product", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/domus", { waitUntil: "load" });
  // The product is the slot of the one-page layout (the head of the home above it and the hidden tail below it are the
  // home's own bands)
  const ids = await page.evaluate(() =>
    [
      ...document.querySelectorAll("[data-descent-slot] section[data-live]"),
    ].map((s) => s.id),
  );
  expect(ids).toEqual([
    "product",
    "resolves",
    "how",
    "capabilities",
    "audience",
    "faq",
    "connectors",
    "platforms",
    "next",
  ]);
  // One h1 for the product; the layout adds the home's own, for screen readers only
  expect(await page.locator("[data-descent-slot] h1").count()).toBe(1);
  // The opening is native and plays: three capability scenes, no still frame, and no video or frame anywhere
  expect(await page.locator("#product-scenes [data-tile]").count()).toBe(3);
  expect(await page.locator("#product [data-mini]").count()).toBe(0);
  expect(await page.locator("video, iframe").count()).toBe(0);
});

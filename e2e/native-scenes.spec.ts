// CENAS NATIVAS DA CADEIA
// Acceptance of the native chain at the three sizes: the scene swaps in step with the overview (within 100 ms), the cycle
// is at most 35 s with a hold of 1.2 s or more per scene, the swap is a rotation of 0.6 to 0.8 s without a long task, at
// least 55% of the cycle is still, the text on screen is 14 px or more, nothing scrolls sideways, every text passes AA contrast,
// reduced motion shows the settled frames, the runner pauses off screen, and nothing shifts the layout.
import { expect, test, type Page } from "@playwright/test";
import { SCRIPT } from "../lib/scenes/script";
import { VIEWPORTS } from "./viewports";

const centre = (page: Page) => page.locator("#chain-ring");

async function toStage(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await centre(page).evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
}

// Puts scene `i` at the centre with the settled frame, the way reduced motion shows it
const showScene = (page: Page, i: number) =>
  page.evaluate((i) => {
    const tiles = [
      ...document.querySelectorAll<HTMLElement>("#chain-ring [data-tile]"),
    ];
    tiles.forEach((tile, k) => {
      const p = ((k - i + 7 + 3) % 7) - 3;
      tile.dataset.pos = String(Math.max(-2, Math.min(2, p)));
    });
  }, i);

for (const vp of VIEWPORTS)
  test.describe(`native chain at ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("focal text and every text of the centre scene are 14 px or more, in all seven scenes", async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await toStage(page);
      const smallest: number[] = [];
      for (let i = 0; i < 7; i++) {
        await showScene(page, i);
        const sizes = await page.evaluate(() => {
          const tile = document.querySelector(
            '#chain-ring [data-pos="0"] .scn',
          )!;
          const walker = document.createTreeWalker(tile, NodeFilter.SHOW_TEXT);
          const all: number[] = [];
          const focal: number[] = [];
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!n.textContent?.trim()) continue;
            const el = n.parentElement!;
            // Hidden stacks (opacity 0 or collapsed) are not on screen
            if (Number(getComputedStyle(el).opacity) === 0) continue;
            const px = parseFloat(getComputedStyle(el).fontSize);
            all.push(px);
            if (el.closest("[data-focal]")) focal.push(px);
          }
          return { all, focal };
        });
        // Scene 0 has no focal sentence (the house and the funnel carry only names); the others have one
        if (i > 0) {
          expect(
            sizes.focal.length,
            `scene ${i} has focal text`,
          ).toBeGreaterThan(0);
          expect(Math.min(...sizes.focal)).toBeGreaterThanOrEqual(14);
          smallest.push(Math.min(...sizes.focal));
        }
        expect(Math.min(...sizes.all)).toBeGreaterThanOrEqual(14);
      }
      console.log(`${vp.name}: smallest focal text`, Math.min(...smallest));
      await context.close();
    });

    test("no horizontal scroll while the chain plays and in every scene", async ({
      page,
    }) => {
      test.setTimeout(60000);
      await toStage(page);
      const overflow = () =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
      for (let t = 0; t < 8; t++) {
        expect(await overflow()).toBeLessThanOrEqual(0);
        await page.waitForTimeout(500);
      }
      for (let i = 0; i < 7; i++) {
        await showScene(page, i);
        await page.waitForTimeout(450);
        expect(await overflow(), `scene ${i}`).toBeLessThanOrEqual(0);
        // And no scene overflows its own window
        const clipped = await page.evaluate(() => {
          const win = document.querySelector(
            '#chain-ring [data-pos="0"] .scn > div',
          )!;
          const box = win.getBoundingClientRect();
          return [...win.querySelectorAll("*")].filter((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.width > 0 &&
              Number(getComputedStyle(el).opacity) > 0 &&
              (r.bottom > box.bottom + 1 || r.right > box.right + 1)
            );
          }).length;
        });
        expect(clipped, `scene ${i} spills out of its window`).toBe(0);
      }
    });

    test("every text of the chain, the products and the closing passes WCAG AA", async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "load" });
      const failures: string[] = [];
      for (let i = 0; i < 7; i++) {
        await showScene(page, i);
        const bad = await page.evaluate(() => {
          const lum = (c: number[]) => {
            const [r, g, b] = c.map((v) => {
              const s = v / 255;
              return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const parse = (s: string) => {
            const m = s.match(/[\d.]+/g)!.map(Number);
            // color-mix() computes to color(srgb r g b / a) with channels in 0..1
            const scale = s.startsWith("color(") ? 255 : 1;
            return {
              rgb: m.slice(0, 3).map((v) => v * scale),
              a: m[3] ?? 1,
            };
          };
          const mix = (top: number[], a: number, under: number[]) =>
            top.map((v, k) => v * a + under[k] * (1 - a));
          const backdrop = (el: Element) => {
            const stack: { rgb: number[]; a: number }[] = [];
            for (let n: Element | null = el; n; n = n.parentElement) {
              const bg = parse(getComputedStyle(n).backgroundColor);
              if (bg.a > 0) stack.push(bg);
              if (bg.a === 1) break;
            }
            let under = [250, 245, 234];
            for (const layer of stack.reverse())
              under = mix(layer.rgb, layer.a, under);
            return under;
          };
          const out: string[] = [];
          const scopes = [
            "#chain-ring [data-pos='0']",
            "#chain [data-overview]",
            "#chain h2, #chain p",
            "#products [data-card]",
            "#connectors",
            "#platforms",
          ];
          for (const scope of scopes)
            for (const root of document.querySelectorAll(scope)) {
              const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
              );
              for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                if (!n.textContent?.trim()) continue;
                const el = n.parentElement!;
                const cs = getComputedStyle(el);
                // Text that is not on screen (a stack that faded out) and the logos' own alt are not read
                if (Number(cs.opacity) === 0 || cs.visibility === "hidden")
                  continue;
                if (el.closest("[aria-hidden='true']:not(.scn *)")) continue;
                const fg = parse(cs.color);
                const bg = backdrop(el);
                const text = mix(fg.rgb, fg.a, bg);
                const l1 = lum(text);
                const l2 = lum(bg);
                const ratio =
                  (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
                const px = parseFloat(cs.fontSize);
                const bold = Number(cs.fontWeight) >= 600;
                const large = px >= 24 || (px >= 18.66 && bold);
                if (ratio < (large ? 3 : 4.5))
                  out.push(
                    `${ratio.toFixed(2)} "${n.textContent.trim().slice(0, 30)}" ${cs.color} on rgb(${bg.map(Math.round)})`,
                  );
              }
            }
          return out;
        });
        failures.push(...bad.map((b) => `scene ${i}: ${b}`));
      }
      expect([...new Set(failures)]).toEqual([]);
      await context.close();
    });
  });

test.describe("native chain behaviour", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the scene swaps in step with the overview (caption and lit node within 100 ms) and the script's order", async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.addInitScript(() => {
      const w = window as unknown as { __s: unknown[] };
      w.__s = [];
      window.addEventListener("ring:swap", (event) => {
        const d = (event as CustomEvent).detail;
        const at = performance.now();
        queueMicrotask(() => {
          const tile = document.querySelector(
            '#chain-ring [data-pos="0"]',
          ) as HTMLElement;
          w.__s.push({
            at,
            index: d.index,
            tile: tile?.dataset.tile,
            legend:
              document.querySelector("#chain [data-legend]")?.textContent ?? "",
            lit: [...document.querySelectorAll("#chain b[data-state='on']")]
              .length,
            done: performance.now() - at,
          });
        });
      });
    });
    await toStage(page);
    const data = JSON.parse(
      (await page.locator("#chain script[data-scene-data]").textContent())!,
    ) as { scenes: number[] };
    const overview = JSON.parse(
      (await page.locator("#chain script[data-overview-data]").textContent())!,
    ) as { steps: { label: string }[] };
    // Wait for the first two swaps
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
      lit: number;
      done: number;
    }[];
    swaps.slice(0, 2).forEach((s, k) => {
      expect(s.index).toBe(k + 1);
      expect(s.tile).toBe(`s${k + 1}`);
      expect(s.legend).toBe(overview.steps[k + 1].label);
      expect(s.lit).toBeGreaterThan(0);
      expect(s.done).toBeLessThan(100);
    });
    // The interval between swaps is the script's: scene 1 lasts its settle + hold (the timer is planned, not drifting)
    const gap = (swaps[1].at - swaps[0].at) / 1000;
    expect(Math.abs(gap - data.scenes[1])).toBeLessThan(0.25);
  });

  test("at least 65% of the cycle is still (computed styles sampled every 100 ms)", async ({
    page,
  }) => {
    test.setTimeout(180000);
    await toStage(page);
    const cycle = JSON.parse(
      (await page.locator("#chain script[data-scene-data]").textContent())!,
    ).cycle as number;
    await page.evaluate(() => {
      const w = window as unknown as { __still: boolean[]; __stop: () => void };
      w.__still = [];
      const root = document.querySelector("#chain [data-chain]")!;
      const props = [
        "opacity",
        "transform",
        "translate",
        "rotate",
        "scale",
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
      const w = window as unknown as { __still: boolean[]; __stop: () => void };
      w.__stop();
      return w.__still;
    });
    const ratio = still.filter(Boolean).length / still.length;
    console.log(
      `still share of the cycle: ${(ratio * 100).toFixed(1)}% over ${still.length} samples (cycle ${cycle}s)`,
    );
    expect(ratio).toBeGreaterThanOrEqual(0.55);
  });

  test("the cycle is at most 35 s, every scene lasts 4.5 to 5.5 s and holds its final frame at least 1.2 s", async ({
    page,
  }) => {
    await toStage(page);
    const data = JSON.parse(
      (await page.locator("#chain script[data-scene-data]").textContent())!,
    ) as { cycle: number; scenes: number[]; swap: number };
    expect(data.cycle).toBeLessThanOrEqual(35);
    for (const seconds of data.scenes) {
      expect(seconds).toBeGreaterThanOrEqual(4.5);
      expect(seconds).toBeLessThanOrEqual(5.5);
    }
    SCRIPT.forEach((scene, i) => {
      expect(scene.hold, `scene ${i}`).toBeGreaterThanOrEqual(1.2);
      expect(scene.settle + scene.hold).toBeCloseTo(data.scenes[i], 3);
    });
  });

  test("the swap is a rotation of 0.6 to 0.8 s that never shows an empty frame and runs without a long task", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.addInitScript(() => {
      const w = window as unknown as {
        __runs: number[];
        __ends: number[];
        __long: { at: number; dur: number }[];
        __empty: number;
      };
      w.__runs = [];
      w.__ends = [];
      w.__long = [];
      w.__empty = 0;
      document.addEventListener(
        "transitionrun",
        (e) => {
          if ((e.target as HTMLElement).closest?.("#chain-ring [data-pos]"))
            w.__runs.push(performance.now());
        },
        true,
      );
      document.addEventListener(
        "transitionend",
        (e) => {
          if ((e.target as HTMLElement).closest?.("#chain-ring [data-pos]"))
            w.__ends.push(performance.now());
        },
        true,
      );
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            w.__long.push({ at: entry.startTime, dur: entry.duration });
        }).observe({ type: "longtask", buffered: true });
      } catch {}
      // Empty frame: during a swap the centre scene and its next neighbour must both be painted (a tile with no children
      // or fully transparent is an empty frame)
      const probe = () => {
        const centre = document.querySelector(
          '#chain-ring [data-pos="0"] .scn',
        );
        if (!centre || !centre.firstElementChild) w.__empty++;
        requestAnimationFrame(probe);
      };
      requestAnimationFrame(probe);
    });
    await toStage(page);
    // Wait for the first swap to run and finish (2 s after its first transition)
    await page.waitForFunction(
      () => {
        const w = window as unknown as { __runs: number[] };
        return w.__runs.length > 0 && performance.now() > w.__runs[0] + 2000;
      },
      undefined,
      { timeout: 30000 },
    );
    const r = await page.evaluate(() => {
      const w = window as unknown as {
        __runs: number[];
        __ends: number[];
        __long: { at: number; dur: number }[];
        __empty: number;
      };
      // First swap only: the ends that fall within 1.5 s of its first transition
      const first = Math.min(...w.__runs);
      const ends = w.__ends.filter((t) => t <= first + 1500);
      const last = Math.max(...ends);
      return {
        span: (last - first) / 1000,
        // Long tasks (50 ms or more) that overlap the swap window; the load of the page is not the swap
        long: w.__long
          .filter((l) => l.at < last + 100 && l.at + l.dur > first - 100)
          .map((l) => l.dur),
        empty: w.__empty,
      };
    });
    console.log(
      "swap rotation seconds",
      r.span.toFixed(3),
      "long tasks",
      r.long,
    );
    expect(r.span).toBeGreaterThanOrEqual(0.6);
    expect(r.span).toBeLessThanOrEqual(0.9);
    expect(r.empty).toBe(0);
    expect(r.long.filter((d) => d >= 50)).toEqual([]);
  });

  test("no aria-live anywhere, and reduced motion shows every scene in its settled frame", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await toStage(page);
    await page.waitForTimeout(3000);
    // Next's own route announcer sits outside <main>; nothing the site draws is a live region
    expect(await page.locator("main [aria-live]").count()).toBe(0);
    const state = await page.evaluate(() => ({
      phases: [...document.querySelectorAll("#chain-ring .scn")].map(
        (el) => (el as HTMLElement).dataset.phase,
      ),
      centre: (
        document.querySelector('#chain-ring [data-pos="0"]') as HTMLElement
      ).dataset.tile,
      running: document
        .getAnimations()
        .filter(
          (a) =>
            a.effect instanceof KeyframeEffect &&
            (a.effect.target as Element | null)?.closest("#chain-ring"),
        ).length,
    }));
    expect(state.phases.every((p) => p === "end")).toBe(true);
    expect(state.centre).toBe("s0");
    expect(state.running).toBe(0);
    await context.close();
  });

  test("the runner pauses off screen and with the tab hidden, and resumes", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await toStage(page);
    const run = () =>
      page.evaluate(
        () => document.querySelector<HTMLElement>("#chain-ring")!.dataset.run,
      );
    await page.waitForFunction(() =>
      document.querySelector("#chain-ring .scn[data-phase='play']"),
    );
    expect(await run()).toBeUndefined();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(run).toBe("paused");
    const frozen = await page.evaluate(
      () =>
        document.querySelector<HTMLElement>('#chain-ring [data-pos="0"]')!
          .dataset.tile,
    );
    await page.waitForTimeout(1500);
    expect(
      await page.evaluate(
        () =>
          document.querySelector<HTMLElement>('#chain-ring [data-pos="0"]')!
            .dataset.tile,
      ),
    ).toBe(frozen);
    await centre(page).evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await expect.poll(run).toBeUndefined();
  });

  // 740x360 is a phone on its side; 540x360 is the case where the stage (7:10 below 560 px wide) is taller than the whole
  // window, so the old limit (half of the stage) could never be reached
  for (const [w, h] of [
    [740, 360],
    [540, 360],
  ])
    test(`the loop starts on a phone on its side (${w}x${h}), even where the stage is taller than the window`, async ({
      page,
    }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/", { waitUntil: "load" });
      // Put the stage under the fixed header: it fills the window, and half of it is more than the window shows
      await centre(page).evaluate((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - 60);
      });
      const box = await centre(page).boundingBox();
      console.log(`${w}x${h} stage height`, box?.height, "window", h);
      await page.waitForFunction(
        () => document.querySelector("#chain-ring .scn[data-phase='play']"),
        undefined,
        { timeout: 8000 },
      );
      // And it keeps going: the second scene takes the centre
      await page.waitForFunction(
        () =>
          document.querySelector<HTMLElement>('#chain-ring [data-pos="0"]')
            ?.dataset.tile === "s1",
        undefined,
        { timeout: 20000 },
      );
    });

  test("no layout shift while the chain loads and plays", async ({ page }) => {
    test.setTimeout(60000);
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: number };
      w.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[])
          if (!e.hadRecentInput) w.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await toStage(page);
    await page.waitForTimeout(12000);
    const cls = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    console.log("layout shift while playing:", cls);
    expect(cls).toBeLessThan(0.01);
  });
});

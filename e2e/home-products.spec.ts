// CARROSSEL DE PRODUTOS DA HOME
// Acceptance of the products section of the home, now native: five tiles in the order of the site, each a capability
// scene with the logo of its product in the bar, turning at the pace of the script (a tile of about 5 s, the swap of
// 0.7 s) with the card of the product on screen lit; every tile keeps the legibility rule of the scenes (interface text of
// 11 to 13 px, one key of 18 to 22 px, AA) and never scrolls the page sideways, at the three sizes. At 1440: at least 55%
// of the cycle is still, reduced motion shows the settled first tile with nothing running, the stage pauses off screen,
// and the page serves no video, no iframe and no player.
import { expect, test, type Page } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

const STAGE = "#products-ring";
const ORDER = ["domus", "relloo", "magneto", "tuner", "knowly"];

async function toStage(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await page
    .locator(STAGE)
    .evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
}

// Puts tile `i` at the centre with its settled frame, the way reduced motion shows it
const showTile = (page: Page, i: number) =>
  page.evaluate(
    ([sel, i]) => {
      const tiles = [
        ...document.querySelectorAll<HTMLElement>(`${sel} [data-tile]`),
      ];
      const n = tiles.length;
      tiles.forEach((tile, k) => {
        const p = ((k - i + n + 2) % n) - 2;
        tile.dataset.pos = String(Math.max(-2, Math.min(2, p)));
      });
    },
    [STAGE, i] as const,
  );

for (const vp of VIEWPORTS)
  test.describe(`products carousel at ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("five tiles in the order of the site, each with the logo of its product in the bar of its window", async ({
      page,
    }) => {
      await toStage(page);
      const products = await page.$$eval(
        `${STAGE} [data-tile] [data-product]`,
        (els) => els.map((el) => (el as HTMLElement).dataset.product),
      );
      expect(products).toEqual(ORDER);
      for (const slug of ORDER)
        await expect(
          page.locator(
            `${STAGE} [data-product="${slug}"] [data-frame-bar] img[src*="${slug}"]`,
          ),
        ).toHaveCount(1);
    });

    test("every tile keeps the legibility rule, AA, its window and no sideways scroll", async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await toStage(page);
      for (let i = 0; i < ORDER.length; i++) {
        await showTile(page, i);
        await page.waitForTimeout(100);
        const m = await page.evaluate((sel) => {
          const scene = document.querySelector(`${sel} [data-pos="0"] .scn`)!;
          const shown = (el: Element) => {
            for (
              let a: Element | null = el;
              a && a !== scene;
              a = a.parentElement
            ) {
              const cs = getComputedStyle(a);
              if (Number(cs.opacity) === 0 || cs.display === "none")
                return false;
            }
            return el.getBoundingClientRect().width > 0;
          };
          const lum = (c: number[]) => {
            const [r, g, b] = c.map((v) => {
              const s = v / 255;
              return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const parse = (s: string) => {
            const v = s.match(/[\d.]+/g)!.map(Number);
            const scale = s.startsWith("color(") ? 255 : 1;
            return { rgb: v.slice(0, 3).map((x) => x * scale), a: v[3] ?? 1 };
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
          const sizes: number[] = [];
          const weak: string[] = [];
          const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!n.textContent?.trim()) continue;
            const el = n.parentElement!;
            if (!shown(el)) continue;
            const cs = getComputedStyle(el);
            const px = parseFloat(cs.fontSize);
            sizes.push(px);
            const fg = parse(cs.color);
            const bg = backdrop(el);
            const l1 = lum(mix(fg.rgb, fg.a, bg));
            const l2 = lum(bg);
            const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
            const large =
              px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 600);
            if (ratio < (large ? 3 : 4.5))
              weak.push(
                `${ratio.toFixed(2)} "${n.textContent.trim().slice(0, 30)}"`,
              );
          }
          const keys = [...scene.querySelectorAll("[data-key]")]
            .filter(shown)
            .map((k) => parseFloat(getComputedStyle(k).fontSize));
          const win = scene.firstElementChild!.getBoundingClientRect();
          const spill = [...scene.querySelectorAll("*")].filter((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.width > 0 &&
              Number(getComputedStyle(el).opacity) > 0 &&
              (r.bottom > win.bottom + 1 || r.right > win.right + 1)
            );
          }).length;
          return {
            sizes,
            keys,
            weak,
            spill,
            overflow:
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          };
        }, STAGE);
        const where = `${ORDER[i]} at ${vp.name}`;
        expect(Math.min(...m.sizes), where).toBeGreaterThanOrEqual(11);
        expect(m.keys, `${where}: one key element`).toHaveLength(1);
        expect(m.keys[0], where).toBeGreaterThanOrEqual(18);
        expect(m.keys[0], where).toBeLessThanOrEqual(22);
        expect(
          Math.max(...m.sizes.filter((px) => px !== m.keys[0])),
          where,
        ).toBeLessThanOrEqual(13);
        expect(m.weak, `${where}: AA`).toEqual([]);
        expect(m.spill, `${where}: spills out of its window`).toBe(0);
        expect(m.overflow, `${where}: sideways scroll`).toBeLessThanOrEqual(0);
      }
      await context.close();
    });

    test("the carousel turns at the pace of the script and lights the card of the product on screen", async ({
      page,
    }) => {
      test.setTimeout(60000);
      await page.addInitScript(() => {
        const w = window as unknown as {
          __swaps: { at: number; to: number; lit: string[] }[];
        };
        w.__swaps = [];
        window.addEventListener("ring:swap", (event) => {
          const d = (event as CustomEvent).detail;
          if (d.ring !== "products-ring") return;
          w.__swaps.push({
            at: performance.now(),
            to: d.to,
            lit: [
              ...document.querySelectorAll<HTMLElement>(
                '#products [data-card][data-on="true"]',
              ),
            ].map((c) => c.dataset.card!),
          });
        });
      });
      await toStage(page);
      const data = JSON.parse(
        (await page.locator(`${STAGE} script[data-scene-data]`).textContent())!,
      ) as { scenes: number[]; swap: number; lit: string[] };
      expect(data.lit).toEqual(ORDER);
      expect(data.swap).toBe(0.7);
      for (const s of data.scenes) {
        expect(s).toBeGreaterThanOrEqual(4.5);
        expect(s).toBeLessThanOrEqual(5.5);
      }
      await page.waitForFunction(
        () => (window as unknown as { __swaps: unknown[] }).__swaps.length >= 3,
        undefined,
        { timeout: 40000 },
      );
      const swaps = await page.evaluate(
        () =>
          (
            window as unknown as {
              __swaps: { at: number; to: number; lit: string[] }[];
            }
          ).__swaps,
      );
      for (const swap of swaps) expect(swap.lit).toEqual([ORDER[swap.to]]);
      for (let i = 1; i < swaps.length; i++) {
        const expected = data.scenes[swaps[i - 1].to];
        const measured = (swaps[i].at - swaps[i - 1].at) / 1000;
        expect(Math.abs(measured - expected)).toBeLessThanOrEqual(0.4);
      }
      // Each card still leads to its product page
      for (const slug of ORDER)
        await expect(
          page.locator(`#products a[data-card="${slug}"]`),
        ).toHaveAttribute("href", `/products/${slug}`);
    });
  });

test.describe("products carousel behaviour", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("at least 55% of the cycle is still (computed styles sampled every 100 ms)", async ({
    page,
  }) => {
    test.setTimeout(90000);
    await toStage(page);
    const cycle = JSON.parse(
      (await page.locator(`${STAGE} script[data-scene-data]`).textContent())!,
    ).cycle as number;
    await page.evaluate((sel) => {
      const w = window as unknown as { __still: boolean[]; __stop: () => void };
      w.__still = [];
      const root = document.querySelector(sel)!;
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
    }, STAGE);
    await page.waitForTimeout(Math.ceil((cycle + 1) * 1000));
    const still = await page.evaluate(() => {
      const w = window as unknown as { __still: boolean[]; __stop: () => void };
      w.__stop();
      return w.__still;
    });
    const ratio = still.filter(Boolean).length / still.length;
    console.log(
      `still share of the products carousel: ${(ratio * 100).toFixed(1)}% over ${still.length} samples (cycle ${cycle}s)`,
    );
    expect(ratio).toBeGreaterThanOrEqual(0.55);
  });

  test("reduced motion shows the settled first tile, the first card lit and nothing running", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await toStage(page);
    await page.waitForTimeout(6000);
    const state = await page.evaluate((sel) => {
      const root = document.querySelector(sel)!;
      return {
        phases: [...root.querySelectorAll(".scn")].map(
          (el) => (el as HTMLElement).dataset.phase,
        ),
        centre: (root.querySelector('[data-pos="0"]') as HTMLElement).dataset
          .tile,
        lit: [
          ...document.querySelectorAll<HTMLElement>(
            '#products [data-card][data-on="true"]',
          ),
        ].map((c) => c.dataset.card),
        running: document
          .getAnimations()
          .filter(
            (a) =>
              a.effect instanceof KeyframeEffect &&
              (a.effect.target as Element | null)?.closest(sel),
          ).length,
      };
    }, STAGE);
    expect(state.phases.every((p) => p === "end")).toBe(true);
    expect(state.centre).toBe("domus-cash");
    expect(state.lit).toEqual(["domus"]);
    expect(state.running).toBe(0);
    await context.close();
  });

  test("the carousel pauses off screen and resumes", async ({ page }) => {
    test.setTimeout(60000);
    await toStage(page);
    const run = () =>
      page.evaluate(
        (sel) => document.querySelector<HTMLElement>(sel)!.dataset.run,
        STAGE,
      );
    await page.waitForFunction(
      (sel) => document.querySelector(`${sel} .scn[data-phase='play']`),
      STAGE,
    );
    expect(await run()).toBeUndefined();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(run).toBe("paused");
    await page
      .locator(STAGE)
      .evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
    await expect.poll(run).toBeUndefined();
  });

  test("the home serves no video, no iframe and no player, and requests no file of motion", async ({
    page,
  }) => {
    const media: string[] = [];
    page.on("request", (req) => {
      if (/\.(mp4|webm)(\?|$)|\/motion\//.test(req.url()))
        media.push(req.url());
    });
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    await page.waitForTimeout(1000);
    expect(
      await page.locator("video, iframe, hyperframes-player").count(),
    ).toBe(0);
    expect(media).toEqual([]);
  });
});

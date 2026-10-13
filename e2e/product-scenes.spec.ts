// CENAS DE CAPACIDADE NA ABERTURA DA PÁGINA DE PRODUTO
// Acceptance of the native opening of the five product pages, at the three sizes: every capability scene follows the
// legibility rule of the scenes (interface text of 11 to 13 px, one key element of 18 to 22 px, at most four sizes and
// three colours, every text AA), stays inside its window and never scrolls the page sideways; the reading bands of the
// page pass AA too. At 1440: at least 55% of the cycle of the opening is still, reduced motion shows the settled frames
// with no animation running, and the stage pauses off screen.
import { expect, test, type Page } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;
const STAGE = "#product-scenes";

async function toStage(page: Page, slug: string) {
  await page.goto(`/products/${slug}`, { waitUntil: "load" });
  await page
    .locator(STAGE)
    .evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
}

// Contrast of every text under `scopes` against what is painted behind it (alpha layers mixed down to the page cream)
const contrastFailures = (page: Page, scopes: string[]) =>
  page.evaluate((scopes) => {
    const lum = (c: number[]) => {
      const [r, g, b] = c.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const parse = (s: string) => {
      const m = s.match(/[\d.]+/g)!.map(Number);
      const scale = s.startsWith("color(") ? 255 : 1;
      return { rgb: m.slice(0, 3).map((v) => v * scale), a: m[3] ?? 1 };
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
    for (const scope of scopes)
      for (const root of document.querySelectorAll(scope)) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!n.textContent?.trim()) continue;
          const el = n.parentElement!;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || !el.getBoundingClientRect().width)
            continue;
          let hidden = false;
          for (let a: Element | null = el; a && a !== root; a = a.parentElement)
            if (Number(getComputedStyle(a).opacity) === 0) hidden = true;
          if (hidden) continue;
          const fg = parse(cs.color);
          const bg = backdrop(el);
          const text = mix(fg.rgb, fg.a, bg);
          const l1 = lum(text);
          const l2 = lum(bg);
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          const px = parseFloat(cs.fontSize);
          const large =
            px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 600);
          if (ratio < (large ? 3 : 4.5))
            out.push(
              `${ratio.toFixed(2)} "${n.textContent.trim().slice(0, 30)}" ${cs.color}`,
            );
        }
      }
    return out;
  }, scopes);

for (const vp of VIEWPORTS)
  test.describe(`capability scenes at ${vp.name}`, () => {
    for (const slug of SLUGS)
      test(`${slug}: every scene keeps the legibility rule, AA, its window and no sideways scroll`, async ({
        browser,
      }) => {
        test.setTimeout(60000);
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        await toStage(page, slug);
        const count = await page.locator(`${STAGE} [data-tile]`).count();
        expect(count).toBe(3);
        for (let i = 0; i < count; i++) {
          // Puts scene i at the centre, settled, the way reduced motion shows it
          const text = await page.evaluate(
            ([sel, index]) => {
              const tiles = [
                ...document.querySelectorAll<HTMLElement>(`${sel} [data-tile]`),
              ];
              tiles.forEach((tile, k) => {
                const p = ((k - index + 4) % 3) - 1;
                tile.dataset.pos = String(p);
              });
              const scene = tiles[index].querySelector(".scn")!;
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
              const sizes: number[] = [];
              const colours = new Set<string>();
              const walker = document.createTreeWalker(
                scene,
                NodeFilter.SHOW_TEXT,
              );
              for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                if (!n.textContent?.trim()) continue;
                const el = n.parentElement!;
                if (!shown(el)) continue;
                const cs = getComputedStyle(el);
                sizes.push(parseFloat(cs.fontSize));
                colours.add(cs.color);
              }
              const keys = [...scene.querySelectorAll("[data-key]")]
                .filter(shown)
                .map((k) => parseFloat(getComputedStyle(k).fontSize));
              // Nothing spills out of the window of the scene
              const win = scene.firstElementChild!;
              const box = win.getBoundingClientRect();
              const spill = [...win.querySelectorAll("*")].filter((el) => {
                const r = el.getBoundingClientRect();
                return (
                  shown(el) &&
                  (r.bottom > box.bottom + 1 || r.right > box.right + 1)
                );
              }).length;
              return {
                id: tiles[index].dataset.tile,
                sizes,
                colours: [...colours],
                keys,
                spill,
              };
            },
            [STAGE, i] as const,
          );
          const where = `${text.id} at ${vp.name}`;
          expect(Math.min(...text.sizes), where).toBeGreaterThanOrEqual(11);
          expect(text.keys, `${where}: one key element`).toHaveLength(1);
          const [key] = text.keys;
          expect(key, where).toBeGreaterThanOrEqual(18);
          expect(key, where).toBeLessThanOrEqual(22);
          const rest = text.sizes.filter((px) => px !== key);
          expect(Math.max(...rest), where).toBeLessThanOrEqual(13);
          expect(
            new Set(text.sizes).size,
            `${where}: sizes`,
          ).toBeLessThanOrEqual(4);
          expect(text.colours.length, `${where}: colours`).toBeLessThanOrEqual(
            3,
          );
          expect(text.spill, `${where}: spills out of its window`).toBe(0);
          expect(
            await contrastFailures(page, [`${STAGE} [data-pos='0'] .scn`]),
            where,
          ).toEqual([]);
          expect(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth -
                document.documentElement.clientWidth,
            ),
            where,
          ).toBeLessThanOrEqual(0);
        }
        // The opening and the reading bands of the page, in the tokens of the scenes, pass AA as well
        expect(
          await contrastFailures(page, [
            `${STAGE} [data-caption]`,
            `${STAGE} [data-cap]`,
            "#product nav",
            "#resolves",
            "#capabilities",
            "#audience",
            "#faq",
          ]),
        ).toEqual([]);
        await context.close();
      });
  });

test.describe("capability stage behaviour", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("at least 55% of the cycle of the opening is still (computed styles sampled every 100 ms)", async ({
    page,
  }) => {
    test.setTimeout(120000);
    await toStage(page, "domus");
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
      `still share of the opening: ${(ratio * 100).toFixed(1)}% over ${still.length} samples (cycle ${cycle}s)`,
    );
    expect(ratio).toBeGreaterThanOrEqual(0.55);
  });

  test("reduced motion shows the settled first scene with no animation running", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await toStage(page, "magneto");
    await page.waitForTimeout(6000);
    const state = await page.evaluate((sel) => {
      const root = document.querySelector(sel)!;
      return {
        phases: [...root.querySelectorAll(".scn")].map(
          (el) => (el as HTMLElement).dataset.phase,
        ),
        centre: (root.querySelector('[data-pos="0"]') as HTMLElement).dataset
          .tile,
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
    expect(state.centre).toBe("magneto-sentence");
    expect(state.running).toBe(0);
    await context.close();
  });

  test("the opening plays, pauses off screen and resumes", async ({ page }) => {
    test.setTimeout(60000);
    await toStage(page, "tuner");
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
});

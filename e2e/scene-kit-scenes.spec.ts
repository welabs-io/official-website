// PROVA DAS CENAS DO KIT NO LAB
// The pattern of e2e/scene-kit.spec.ts (the Relloo scene) applied to every other kit scene, one entry per scene: it
// autoplays and loops, a click on its control takes over and gives the scene back, reduced motion shows the settled
// frame with nothing running, every icon sits on the axis of the text it labels (1 px, the `data-axis` pairs: first
// child the mark, second the text; not `data-align`, which the lib's InputGroupAddon writes), no text is cut, and the
// window keeps one height over the loop (1 px).
import { expect, test, type Page } from "@playwright/test";
import {
  expectContinuousLoop,
  expectFinalFrameUnderReducedMotion,
} from "./helpers/continuity";

type Entry = {
  id: string;
  // Accessible name of the window (the scene's label)
  figure: RegExp;
  // Accessible name of the control a visitor clicks
  trigger: RegExp;
  // The settled step
  final: string;
  // Least number of icon/text pairs measured at 1440 and at 390
  pairs: number;
  // Length of one loop, in ms (the sum of the holds)
  cycleMs: number;
  // Role of the trigger (a button unless said otherwise; a segmented control's option is a radio)
  triggerRole?: "button" | "radio";
  // v3 scenes (brief-v3-scenes): over one loop, at most 3 pieces of amber in any frame, none on the settled frame (the
  // end is green or neutral, never amber), and the connector (the Relloo's trace with its riding dot) drawn at each of
  // these steps, per width, and never on the settled frame
  handoff?: { 1440: string[]; 390: string[] };
  // v3 carousel scenes (brief-v3-carousel): the number of frames (`[data-frame]`, the current one `data-current`), all
  // reached over one loop with the chrome's indicator on the same number, at most `amberMax` amber pieces in any frame
  // (the signal or amber-50 as a fill, or the signal as a ring) and no text cut in any frame
  carousel?: { frames: number; amberMax: number };
};

const SCENES: Entry[] = [
  {
    id: "domus-modules",
    figure: /^Domus/,
    trigger: /^Novo módulo/,
    final: "saved",
    // Each module card and the new module's head (6 modules on a phone)
    pairs: 7,
    cycleMs: 5300,
    handoff: { 1440: [], 390: [] },
  },
  {
    id: "magneto-approval",
    figure: /^Magneto/,
    trigger: /^R\$ 4\.800/,
    final: "done",
    // The five steps and the record of the order
    pairs: 6,
    cycleMs: 7800,
    handoff: { 1440: ["low", "high"], 390: [] },
  },
  {
    id: "tuner-carousel",
    figure: /^Tuner/,
    // A channel row of frame 2 (the click waits for the frame to come round)
    trigger: /^E-mail/,
    final: "done",
    // The nodes of the settled frame: the channel the answer came from and the conversation it goes to
    pairs: 2,
    cycleMs: 12200,
    carousel: { frames: 4, amberMax: 2 },
  },
  {
    id: "knowly-answer",
    figure: /^Knowly/,
    trigger: /^Financeiro/,
    triggerRole: "radio",
    final: "done",
    pairs: 4,
    cycleMs: 9800,
    handoff: { 1440: ["s1", "s2", "profile"], 390: [] },
  },
  {
    id: "home-message",
    figure: /mensagem atravessa/,
    trigger: /^Enviar a mensagem/,
    final: "done",
    // The record's identity on its text block (the track's marks and names are checked by the geometry spec)
    pairs: 1,
    cycleMs: 8200,
    handoff: { 1440: ["relloo", "knowly", "magneto", "domus"], 390: ["relloo", "knowly", "magneto", "domus"] },
  },
];

// The icon/text pairs of the live layer whose centres are off by more than 1 px, and how many were measured
async function axisOffsets(page: Page, id: string) {
  return page.evaluate((sceneId) => {
    const live = document.querySelector(`[data-scene="${sceneId}"] > :last-child`)!;
    const mid = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    };
    const out: { name: string; dy: number }[] = [];
    live.querySelectorAll("[data-axis]").forEach((e, i) => {
      const el = e as HTMLElement;
      if (el.offsetParent === null || getComputedStyle(el).visibility === "hidden") return;
      out.push({
        name: `${el.dataset.axis} ${i}`,
        dy: Math.abs(mid(e.children[0]) - mid(e.children[1])),
      });
    });
    return out;
  }, id);
}

// Elements of the live layer whose text overflows their box (cut by an ellipsis or a hidden overflow)
async function cutTexts(page: Page, id: string) {
  return page.evaluate((sceneId) => {
    const live = document.querySelector(`[data-scene="${sceneId}"] > :last-child`)!;
    const cut: string[] = [];
    live.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (!el.childNodes.length || el.offsetParent === null) return;
      const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      const isInput = el instanceof HTMLInputElement && el.value;
      if (!ownText && !isInput) return;
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
        cut.push(`${el.tagName.toLowerCase()} "${(el.textContent || (el as HTMLInputElement).value).trim().slice(0, 40)}"`);
    });
    return cut;
  }, id);
}

for (const s of SCENES) {
  const LAB = `/lab/scenes/${s.id}`;

  test.describe(`scene kit: ${s.id}`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    // The dev server compiles a lab page on its first visit after an edit; that load alone stalls the clock past the
    // sampler's limits, so the page is compiled before the first measure
    test.beforeAll(async ({ request }) => {
      await request.get(LAB, { timeout: 60_000 });
    });

    test("autoplays, loops, and after a click plays, holds, resets and resumes", async ({ page }) => {
      test.setTimeout(60_000);
      await page.goto(LAB);
      const scene = page.getByRole("figure", { name: s.figure });
      await expectContinuousLoop(scene, {
        windowMs: 10_000,
        afterMs: 10_000,
        trigger: scene.getByRole(s.triggerRole ?? "button", { name: s.trigger }),
      });
    });

    test("reduced motion shows the final frame, static", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(LAB);
      const scene = page.getByRole("figure", { name: s.figure });
      await expectFinalFrameUnderReducedMotion(page, scene);
      await expect(scene.locator("[data-scene]")).toHaveAttribute("data-step", s.final);
      await page.waitForTimeout(1500);
      await expect(scene.locator("[data-scene]")).toHaveAttribute("data-step", s.final);
    });

    for (const width of [1440, 390]) {
      test(`icons on the axis of their text, no text cut, at ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(LAB);
        await page.getByRole("figure", { name: s.figure }).waitFor();
        const off = await axisOffsets(page, s.id);
        expect(off.length).toBeGreaterThanOrEqual(s.pairs);
        for (const { name, dy } of off) expect(dy, name).toBeLessThanOrEqual(1);
        expect(await cutTexts(page, s.id)).toEqual([]);
      });

      test(`one window height over the loop at ${width}`, async ({ page }) => {
        test.setTimeout(40_000);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(LAB);
        const scene = page.getByRole("figure", { name: s.figure });
        await scene.scrollIntoViewIfNeeded();
        const heights = new Set<number>();
        const end = Date.now() + s.cycleMs + 1500;
        while (Date.now() < end) {
          const box = await scene.boundingBox();
          heights.add(Math.round(box!.height));
          await page.waitForTimeout(80);
        }
        const all = [...heights];
        expect(Math.max(...all) - Math.min(...all), all.join(",")).toBeLessThanOrEqual(1);
      });

      // ORÇAMENTO DE ÂMBAR E CONECTOR (CENAS V3)
      // Sampled on every animation frame over one loop from the first step: no frame shows more than 3 pieces of amber
      // (#ffb020 or a blend more than half way to it, as a fill), the settled frame shows none, and the connector is
      // drawn at each hand-off step of this width and never on the settled frame (the measure of e2e/scene-kit.spec.ts
      // for the Relloo)
      const handoff = s.handoff;
      if (handoff) {
        test(`at most 3 amber pieces and the connector at each hand-off at ${width}`, async ({ page }) => {
          test.setTimeout(60_000);
          await page.setViewportSize({ width, height: 900 });
          await page.goto(LAB);
          await page.getByRole("figure", { name: s.figure }).scrollIntoViewIfNeeded();
          await page.getByRole("button", { name: "Recomeçar" }).click();
          const seen = await page.evaluate(async (ms) => {
            const stage = document.querySelector('[role="figure"] [data-scene]')!;
            const live = stage.lastElementChild!;
            const amber = (c: string) => {
              const m = c.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?/);
              if (!m) return false;
              const [r, g, b] = m.slice(1, 4).map(Number);
              const a = m[4] === undefined ? 1 : Number(m[4]);
              return a > 0.5 && r > 230 && g > 140 && g < 210 && b < 140;
            };
            const ambers: Record<string, number> = {};
            const traced: Record<string, boolean> = {};
            const t0 = performance.now();
            while (performance.now() - t0 < ms) {
              await new Promise((r) => requestAnimationFrame(r));
              const step = stage.getAttribute("data-step")!;
              const n = [...live.querySelectorAll("*")].filter((el) => {
                const cs = getComputedStyle(el);
                return el.getBoundingClientRect().width > 0 && Number(cs.opacity) > 0.05 && amber(cs.backgroundColor);
              }).length;
              ambers[step] = Math.max(ambers[step] ?? 0, n);
              traced[step] = traced[step] || !!live.querySelector("svg path[pathLength]");
            }
            return { ambers, traced };
          }, s.cycleMs + 500);
          for (const [step, n] of Object.entries(seen.ambers)) expect(n, `amber pieces at ${step}`).toBeLessThanOrEqual(3);
          expect(seen.ambers[s.final], "the settled frame keeps no amber").toBe(0);
          for (const step of handoff[width as 1440 | 390]) expect(seen.traced[step], `connector at ${step}`).toBe(true);
          expect(seen.traced[s.final] ?? false, "no connector on the settled frame").toBe(false);
        });
      }

      // QUADROS DO CARROSSEL (CENAS V3 EM CARROSSEL)
      // Sampled on every animation frame over one loop from the first step: every frame is reached, the chrome's
      // indicator marks the same number as the current frame, no frame shows more than `amberMax` amber pieces, and,
      // once each step has landed (800 ms in), no text of the current frame is cut
      const carousel = s.carousel;
      if (carousel) {
        test(`every frame reached, its indicator, at most ${carousel.amberMax} amber pieces and no text cut at ${width}`, async ({ page }) => {
          test.setTimeout(60_000);
          await page.setViewportSize({ width, height: 900 });
          await page.goto(LAB);
          await page.getByRole("figure", { name: s.figure }).scrollIntoViewIfNeeded();
          await page.getByRole("button", { name: "Recomeçar" }).click();
          const seen = await page.evaluate(async (ms) => {
            const figure = document.querySelector('[role="figure"]')!;
            const stage = figure.querySelector("[data-scene]")!;
            const live = stage.lastElementChild!;
            const rgb = (c: string) => {
              const m = c.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?/);
              return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
            };
            // The signal (#ffb020) or amber-50 (#fff3dd) as a fill, or the signal in a ring (box-shadow)
            const amberFill = (c: string) => {
              const x = rgb(c);
              if (!x || x.a <= 0.5) return false;
              const signal = x.r > 230 && x.g > 140 && x.g < 210 && x.b < 140;
              const soft = x.r > 250 && x.g > 235 && x.g < 250 && x.b > 200 && x.b < 230;
              return signal || soft;
            };
            const amberRing = (s: string) => /rgba?\(255, 176, 32/.test(s);
            const frames: Record<string, { amber: number; indicator: string[]; cut: string[] }> = {};
            const checked = new Set<string>();
            let step = "";
            let since = 0;
            const t0 = performance.now();
            while (performance.now() - t0 < ms) {
              await new Promise((r) => requestAnimationFrame(r));
              const now = performance.now();
              const id = stage.getAttribute("data-step")!;
              if (id !== step) {
                step = id;
                since = now;
              }
              const current = live.querySelector<HTMLElement>('[data-frame][data-current="true"]');
              if (!current) continue;
              const n = current.dataset.frame!;
              const f = (frames[n] ??= { amber: 0, indicator: [], cut: [] });
              const amber = [current, ...current.querySelectorAll("*")].filter((el) => {
                const cs = getComputedStyle(el);
                return (
                  el.getBoundingClientRect().width > 0 &&
                  Number(cs.opacity) > 0.05 &&
                  (amberFill(cs.backgroundColor) || amberRing(cs.boxShadow))
                );
              }).length;
              f.amber = Math.max(f.amber, amber);
              const mark = figure.querySelector('[aria-current="step"]')?.textContent ?? "";
              if (!f.indicator.includes(mark)) f.indicator.push(mark);
              if (now - since > 800 && !checked.has(step)) {
                checked.add(step);
                current.querySelectorAll<HTMLElement>("*").forEach((el) => {
                  if (!el.childNodes.length || el.offsetParent === null) return;
                  const ownText = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent!.trim());
                  if (!ownText) return;
                  if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
                    f.cut.push(`${step}: ${el.tagName.toLowerCase()} "${el.textContent!.trim().slice(0, 40)}"`);
                });
              }
            }
            return { frames, checked: [...checked] };
          }, s.cycleMs + 500);
          const numbers = Array.from({ length: carousel.frames }, (_, i) => String(i + 1));
          expect(Object.keys(seen.frames).sort(), "every frame is reached").toEqual(numbers);
          expect(seen.checked.length, "every step was checked for cut text").toBeGreaterThanOrEqual(carousel.frames);
          // The counter measures what it should: a live piece is seen somewhere in the loop
          expect(Object.values(seen.frames).some((f) => f.amber > 0), "the amber counter sees the live pieces").toBe(true);
          for (const [n, f] of Object.entries(seen.frames)) {
            expect(f.indicator, `the indicator of frame ${n}`).toEqual([n]);
            expect(f.amber, `amber pieces in frame ${n}`).toBeLessThanOrEqual(carousel.amberMax);
            expect(f.cut, `text cut in frame ${n}`).toEqual([]);
          }
        });
      }
    }
  });
}

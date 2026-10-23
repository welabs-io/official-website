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
  // Carousel scenes (brief-v3-carousel): the most pieces of amber a frame may show (default 3; the carousels allow 2),
  // the widths at which the settled frame keeps its connector (the carousel's last frame may point at its source), and
  // the number of frames the loop must reach, in order, with the chrome bar's indicator on the same frame
  amberMax?: number;
  finalTrace?: (1440 | 390)[];
  frames?: number;
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
    id: "tuner-routing",
    figure: /^Tuner/,
    trigger: /^Financeiro/,
    final: "done",
    pairs: 1,
    cycleMs: 9400,
    handoff: { 1440: ["pressed", "taken"], 390: [] },
  },
  {
    id: "knowly-carousel",
    figure: /^Knowly/,
    // A citation of the answer (frame 4) replays the answer, its proofs and their traces
    trigger: /^Reunião · dia 3/,
    final: "done",
    // The assistant's head (mark + name) and the note of what is missing (icon + text)
    pairs: 2,
    cycleMs: 11900,
    // Frame 3: each part points up at its day; frame 4: each citation points back at the decision
    handoff: { 1440: ["asked", "approved", "cite", "done"], 390: [] },
    amberMax: 2,
    finalTrace: [1440],
    frames: 4,
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
      // (#ffb020 or a blend more than half way to it, as a fill or as the ring of an area; a carousel allows 2), the
      // settled frame shows none, and the connector is drawn at each hand-off step of this width and never on the
      // settled frame unless the scene keeps it there (the measure of e2e/scene-kit.spec.ts for the Relloo). A carousel
      // also reaches each of its frames, in order, with the indicator of the chrome bar on the frame shown
      const handoff = s.handoff;
      const amberMax = s.amberMax ?? 3;
      if (handoff) {
        test(`at most ${amberMax} amber pieces and the connector at each hand-off at ${width}`, async ({ page }) => {
          test.setTimeout(60_000);
          await page.setViewportSize({ width, height: 900 });
          await page.goto(LAB);
          await page.getByRole("figure", { name: s.figure }).scrollIntoViewIfNeeded();
          await page.getByRole("button", { name: "Recomeçar" }).click();
          const seen = await page.evaluate(async (ms) => {
            const figure = document.querySelector('[role="figure"]')!;
            const stage = figure.querySelector("[data-scene]")!;
            const live = stage.lastElementChild!;
            const amber = (c: string) => {
              const m = c.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?/);
              if (!m) return false;
              const [r, g, b] = m.slice(1, 4).map(Number);
              const a = m[4] === undefined ? 1 : Number(m[4]);
              return a > 0.5 && r > 230 && g > 140 && g < 210 && b < 140;
            };
            // Every colour of a shadow list (an amber ring is drawn as a box-shadow)
            const shadowColours = (s: string) => s.match(/rgba?\([^)]*\)/g) ?? [];
            const ambers: Record<string, number> = {};
            const traced: Record<string, boolean> = {};
            const frames: string[] = [];
            let offIndicator = 0;
            const t0 = performance.now();
            while (performance.now() - t0 < ms) {
              await new Promise((r) => requestAnimationFrame(r));
              const step = stage.getAttribute("data-step")!;
              const n = [...live.querySelectorAll("*")].filter((el) => {
                const cs = getComputedStyle(el);
                return (
                  el.getBoundingClientRect().width > 0 &&
                  Number(cs.opacity) > 0.05 &&
                  (amber(cs.backgroundColor) || shadowColours(cs.boxShadow).some(amber))
                );
              }).length;
              ambers[step] = Math.max(ambers[step] ?? 0, n);
              traced[step] = traced[step] || !!live.querySelector("svg path[pathLength]");
              const frame = live.querySelector("[data-frame]")?.getAttribute("data-frame");
              if (frame && frames.at(-1) !== frame) frames.push(frame);
              const current = figure.querySelector('[aria-current="step"]')?.textContent;
              if (frame && current !== frame) offIndicator += 1;
            }
            return { ambers, traced, frames, offIndicator };
          }, s.cycleMs + 500);
          for (const [step, n] of Object.entries(seen.ambers)) expect(n, `amber pieces at ${step}`).toBeLessThanOrEqual(amberMax);
          expect(seen.ambers[s.final], "the settled frame keeps no amber").toBe(0);
          for (const step of handoff[width as 1440 | 390]) expect(seen.traced[step], `connector at ${step}`).toBe(true);
          const keeps = s.finalTrace?.includes(width as 1440 | 390) ?? false;
          expect(seen.traced[s.final] ?? false, keeps ? "the settled frame keeps its connector" : "no connector on the settled frame").toBe(keeps);
          if (s.frames) {
            // From the first frame, every frame in order (the loop may come back to the first one at the end)
            const order = Array.from({ length: s.frames }, (_, i) => String(i + 1));
            expect(seen.frames.slice(0, s.frames), `frames reached: ${seen.frames.join(", ")}`).toEqual(order);
            expect(seen.offIndicator, "the chrome bar's indicator shows the frame on screen").toBe(0);
          }
        });
      }
    }
  });
}

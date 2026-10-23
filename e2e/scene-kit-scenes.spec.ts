// PROVA DAS CENAS DO KIT NO LAB
// The continuity contract of the kit applied to every kit scene, one entry per scene in one table: it autoplays and
// loops, a click on its control takes over and gives the scene back, reduced motion shows the settled frame with
// nothing running, every icon sits on the axis of the text it labels (1 px, the `data-axis` pairs: first child the
// mark, second the text; not `data-align`, which the lib's InputGroupAddon writes), no text is cut, the window keeps
// one height over the loop (1 px), and over one loop the amber budget, the connector at each hand-off and, for a
// carousel, every frame in order with the chrome's frame indicator on the frame shown.
import { expect, test, type Page } from "@playwright/test";
import {
  expectContinuousLoop,
  expectFinalFrameUnderReducedMotion,
} from "./helpers/continuity";

type Width = 1440 | 390;

type Entry = {
  id: string;
  // Accessible name of the window (the scene's label)
  figure: RegExp;
  // Accessible name of the control a visitor clicks
  trigger: RegExp;
  // Role of the trigger (a button unless said otherwise; an option of the frame indicator is a radio)
  triggerRole?: "button" | "radio";
  // The settled step
  final: string;
  // Least number of icon/text pairs measured at 1440 and at 390
  pairs: number;
  // Length of one loop, in ms (the sum of the holds)
  cycleMs: number;
  // v3 scenes (brief-v3-scenes): the steps, per width, at which the connector (the kit's trace) is drawn
  handoff?: Record<Width, string[]>;
  // The most pieces of amber any step may show (default 3; the carousels allow 2), counted as fills (the signal, a
  // blend more than half way to it, or amber-50) and as rings (the signal in a box-shadow)
  amberMax?: number;
  // How many of them the settled frame keeps (default 0: the end is green or neutral; a carousel's last frame may keep
  // its live piece, as the approved frames draw it)
  finalAmber?: number;
  // The widths at which the settled frame keeps its connector (default none: the last frame of a carousel may end on
  // its links)
  finalTrace?: Width[];
  // v3 carousels (brief-v3-carousel): the number of frames (`data-frame` in the live layer) the loop reaches, in order,
  // with the chrome's frame indicator on the frame shown and no text cut in any of them
  frames?: number;
};

const SCENES: Entry[] = [
  {
    id: "relloo-carousel",
    figure: /^Relloo/,
    // The frame indicator of the chrome (the kit's FrameIndicator, the lib's SegmentedControl): its options are radios
    trigger: /^Momento 2$/,
    triggerRole: "radio",
    final: "f4-ask",
    // The Domus card under the funnel (its mark on its two lines)
    pairs: 1,
    cycleMs: 15200,
    handoff: {
      1440: ["f2-handoff", "f2-summary", "f3-born", "f4-domus"],
      // On a phone the panes of frame 3 stack and its trace stays off (it would cross the conversation)
      390: ["f2-handoff", "f2-summary", "f4-domus"],
    },
    amberMax: 2,
    finalAmber: 1,
    finalTrace: [1440, 390],
    frames: 4,
  },
  {
    id: "domus-carousel",
    figure: /^Domus/,
    // Confirmar (frame 3): the take plays the rest of the loop (5.4 s), so its settled frame holds inside the window
    trigger: /^Confirmar/,
    final: "cta",
    // The settled frame: the record's head and its four neighbours (the other frames are hidden)
    pairs: 5,
    cycleMs: 12_900,
    // The new type to its screen, the confirmed record to its row, the record to its neighbours (side by side only)
    handoff: { 1440: ["screen", "linked", "links", "cta"], 390: [] },
    amberMax: 2,
    finalTrace: [1440],
    frames: 4,
  },
  {
    id: "magneto-carousel",
    figure: /^Magneto/,
    // The frame indicator (a click on a frame plays from it). Frame 3: from there the sequence and its last hold end
    // inside the kit's 8 s of human idle (from frame 2 the idle cuts the hold)
    trigger: /^Momento 3$/,
    triggerRole: "radio",
    final: "ask",
    // The last frame: the approved step, the live step and its two lines, and the two products it reached
    pairs: 6,
    cycleMs: 12600,
    amberMax: 2,
    frames: 4,
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
    amberMax: 2,
    frames: 4,
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

    for (const width of [1440, 390] as const) {
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

      // ORÇAMENTO DE ÂMBAR, CONECTOR E QUADROS (CENAS V3)
      // Sampled on every animation frame over one loop from the first step: no step shows more than `amberMax` pieces
      // of amber (as a fill or as a ring), the settled frame shows `finalAmber`, the connector is drawn at each hand-off
      // step of this width and on the settled frame only where the scene keeps it there. A carousel also reaches each
      // of its frames, in order, with the chrome's indicator on the frame shown, and, once each step has landed (800 ms
      // in), no text of the frame shown is cut
      if (s.handoff || s.frames) {
        const amberMax = s.amberMax ?? 3;
        test(`at most ${amberMax} amber pieces, the connector at each hand-off${s.frames ? " and every frame" : ""} at ${width}`, async ({ page }) => {
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
            // The signal (#ffb020) or a blend more than half way to it, or amber-50 (#fff3dd)
            const amber = (c: string) => {
              const x = rgb(c);
              if (!x || x.a <= 0.5) return false;
              const signal = x.r > 230 && x.g > 140 && x.g < 210 && x.b < 140;
              const soft = x.r > 250 && x.g > 235 && x.g < 250 && x.b > 200 && x.b < 230;
              return signal || soft;
            };
            // Every colour of a shadow list: an amber ring (a live piece's edge) is a piece of amber too
            const ring = (shadow: string) => (shadow.match(/rgba?\([^)]*\)/g) ?? []).some(amber);
            const ambers: Record<string, number> = {};
            const traced: Record<string, boolean> = {};
            // The frames in the order they are first shown, the indicator's frame seen with each, and the cut texts
            const order: string[] = [];
            const marks: Record<string, string[]> = {};
            const cut: string[] = [];
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
              const n = [...live.querySelectorAll("*")].filter((el) => {
                const cs = getComputedStyle(el);
                return (
                  el.getBoundingClientRect().width > 0 &&
                  Number(cs.opacity) > 0.05 &&
                  (amber(cs.backgroundColor) || ring(cs.boxShadow))
                );
              }).length;
              ambers[step] = Math.max(ambers[step] ?? 0, n);
              traced[step] = traced[step] || !!live.querySelector("svg path[pathLength]");

              // The frame shown: the one marked current, or the only one laid out (none while two cross)
              const all = [...live.querySelectorAll<HTMLElement>("[data-frame]")];
              const current =
                all.find((f) => f.dataset.current === "true") ??
                (new Set(all.map((f) => f.dataset.frame)).size === 1 ? all[0] : undefined);
              if (!current) continue;
              const frame = current.dataset.frame!;
              if (!order.includes(frame)) order.push(frame);
              const checkedOption = figure.querySelector('[data-frame-indicator] [role="radio"][aria-checked="true"]');
              const mark = checkedOption?.textContent?.match(/\d+/)?.[0] ?? "none";
              if (!(marks[frame] ??= []).includes(mark)) marks[frame].push(mark);
              if (now - since > 800 && !checked.has(step)) {
                checked.add(step);
                current.querySelectorAll<HTMLElement>("*").forEach((el) => {
                  if (!el.childNodes.length || el.offsetParent === null) return;
                  const ownText = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent!.trim());
                  if (!ownText) return;
                  if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
                    cut.push(`${step}: ${el.tagName.toLowerCase()} "${el.textContent!.trim().slice(0, 40)}"`);
                });
              }
            }
            return { ambers, traced, order, marks, cut, checked: checked.size };
          }, s.cycleMs + 500);

          for (const [step, n] of Object.entries(seen.ambers)) expect(n, `amber pieces at ${step}`).toBeLessThanOrEqual(amberMax);
          expect(seen.ambers[s.final], "amber on the settled frame").toBe(s.finalAmber ?? 0);
          for (const step of s.handoff?.[width] ?? []) expect(seen.traced[step], `connector at ${step}`).toBe(true);
          const keeps = s.finalTrace?.includes(width) ?? false;
          expect(seen.traced[s.final] ?? false, keeps ? "the settled frame keeps its connector" : "no connector on the settled frame").toBe(keeps);
          if (s.frames) {
            const numbers = Array.from({ length: s.frames }, (_, i) => String(i + 1));
            expect(seen.order, "every frame, in order").toEqual(numbers);
            // The counter measures what it should: a live piece is seen somewhere in the loop
            expect(Object.values(seen.ambers).some((n) => n > 0), "the amber counter sees the live pieces").toBe(true);
            for (const n of numbers) expect(seen.marks[n], `the indicator on frame ${n}`).toEqual([n]);
            expect(seen.checked, "every step was checked for cut text").toBeGreaterThanOrEqual(s.frames);
            expect(seen.cut, "text cut in a frame").toEqual([]);
          }
        });
      }
    }
  });
}

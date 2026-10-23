// PROVA DO GRAFO DE MEMÓRIA DO KNOWLY
// What the shared kit specs (scene-kit-scenes, scene-kit-geometry, lib-parity) cannot see in the v4 Knowly scene,
// which draws its live pieces as SVG strokes and fills: over one loop at 1440 and at 390, every frame is reached in
// order, no step shows more than 2 pieces of amber (SVG strokes and fills counted with the HTML areas and rings), the
// camera only pulls back (the zoom never grows inside a loop) and ends at 8 %, the window and the pane keep one size,
// and no label overlaps another or leaves the pane once it has landed. Under reduced motion the scene shows the whole
// constellation at 8 %, still, with the closing question and the lib's primary pointing at the contact.
import { expect, test } from "@playwright/test";

const LAB = "/lab/scenes/knowly-carousel";
const FIGURE = /^Knowly/;

test.describe("knowly memory graph", () => {
  test.beforeAll(async ({ request }) => {
    await request.get(LAB, { timeout: 60_000 });
  });

  for (const width of [1440, 390] as const) {
    test(`one loop at ${width}: frames, amber, zoom, size and labels`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(LAB);
      await page.getByRole("figure", { name: FIGURE }).scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: "Recomeçar" }).click();
      const seen = await page.evaluate(async (ms) => {
        const figure = document.querySelector('[role="figure"]')!;
        const stage = figure.querySelector("[data-scene]")!;
        const live = stage.lastElementChild!;
        const amber = (c: string) => {
          const m = c.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?/);
          if (!m || (m[4] !== undefined && +m[4] <= 0.5)) return false;
          const [r, g, b] = [+m[1], +m[2], +m[3]];
          const signal = r > 230 && g > 140 && g < 210 && b < 140;
          const soft = r > 250 && g > 235 && g < 250 && b > 200 && b < 230;
          return signal || soft;
        };
        // The opacity a visitor sees: the element's own times its ancestors' (the old loop fades out over the new)
        const opacity = (el: Element) => {
          let o = 1;
          for (let n: Element | null = el; n && n !== stage; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
          return o;
        };
        const shown = (el: Element) =>
          el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== "hidden" && opacity(el) > 0.05;
        const ambers: Record<string, number> = {};
        const order: string[] = [];
        const zooms: { step: string; z: number }[] = [];
        const sizes = new Set<string>();
        const labelIssues = new Set<string>();
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
          const root = live.querySelector<HTMLElement>("[data-current]");
          if (!root) continue;
          const frame = root.dataset.frame!;
          if (!order.includes(frame)) order.push(frame);
          const pane = root.getBoundingClientRect();
          sizes.add(`${Math.round(figure.getBoundingClientRect().height)}/${Math.round(pane.height)}`);

          // Amber: SVG strokes and fills, HTML fills and rings
          let n = 0;
          for (const el of live.querySelectorAll("*")) {
            const cs = getComputedStyle(el);
            const svg = el instanceof SVGElement;
            const hit = svg
              ? (cs.stroke !== "none" && amber(cs.stroke)) || (cs.fill !== "none" && amber(cs.fill))
              : amber(cs.backgroundColor) || (cs.boxShadow.match(/rgba?\([^)]*\)/g) ?? []).some(amber);
            if (hit && (svg ? opacity(el) > 0.05 && el.getAttribute("data-in") !== "false" : shown(el))) n++;
          }
          ambers[step] = Math.max(ambers[step] ?? 0, n);

          // The zoom of the newest world (the last camera in the live layer)
          const cameras = live.querySelectorAll<HTMLElement>("[data-current] [data-move]");
          const camera = cameras[cameras.length - 1];
          if (camera) zooms.push({ step, z: Number(getComputedStyle(camera).getPropertyValue("--z")) });

          // Labels that have landed (fully shown, 900 ms into their step): inside the pane, under its head, apart
          if (now - since > 900) {
            const head = root.querySelector("[data-lead]")!.getBoundingClientRect();
            const boxes = [...root.querySelectorAll<HTMLElement>("[data-label]")]
              .filter((l) => getComputedStyle(l).display !== "none" && opacity(l) > 0.9)
              .map((l) => [l.dataset.label!, l.getBoundingClientRect()] as const);
            for (const [name, b] of boxes)
              if (b.left < pane.left || b.right > pane.right || b.top < head.bottom || b.bottom > pane.bottom)
                labelIssues.add(`${step}: ${name} out of the pane`);
            for (let i = 0; i < boxes.length; i++)
              for (let j = i + 1; j < boxes.length; j++) {
                const [a, b] = [boxes[i][1], boxes[j][1]];
                if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom)
                  labelIssues.add(`${step}: ${boxes[i][0]} over ${boxes[j][0]}`);
              }
          }
        }
        return { ambers, order, zooms, sizes: [...sizes], labelIssues: [...labelIssues] };
      }, 12_600 + 400);

      expect(seen.order, "every frame, in order").toEqual(["1", "2", "3", "4"]);
      for (const [step, n] of Object.entries(seen.ambers)) expect(n, `amber pieces at ${step}`).toBeLessThanOrEqual(2);
      // The live link of each frame is seen (with its node or its chip, or the legend's swatch)
      for (const step of ["f1-link", "f2-decision", "f3-bridge", "f4-new"])
        expect(seen.ambers[step], `the live piece at ${step}`).toBeGreaterThanOrEqual(1);
      // The camera only pulls back inside the loop (until the next loop's first step), and ends at 8 %
      const wrap = seen.zooms.findIndex((s, i) => i > 0 && s.step === "f1-seed" && seen.zooms[i - 1].step === "done");
      const loop = wrap < 0 ? seen.zooms : seen.zooms.slice(0, wrap);
      for (let i = 1; i < loop.length; i++)
        expect(loop[i].z, `zoom at ${loop[i].step}`).toBeLessThanOrEqual(loop[i - 1].z + 1e-3);
      const settled = loop.filter((s) => s.step === "done");
      expect(settled.at(-1)?.z ?? 0, "the settled zoom").toBeCloseTo(0.08, 2);
      expect(seen.sizes, "one window and pane size over the loop").toHaveLength(1);
      expect(seen.labelIssues, "labels inside the pane, apart").toEqual([]);
    });
  }

  test("reduced motion shows the whole constellation at 8 %, still, with the question and the call to action", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(LAB);
    const scene = page.getByRole("figure", { name: FIGURE });
    await scene.scrollIntoViewIfNeeded();
    const state = await scene.evaluate((figure) => {
      const live = figure.querySelector("[data-scene]")!.lastElementChild!;
      const dots = [...live.querySelectorAll("path[data-kind]")];
      const links = [...live.querySelectorAll("path[pathLength]")];
      const camera = live.querySelector<HTMLElement>("[data-move]")!;
      return {
        nodes: dots.length + 1,
        dotsIn: dots.filter((d) => d.getAttribute("data-in") === "true").length,
        linksIn: links.filter((d) => d.getAttribute("data-in") === "true").length,
        links: links.length,
        z: Number(getComputedStyle(camera).getPropertyValue("--z")),
        running: figure.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
      };
    });
    expect(state.nodes, "a light graph").toBeLessThan(300);
    expect(state.dotsIn, "every node in").toBe(state.nodes - 1);
    expect(state.linksIn, "every link in").toBe(state.links);
    expect(state.z).toBeCloseTo(0.08, 3);
    expect(state.running, "nothing runs").toBe(0);
    await expect(scene.getByText("O que a sua empresa já decidiu e esqueceu?")).toBeVisible();
    await expect(scene.getByRole("link", { name: "Agendar uma demonstração" })).toHaveAttribute("href", "/#contact");
  });
});

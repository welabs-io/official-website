// QUADROS DA HOME E RODAPÉ
// The five product frames of the home (components/home/frames.tsx), in the opening (the blades) and in the accordion,
// and the footer (operator, 2026-10-24). Measured on the running page (PORTFOLIO_PREVIEW_URL):
//  - the Domus frame moves: over one loop it walks several steps and paints different pictures;
//  - every frame closes its chain before the loop starts again: the steps are recorded in the page, and after the
//    closing step (data-frame-closed) comes the first one, never a jump back from the middle; on the closing step every
//    drawn link of the frame is in ink (none at rest, none live) and the end is green (the Domus lights the four, the
//    Relloo deal is won, every Magneto step is done, the Tuner conversation holds the three channels);
//  - in the opening, the chain closes while the frame is still uncovered (before the blades come back at 4.4 s);
//  - the Knowly frame is the memory graph of its carousel (the graph's links and the brand's globe), not the answer
//    with its source;
//  - under reduced motion each frame shows its closed chain, still;
//  - the footer names each product by its official logo, with the same entry as the header's menu.
import { expect, test, type Locator, type Page } from "@playwright/test";

test.setTimeout(120_000);

const SLUGS = ["domus", "relloo", "magneto", "tuner", "knowly"] as const;
type Slug = (typeof SLUGS)[number];

// The first step of each frame's loop (components/home/frames.tsx STEPS)
const FIRST: Record<Slug, string> = {
  domus: "born",
  relloo: "talk",
  magneto: "approve",
  tuner: "message",
  knowly: "f1-link",
};
// The blades of the opening start to come back 4.4 s after a frame mounts (components/home/HeroBlades.tsx OUT_AT_MS)
const UNCOVERED_MS = 4_400;

const panel = (slug: Slug) => `#products [data-panel="${slug}"]`;

// Opens a panel by the keyboard (its logo link takes the focus), with the pointer parked outside the row: a hover
// lands on a panel whose width is still moving, and the pointer may end up over its neighbour
async function openPanel(page: Page, slug: Slug) {
  await page.mouse.move(5, 5);
  await page.locator(`${panel(slug)} [data-card]`).focus();
}

// Records in the page every step a frame shows, with the time since recording started; `scope` holds the frame
async function recordSteps(page: Page, scope: string) {
  await page.evaluate((sel) => {
    const w = window as unknown as {
      __steps: { id: string; t: number; slug: string }[];
    };
    w.__steps = [];
    const root = document.querySelector(sel)!;
    const t0 = performance.now();
    let last = "";
    const check = () => {
      const fr = root.querySelector<HTMLElement>("[data-frame-step]");
      if (!fr) return;
      const key = `${fr.dataset.frame}:${fr.dataset.frameStep}`;
      if (key === last) return;
      last = key;
      w.__steps.push({
        id: fr.dataset.frameStep!,
        slug: fr.dataset.frame!,
        t: Math.round(performance.now() - t0),
      });
    };
    new MutationObserver(check).observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-frame-step"],
    });
    check();
  }, scope);
}

const steps = (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __steps: { id: string; t: number; slug: string }[];
        }
      ).__steps,
  );

// The state of a frame on its closing step: its drawn links, and the green end of its chain
const closedState = (frame: Locator) =>
  frame.evaluate((root) => ({
    closed: root.hasAttribute("data-frame-closed"),
    links: [...root.querySelectorAll("svg[data-trace-state]")]
      .filter((svg) => svg.querySelector("path"))
      .map((svg) => svg.getAttribute("data-trace-state")),
    lit: [...root.querySelectorAll("[data-use]")].map((el) =>
      el.hasAttribute("data-lit"),
    ),
    won: root.querySelectorAll("[data-stage][data-won]").length,
    stepStates: [...root.querySelectorAll("[data-step-state]")].map((el) =>
      el.getAttribute("data-step-state"),
    ),
    thread:
      root.querySelector("[data-thread]")?.hasAttribute("data-done") ?? null,
    graph: root.querySelectorAll("[data-graph] svg path").length,
  }));

function expectGreenEnd(
  slug: Slug,
  s: Awaited<ReturnType<typeof closedState>>,
) {
  expect(s.closed, `${slug}: closed`).toBe(true);
  if (slug === "knowly") {
    expect(s.graph, "knowly: the graph").toBeGreaterThan(100);
    return;
  }
  expect(s.links.length, `${slug}: links drawn`).toBeGreaterThan(0);
  expect(
    s.links.every((l) => l === "active"),
    `${slug}: ${s.links}`,
  ).toBe(true);
  if (slug === "domus") expect(s.lit).toEqual([true, true, true, true]);
  if (slug === "relloo") expect(s.won).toBe(1);
  if (slug === "magneto")
    expect(s.stepStates.every((x) => x === "done")).toBe(true);
  if (slug === "tuner") expect(s.thread).toBe(true);
}

// After the closing step comes the first one, and the first one only comes after the closing step (or at the start)
function expectClosesBeforeRestart(
  slug: Slug,
  seq: { id: string; t: number }[],
  last: string,
) {
  const ids = seq.map((s) => s.id);
  expect(ids, `${slug}: ${ids.join(" ")}`).toContain(last);
  for (let i = 1; i < ids.length; i++)
    if (ids[i] === FIRST[slug])
      expect(ids[i - 1], `${slug}: ${ids.join(" ")}`).toBe(last);
  // At least one whole loop: the first step comes back after the close
  const closeAt = ids.indexOf(last);
  expect(ids.slice(closeAt + 1), `${slug}: ${ids.join(" ")}`).toContain(
    FIRST[slug],
  );
}

const LAST: Record<Slug, string> = {
  domus: "done",
  relloo: "done",
  magneto: "done",
  tuner: "done",
  knowly: "f4-new",
};

test.describe("the frames of the home", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the Domus frame moves: several steps and different pictures over a loop", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#products").scrollIntoViewIfNeeded();
    await page.mouse.move(5, 5);
    const frame = page.locator(`${panel("domus")} [data-frame="domus"]`);
    await recordSteps(page, panel("domus"));
    const shots = new Set<string>();
    const t0 = Date.now();
    while (Date.now() - t0 < 7_000) {
      shots.add(
        (await frame.screenshot({ animations: "allow" })).toString("base64"),
      );
      await page.waitForTimeout(400);
    }
    const ids = new Set((await steps(page)).map((s) => s.id));
    expect(ids.size, [...ids].join(" ")).toBeGreaterThanOrEqual(5);
    expect(shots.size).toBeGreaterThanOrEqual(4);
  });

  for (const slug of SLUGS)
    test(`the accordion: ${slug} closes its chain before the loop starts again`, async ({
      page,
    }) => {
      await page.goto("/");
      await page.locator("#products").scrollIntoViewIfNeeded();
      await openPanel(page, slug);
      const frame = page.locator(`${panel(slug)} [data-frame="${slug}"]`);
      await expect(frame).toBeVisible();
      await recordSteps(page, panel(slug));
      // The Domus panel is open from the start, so its frame may still show the settled (closed) frame of the server:
      // the chain is measured from the first step of the clock on
      await page
        .locator(`${panel(slug)} [data-frame-step="${FIRST[slug]}"]`)
        .waitFor({ timeout: 9_000 });
      await page
        .locator(`${panel(slug)} [data-frame="${slug}"][data-frame-closed]`)
        .waitFor({ timeout: 9_000 });
      await page.waitForTimeout(600);
      expectGreenEnd(slug, await closedState(frame));
      // One loop is 6.4 s: watch until the first step is back after the close
      await expect
        .poll(
          async () =>
            (await steps(page)).map((s) => s.id).lastIndexOf(FIRST[slug]),
          {
            timeout: 9_000,
          },
        )
        .toBeGreaterThan(0);
      expectClosesBeforeRestart(slug, await steps(page), LAST[slug]);
    });

  test("the opening: each frame closes its chain while it is uncovered", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-hub='blades'] [data-frame-step]").waitFor();
    await recordSteps(page, "[data-hub='blades']");
    // Five products of 7 s, and the Domus once more (its first mount may start before the recording)
    await page.waitForTimeout(41_000);
    const seq = await steps(page);
    // One run per mount of a frame: the steps until the stage passes to another product
    const runs: { slug: string; ids: string[]; ts: number[] }[] = [];
    for (const s of seq) {
      const run = runs.at(-1);
      if (run && run.slug === s.slug) {
        run.ids.push(s.id);
        run.ts.push(s.t);
      } else runs.push({ slug: s.slug, ids: [s.id], ts: [s.t] });
    }
    for (const slug of SLUGS) {
      // From the first step of the mount to the close, inside the time the frame is uncovered
      const times = runs
        .filter((r) => r.slug === slug && r.ids[0] === FIRST[slug])
        .map((r) => {
          const close = r.ids.indexOf(LAST[slug]);
          return close < 0 ? Infinity : r.ts[close] - r.ts[0];
        });
      const seen = runs
        .filter((r) => r.slug === slug)
        .map((r) => r.ids.join(" "));
      expect(times.length, `${slug}: ${seen.join(" | ")}`).toBeGreaterThan(0);
      expect(
        Math.min(...times),
        `${slug}: ${seen.join(" | ")}`,
      ).toBeLessThanOrEqual(UNCOVERED_MS);
    }
  });

  test("the Knowly frame is the memory graph, in the opening and in the accordion", async ({
    page,
  }) => {
    await page.goto("/");
    const graph = async (frame: Locator) =>
      frame.evaluate((root) => ({
        links: root.querySelectorAll("[data-graph] svg path[data-level]")
          .length,
        globe:
          root
            .querySelector<HTMLImageElement>("[data-graph] img")
            ?.getAttribute("src") ?? "",
        answer: root.querySelectorAll("[data-answer], [data-source]").length,
      }));
    const hero = page.locator(
      "[data-hub='blades'][data-product='knowly'] [data-frame='knowly']",
    );
    await hero.waitFor({ timeout: 35_000 });
    const h = await graph(hero);
    expect(h.links).toBeGreaterThan(100);
    expect(h.globe).toBe("/brands/welabs/symbols/knowly-light.svg");
    expect(h.answer).toBe(0);
    await page.locator("#products").scrollIntoViewIfNeeded();
    await openPanel(page, "knowly");
    const acc = page.locator(`${panel("knowly")} [data-frame="knowly"]`);
    await expect(acc).toBeVisible();
    const a = await graph(acc);
    expect(a.links).toBeGreaterThan(100);
    expect(a.globe).toBe("/brands/welabs/symbols/knowly-light.svg");
    expect(a.answer).toBe(0);
  });
});

test.describe("under reduced motion", () => {
  test.use({
    viewport: { width: 1440, height: 900 },
    contextOptions: { reducedMotion: "reduce" },
  });

  test("each frame shows its closed chain, still", async ({ page }) => {
    await page.goto("/");
    await page.locator("#products").scrollIntoViewIfNeeded();
    for (const slug of SLUGS) {
      await openPanel(page, slug);
      const frame = page.locator(`${panel(slug)} [data-frame="${slug}"]`);
      await expect(frame).toBeVisible();
      await page.waitForTimeout(800);
      const before = await frame.getAttribute("data-frame-step");
      expect(before).toBe(LAST[slug]);
      expectGreenEnd(slug, await closedState(frame));
      await page.waitForTimeout(1_500);
      expect(await frame.getAttribute("data-frame-step")).toBe(before);
    }
  });
});

test.describe("the footer", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ])
    test(`names each product by its official logo, as the header's menu does, at ${viewport.width}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      const footer = page.locator("footer");
      await footer.scrollIntoViewIfNeeded();
      const read = (scope: string) =>
        page.locator(`${scope} [data-product-entry]`).evaluateAll((els) =>
          els.map((a) => {
            const img = a.querySelector("img")!;
            return {
              slug: a.getAttribute("data-product-entry"),
              href: a.getAttribute("href"),
              cls: a.className,
              alt: img.alt,
              src: img.getAttribute("src"),
              loaded: img.complete && img.naturalWidth > 0,
              h: Math.round(img.getBoundingClientRect().height),
            };
          }),
        );
      const foot = await read("footer");
      const head = await read("header");
      expect(foot.map((e) => e.slug)).toEqual([...SLUGS]);
      expect(head.map((e) => e.slug)).toEqual([...SLUGS]);
      for (const [i, e] of foot.entries()) {
        // The dark file of the official logo on the graphite band, drawn and readable
        expect(e.src).toBe(`/brands/welabs/products/${e.slug}-dark.svg`);
        expect(e.loaded, e.slug!).toBe(true);
        expect(e.h).toBeGreaterThanOrEqual(28);
        // The same entry as the header's menu: the same link, class and accessible name, the light file there
        expect(e.href).toBe(head[i].href);
        expect(e.href).toBe(`/products/${e.slug}`);
        expect(e.cls).toBe(head[i].cls);
        expect(e.alt).toBe(head[i].alt);
        expect(head[i].src).toBe(`/brands/welabs/products/${e.slug}-light.svg`);
      }
      // No bare product name is left in the footer's text
      expect(
        (await footer.innerText()).match(/Domus|Relloo|Magneto|Tuner|Knowly/g),
      ).toBeNull();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(0);
    });
});

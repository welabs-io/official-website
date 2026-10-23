// OS BLOCOS DA V2.1, UM A UM
// One spec per block of the round (the operator follows the 5180 preview block by block):
//  (a) the tokens of the ERP front: page, surfaces, the action button, the focus ring, and AA contrast of the text of the
//      components that changed;
//  (c) the motions act again: the stage cycles with packets, the outcomes play, the opening of a product plays its
//      carousel (v3);
//  (e) the Domus shows the real modules on two floors inside the ring of its logo, and "+ Novo módulo" makes a new
//      module with its seal and its screen, which then closes on its own.
// v3 (2026-10-23): (f) the message of the v2 and (g) the play of the Tuner left; their kit scenes are held elsewhere.
// The overlap and cut checks are e2e/layout.spec.ts (block b); the transitions and the brand openings,
// e2e/transitions.spec.ts (blocks c and d).
import { expect, test, type Page } from "@playwright/test";

// The contrast of the text of a scope, against the first painted background under it (WCAG 2.2)
async function contrasts(page: Page, scope: string) {
  return page.evaluate((scope) => {
    const lin = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const parse = (c: string) => {
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a: a / 255 };
    };
    const lum = ({ r, g, b }: { r: number; g: number; b: number }) =>
      0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    // v3 (2026-10-23): the background is what is painted under the middle of the text (the stack of elements at that
    // point), not only its ancestors: the lib's SegmentedControl paints its chosen option with a sliding thumb that is a
    // sibling under the label (measured on the frame indicator of the kit carousels: white on the black thumb read as
    // white on white). An element out of view falls back to its ancestors.
    const bgOf = (el: Element) => {
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const stack =
        x >= 0 && y >= 0 && x < innerWidth && y < innerHeight
          ? document.elementsFromPoint(x, y)
          : [];
      // From the text itself down (anything stacked above it is not its background); a text not hit at its middle
      // (clipped by a mask, covered) is read against its ancestors only
      const from = stack.findIndex((s) => s === el || el.contains(s));
      for (const under of from < 0 ? [] : stack.slice(from)) {
        const c = parse(getComputedStyle(under).backgroundColor);
        if (c.a > 0.9) return c;
      }
      for (let up: Element | null = el; up; up = up.parentElement) {
        const c = parse(getComputedStyle(up).backgroundColor);
        if (c.a > 0.9) return c;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    };
    const out: { text: string; ratio: number; need: number }[] = [];
    for (const root of document.querySelectorAll(scope))
      for (const el of root.querySelectorAll("*")) {
        const own = [...el.childNodes].some(
          (n) => n.nodeType === 3 && (n.textContent ?? "").trim(),
        );
        if (!own) continue;
        const cs = getComputedStyle(el);
        if (
          cs.visibility === "hidden" ||
          cs.display === "none" ||
          Number(cs.opacity) < 0.95
        )
          continue;
        if (el.closest('[aria-hidden="true"] [data-mini], [data-mini]'))
          continue;
        // Text for assistive technology only (the `sr-only` of the lib: a 1 px clipped box) is not painted
        const box = el.getBoundingClientRect();
        if (box.width <= 1 || box.height <= 1) continue;
        const fg = parse(cs.color);
        const bg = bgOf(el);
        const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
        const size = parseFloat(cs.fontSize);
        const large =
          size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
        out.push({
          text: (el.textContent ?? "").trim().slice(0, 30),
          ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100,
          need: large ? 3 : 4.5,
        });
      }
    return out;
  }, scope);
}

test.describe("(a) the tokens of the ERP front", () => {
  test("page, surfaces, the action button and the focus ring", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    const t = await page.evaluate(() => {
      const cs = (sel: string) =>
        getComputedStyle(document.querySelector(sel)!);
      // The button of the header (the one in the menu panel is for a narrow phone)
      const cta = cs("header > div > a[href='/#contact']");
      return {
        body: getComputedStyle(document.body).backgroundColor,
        page: cs("#top").backgroundColor,
        // The single theme token of the floor (app/lib.css --background), resolved as a colour
        token: (() => {
          const probe = document.createElement("i");
          probe.style.backgroundColor = "var(--background)";
          document.body.append(probe);
          const value = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return value;
        })(),
        ctaBg: cta.backgroundColor,
        ctaFg: cta.color,
        ctaRadius: cta.borderRadius,
      };
    });
    // The floor follows the single theme token (app/lib.css --background, the light cream since 2026-10-22), never a
    // colour pinned per sheet
    expect(t.body).toBe(t.token);
    expect(t.page).toBe(t.token);
    // Welabs UI v3 (app/lib.css, 22/10): --action is the black primary (#121212) with white text, the radius of the
    // pill token (--r-pill follows the lib's radii, 8 px)
    expect(t.ctaBg).toBe("rgb(18, 18, 18)");
    expect(t.ctaFg).toBe("rgb(255, 255, 255)");
    expect(t.ctaRadius).toBe("8px");
    // Hover: amber 300 with ink text
    await page.hover("header > div > a[href='/#contact']");
    await page.waitForTimeout(300);
    const hover = await page.evaluate(() => {
      const cs = getComputedStyle(
        document.querySelector("header > div > a[href='/#contact']")!,
      );
      return [cs.backgroundColor, cs.color];
    });
    expect(hover).toEqual(["rgb(255, 204, 116)", "rgb(18, 18, 18)"]);
    // Focus: 2 px of the page, then 2 px of the lib's ring token (app/globals.css :focus-visible)
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.color = "var(--ring)";
      document.body.append(probe);
      const token = getComputedStyle(probe).color;
      probe.remove();
      return {
        shadow: getComputedStyle(document.activeElement!).boxShadow,
        token,
      };
    });
    expect(ring.shadow).toContain("rgb(247, 247, 245) 0px 0px 0px 2px");
    expect(ring.shadow).toContain(`${ring.token} 0px 0px 0px 4px`);
  });

  for (const path of ["/", "/products/tuner"])
    test(`every text of the changed components reaches AA on ${path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "load" });
      const scope =
        path === "/"
          ? "header, #intro, #message, #domus, #products, #contact"
          : // v3: the opening holds the carousel of the product (the play left)
            "[data-descent-slot] #product, [data-descent-slot] #center, [data-descent-slot] #contact";
      const low = (await contrasts(page, scope)).filter(
        (c) => c.ratio < c.need,
      );
      expect(low).toEqual([]);
    });
});

test.describe("(c) the motions act", () => {
  test("the stage of the home cycles: a product lights, its packet travels, its line lights in the record", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(600);
    const seen = await page.evaluate(async () => {
      const lit = new Set<string>();
      const packets = new Set<string>();
      const t0 = performance.now();
      while (performance.now() - t0 < 6000) {
        for (const el of document.querySelectorAll<HTMLElement>(
          "#intro [role=group] [data-of]",
        )) {
          const before = getComputedStyle(el, "::before").opacity;
          if (Number(before) > 0.5) lit.add(el.dataset.of!);
        }
        for (const p of document.querySelectorAll<HTMLElement>(
          "#intro [role=group] i",
        )) {
          const s = getComputedStyle(p);
          if (Number(s.opacity) > 0.5) packets.add(s.transform);
        }
        await new Promise((r) => requestAnimationFrame(r));
      }
      return { lit: [...lit], packets: packets.size };
    });
    // In 6 s the cycle (2.5 s per product) lights at least two products, and a packet is seen in several places
    expect(seen.lit.length).toBeGreaterThanOrEqual(2);
    expect(seen.packets).toBeGreaterThan(5);
  });

  test("the outcomes of the home play again and again while on screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    await page.locator("#operation").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const phases: string[] = [];
    let running = 0;
    for (let i = 0; i < 14; i++) {
      const s = await page.evaluate(() => ({
        phases: [
          ...document.querySelectorAll<HTMLElement>("#operation [data-replay]"),
        ]
          .map((e) => e.dataset.phase)
          .join(""),
        running: document
          .querySelector("#operation")!
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === "running").length,
      }));
      phases.push(s.phases);
      running = Math.max(running, s.running);
      await page.waitForTimeout(500);
    }
    expect(
      phases.every((p) => p === "playplayplay"),
      phases.join(","),
    ).toBe(true);
    expect(running).toBeGreaterThan(5);
  });

  // v3 (2026-10-23): the opening of a product is its carousel (a kit scene), which walks its steps by itself
  test("the opening of a product plays its carousel: its steps advance, not only one frame", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/magneto", { waitUntil: "load" });
    await page.waitForTimeout(400);
    const steps = await page.evaluate(async () => {
      const seen = new Set<string>();
      const t0 = performance.now();
      while (performance.now() - t0 < 5000) {
        const stage = document.querySelector<HTMLElement>(
          '[data-descent-slot] #product [data-kit="magneto-carousel"] [data-scene]',
        );
        if (stage?.dataset.step) seen.add(stage.dataset.step);
        await new Promise((r) => setTimeout(r, 100));
      }
      return [...seen];
    });
    expect(steps.length, steps.join(",")).toBeGreaterThan(3);
  });
});

test.describe("(e) the house of the Domus", () => {
  test("the real modules on two floors, and a new module that says it is one", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    const house = page.locator("#domus");
    await house.scrollIntoViewIfNeeded();
    const floors = await house
      .locator("ul")
      .evaluateAll((uls) =>
        uls
          .slice(0, 2)
          .map((ul) =>
            [...ul.querySelectorAll("li")].map((li) => li.textContent!.trim()),
          ),
      );
    for (const m of [
      "Vendas",
      "Compras",
      "Estoque",
      "Produção",
      "Financeiro",
      "Contratos",
      "Projetos",
      "Pessoas",
      "Ativos",
      "Qualidade",
    ])
      expect(floors[0]).toContain(m);
    for (const m of [
      "FiscalNFS-e",
      "BancosPIX",
      "Jurídico",
      "Chamados",
      "Demandas",
      "Aprovações",
      "Privacidade",
    ])
      expect(floors[1].join("|")).toContain(m);
    // Pilot of the lib (2026-10-21): no roof any more; the frame is the ring of the Domus logo (e2e/domus.spec.ts).
    // "+ Novo módulo" restarts the new module: it is born with its seal (the lib's Badge) and its screen opens with
    // its three fields (the lib's Field and Input)
    // v3 (F3): a cycle of 6 s (house.module.css); the screen is open from 1.6 s to 4.2 s and closed from 4.6 s to 7.2 s
    await house.locator("label", { hasText: "Novo módulo" }).click();
    await page.waitForTimeout(3000);
    await expect(house.getByText("Vistorias")).toBeVisible();
    const seal = house.locator("[data-slot='badge']", {
      hasText: "Novo módulo",
    });
    await expect(seal).toBeVisible();
    for (const f of ["Local", "Data", "Foto"])
      await expect(house.getByText(f, { exact: true })).toBeVisible();
    // And it closes on its own, with no second click (the loop goes on: e2e/domus.spec.ts)
    await page.waitForTimeout(2400);
    expect(
      await house
        .locator("[data-slot='card']")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBeLessThan(0.1);
  });
});

// v3 (2026-10-23): (f) the message of the v2 and (g) the play of the Tuner left with their blocks; the kit scenes that
// replace them are held by e2e/scene-kit-scenes.spec.ts (on the lab and on the site) and e2e/scene-kit-geometry.spec.ts

// OS BLOCOS DA V2.1, UM A UM
// One spec per block of the round (the operator follows the 5180 preview block by block):
//  (a) the tokens of the ERP front: page, surfaces, the action button, the focus ring, and AA contrast of the text of the
//      components that changed;
//  (c) the motions act again: the stage cycles with packets, the outcomes play, the opening of a product plays its scene
//      (and does not only turn);
//  (e) the Domus shows the real modules on two floors inside the ring of its logo, and "+ Novo módulo" makes a new
//      module with its seal and its screen, which then closes on its own;
//  (f) the message lands in the Domus that forms, and every logo on the track is at least 18 px of wordmark;
//  (g) the play of the Tuner: a key lights its wire, the call travels and the person answers, recorded.
// The overlap and cut checks are e2e/layout.spec.ts (block b); the transitions and the brand openings,
// e2e/transitions.spec.ts (blocks c and d).
import { expect, test, type Page } from "@playwright/test";

// The visible height of a logo: the height of the image times the share of its viewBox the drawing covers (the files
// carry their 0.5X protection area around the wordmark)
async function wordmarkHeights(page: Page, selector: string) {
  return page.evaluate(async (selector) => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>(selector)];
    const share = new Map<string, number>();
    for (const img of imgs) {
      const src = new URL(img.currentSrc || img.src).pathname;
      if (share.has(src)) continue;
      const text = await (await fetch(src)).text();
      const holder = document.createElement("div");
      holder.style.cssText =
        "position:absolute;left:-9999px;top:0;width:1000px";
      holder.innerHTML = text;
      document.body.append(holder);
      const svg = holder.querySelector("svg")!;
      const vb = svg.viewBox.baseVal;
      // The wordmark only: the seal "by welabs" of an endorsed file sits under it, so the first group of paths is read
      const marks = [...svg.children].filter(
        (el) => el instanceof SVGGraphicsElement,
      ) as SVGGraphicsElement[];
      let y0 = Infinity;
      let y1 = -Infinity;
      for (const el of marks) {
        const b = el.getBBox();
        if (b.y > vb.y + vb.height * 0.62) continue;
        y0 = Math.min(y0, b.y);
        y1 = Math.max(y1, b.y + b.height);
      }
      share.set(src, (y1 - y0) / vb.height);
      holder.remove();
    }
    return imgs.map((img) => ({
      src: new URL(img.currentSrc || img.src).pathname,
      px:
        Math.round(
          img.getBoundingClientRect().height *
            share.get(new URL(img.currentSrc || img.src).pathname)! *
            10,
        ) / 10,
    }));
  }, selector);
}

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
    const bgOf = (el: Element | null) => {
      while (el) {
        const c = parse(getComputedStyle(el).backgroundColor);
        if (c.a > 0.9) return c;
        el = el.parentElement;
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
    // ERP --action #25272a with --action-foreground #faf5ea, round control (22 px)
    expect(t.ctaBg).toBe("rgb(37, 39, 42)");
    expect(t.ctaFg).toBe("rgb(250, 245, 234)");
    expect(t.ctaRadius).toBe("22px");
    // Hover: amber 300 with ink text
    await page.hover("header > div > a[href='/#contact']");
    await page.waitForTimeout(300);
    const hover = await page.evaluate(() => {
      const cs = getComputedStyle(
        document.querySelector("header > div > a[href='/#contact']")!,
      );
      return [cs.backgroundColor, cs.color];
    });
    expect(hover).toEqual(["rgb(255, 204, 116)", "rgb(28, 26, 22)"]);
    // Focus: 2 px of the page, then 2 px of ink
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(
      () => getComputedStyle(document.activeElement!).boxShadow,
    );
    expect(ring).toContain("rgb(28, 26, 22) 0px 0px 0px 4px");
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
          : "[data-descent-slot] #product nav, [data-descent-slot] #play, [data-descent-slot] #center, [data-descent-slot] #contact";
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

  test("the opening of a product plays its scene: actions run, not only the swap", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/magneto", { waitUntil: "load" });
    await page.waitForTimeout(400);
    const maxRunning = await page.evaluate(async () => {
      let max = 0;
      const t0 = performance.now();
      while (performance.now() - t0 < 5000) {
        const centre = document.querySelector(
          '[data-descent-slot] [data-pos="0"] .scn',
        );
        if (centre)
          max = Math.max(
            max,
            centre
              .getAnimations({ subtree: true })
              .filter((a) => a.playState === "running").length,
          );
        await new Promise((r) => setTimeout(r, 100));
      }
      return max;
    });
    expect(maxRunning).toBeGreaterThan(3);
    // No ring turning: the tiles do not rotate or travel sideways
    const turning = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "[data-descent-slot] [data-tile]",
        ),
      ].some(
        (t) =>
          getComputedStyle(t).rotate !== "none" &&
          getComputedStyle(t).rotate !== "0deg",
      ),
    );
    expect(turning).toBe(false);
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

test.describe("(f) the message lands in the Domus", () => {
  test("logos on the track are at least 18 px of wordmark, and the Domus forms when the message arrives", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    const msg = page.locator("#message");
    await msg.scrollIntoViewIfNeeded();
    const heights = await wordmarkHeights(page, "#message ol img");
    expect(heights).toHaveLength(5);
    for (const h of heights) expect(h.px, h.src).toBeGreaterThanOrEqual(18);
    // Before: the symbol waits as a thin ink outline (v2.2, audit M01: it was a thick sand ring), no square
    const before = await page.evaluate(() => {
      const [ring, , , , , square] =
        document.querySelectorAll("#message svg rect");
      return [
        getComputedStyle(ring).stroke,
        getComputedStyle(ring).strokeWidth,
        getComputedStyle(square).opacity,
      ];
    });
    expect(before).toEqual(["rgb(28, 26, 22)", "1.8px", "0"]);
    await msg.locator("label", { hasText: "Enviar a mensagem" }).click();
    await page.waitForTimeout(7200);
    const after = await page.evaluate(() => {
      const [ring, , , , , square] =
        document.querySelectorAll("#message svg rect");
      return [getComputedStyle(ring).stroke, getComputedStyle(square).opacity];
    });
    expect(after).toEqual(["rgb(28, 26, 22)", "1"]);
    await expect(msg.getByText("Confirmado: sábado")).toBeVisible();
  });
});

test.describe("(g) the play of the Tuner", () => {
  test("a key lights its wire, the call travels to the person, who answers recorded", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/tuner", { waitUntil: "load" });
    const play = page.locator("[data-descent-slot] #play");
    await play.scrollIntoViewIfNeeded();
    // v2.2 (audit A05, section 5): the menu sends the call to a team; the busy one holds it, then takes it
    await expect(play.getByRole("heading")).toHaveText(
      "Menu de opções e distribuição de ligações",
    );
    await play.locator("label", { hasText: "Financeiro" }).click();
    const travel = await page.evaluate(async () => {
      const call = document.querySelector<HTMLElement>(
        '[data-descent-slot] #play i[data-ev="2"]',
      )!;
      const seen = new Set<string>();
      const t0 = performance.now();
      while (performance.now() - t0 < 700) {
        seen.add(getComputedStyle(call).offsetDistance);
        await new Promise((r) => requestAnimationFrame(r));
      }
      return seen.size;
    });
    expect(travel).toBeGreaterThan(10);
    // v3 (F3): the choice holds about 1 s after its beats, then the play gives the stage back to its demo
    // (play-demo.ts), so the state is read while it runs, not after a fixed wait
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const slot = document.querySelector("[data-descent-slot] #play")!;
            const hot = slot.querySelector('path[data-ev="2"]')!;
            const team = slot.querySelector('[data-team="2"]')!;
            return [
              getComputedStyle(hot).display,
              getComputedStyle(team.querySelector('[data-ev="2"]')!).display,
            ].includes("none");
          }),
        { timeout: 4_000 },
      )
      .toBe(false);
    await expect(
      play
        .getByText("Gravação e transcrição na conversa")
        .filter({ visible: true }),
    ).toBeVisible();
  });
});

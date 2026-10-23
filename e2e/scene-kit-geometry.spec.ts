// GEOMETRIA DAS CENAS DO KIT NO LAB
// The alignment contract of the kit scenes, measured at 1440 and 390, so a look is accepted by numbers and not by eye
// (operator, 2026-10-22):
//  - inside every field (the lib's InputGroup) each piece is vertically centred in the field (|top gap − bottom gap|
//    ≤ 1 px) and the leading inset equals the trailing inset (|first piece's left gap − last piece's right gap| ≤ 1 px);
//  - every icon of a control, a chip or a status sits on the axis of its text line (≤ 1 px);
//  - the columns of each list share their left edges (≤ 1 px).
// A "piece" is what the eye sees: an icon, a chip, a button, or the content box of the text control (its padding is
// the control's own inset, not a piece). The Relloo carousel is measured on each of its four frames (the settled step
// of each, reached by the visitor's gesture on its frame picker); the other scenes on their settled frame.
import { expect, test, type Page } from "@playwright/test";

const RELLOO = "/lab/scenes/relloo-carousel";

// Every field of the window: its box (inside its border) and the boxes of its pieces, in order
async function fields(page: Page) {
  return page.evaluate(() => {
    const figure = document.querySelector('[role="figure"]')!;
    const ghost = figure.querySelector("[data-scene] > :first-child")!;
    const box = (r: DOMRect) => ({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
    const content = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        left: r.left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft),
        right: r.right - parseFloat(s.borderRightWidth) - parseFloat(s.paddingRight),
        top: r.top + parseFloat(s.borderTopWidth) + parseFloat(s.paddingTop),
        bottom: r.bottom - parseFloat(s.borderBottomWidth) - parseFloat(s.paddingBottom),
      };
    };
    return [...figure.querySelectorAll<HTMLElement>('[data-slot="input-group"]')]
      .filter((g) => !ghost.contains(g) && g.offsetParent !== null)
      .map((g) => {
        const s = getComputedStyle(g);
        const r = g.getBoundingClientRect();
        const inner = {
          left: r.left + parseFloat(s.borderLeftWidth),
          right: r.right - parseFloat(s.borderRightWidth),
          top: r.top + parseFloat(s.borderTopWidth),
          bottom: r.bottom - parseFloat(s.borderBottomWidth),
        };
        const pieces = [...g.children].flatMap((child) => {
          if ((child as HTMLElement).offsetParent === null) return [];
          if (child.matches('[data-slot="input-group-control"]'))
            return [{ name: "text", ...(content(child) as object) } as { name: string } & ReturnType<typeof content>];
          // An addon: each element inside it is a piece (an icon, a chip, a button)
          return [...child.children]
            .filter((c) => (c as HTMLElement).getBoundingClientRect().width > 0)
            .map((c) => ({ name: c.getAttribute("data-slot") ?? c.tagName.toLowerCase(), ...box(c.getBoundingClientRect()) }));
        });
        return { name: (g.querySelector("input") as HTMLInputElement)?.placeholder ?? "field", inner, pieces };
      });
  });
}

// Icon/text pairs of the controls, chips and status of the live layer: the icon's centre against the centre of the
// line box of the text next to it
async function iconAxis(page: Page) {
  return page.evaluate(() => {
    const figure = document.querySelector('[role="figure"]')!;
    const ghost = figure.querySelector("[data-scene] > :first-child")!;
    const toolbar = document.querySelector('[data-lab="take"]')?.parentElement;
    const scope = [figure, ...(toolbar ? [toolbar] : [])];
    const mid = (r: DOMRect) => r.top + r.height / 2;
    const out: { name: string; dy: number }[] = [];
    for (const root of scope)
      root
        .querySelectorAll<HTMLElement>('[data-slot="button"], [data-slot="badge"], [data-axis-pair]')
        .forEach((el) => {
          // An inbox row centres its mark on a two-line text block (e2e/scene-kit.spec.ts measures it), not on a line
          // (the v3 scenes mark such a row `data-row`; e2e/scene-kit-scenes.spec.ts measures it through `data-axis`)
          if (ghost.contains(el) || el.offsetParent === null || el.hasAttribute("data-channel") || el.hasAttribute("data-row"))
            return;
          const icon = el.querySelector("svg, [data-dot]");
          const textNode = [...el.childNodes, ...[...el.querySelectorAll("span")].flatMap((s) => [...s.childNodes])].find(
            (n) => n.nodeType === 3 && n.textContent!.trim(),
          );
          if (!icon || !textNode) return;
          const range = document.createRange();
          range.selectNodeContents(textNode);
          const line = range.getClientRects()[0];
          if (!line) return;
          out.push({
            name: `${el.getAttribute("data-slot") ?? "pair"} "${el.textContent!.trim().slice(0, 20)}"`,
            dy: Math.abs(mid(icon.getBoundingClientRect()) - mid(line)),
          });
        });
    return out;
  });
}

// Left edges that must be one column, by name → selectors inside the live layer of the scene
async function columns(page: Page, id: string, cols: Record<string, string[]>) {
  return page.evaluate(
    ({ id, cols }) => {
      const live = document.querySelector(`[data-scene="${id}"] > :last-child`)!;
      const lefts = (sel: string) =>
        [...live.querySelectorAll<HTMLElement>(sel)]
          .filter((e) => e.offsetParent !== null && e.getBoundingClientRect().width > 0)
          .map((e) => Math.round(e.getBoundingClientRect().left * 100) / 100);
      return Object.fromEntries(Object.entries(cols).map(([name, sels]) => [name, sels.flatMap(lefts)]));
    },
    { id, cols },
  );
}

// The icon/text pairs of the live layer marked `data-axis` (first child the mark, second its text): their centres
async function axisPairs(page: Page, id: string) {
  return page.evaluate((sceneId) => {
    const live = document.querySelector(`[data-scene="${sceneId}"] > :last-child`)!;
    const mid = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    };
    return [...live.querySelectorAll<HTMLElement>("[data-axis]")]
      .filter((e) => e.offsetParent !== null)
      .map((e, i) => ({ name: `${e.dataset.axis} ${i}`, dy: Math.abs(mid(e.children[0]) - mid(e.children[1])) }));
  }, id);
}

// CABEÇALHO NO PADRÃO DetailHeader DO DOMUS
// The Domus DetailHeader (erpnext front ui-kit/components/detail-header.tsx): `items-center` on the identity and the
// text block, so the identity's centre is the block's; the status sits on the title's line; the meta starts on the
// title's left edge; the actions (when the scene has them) are centred on the header's line, which is the identity's
// (wrapped under it below sm)
async function expectDetailHeader(page: Page, id: string, width: number, withActions = true) {
  const h = await page.evaluate((sceneId) => {
    const live = document.querySelector(`[data-scene="${sceneId}"] > :last-child`)!;
    const r = (k: string) => {
      // The visible part (a scene may draw one per breakpoint)
      const el = [...live.querySelectorAll(`[data-header="${k}"]`)].find((e) => (e as HTMLElement).offsetParent !== null);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, mid: b.top + b.height / 2 };
    };
    // The header's own box, inside its padding: the room a phone gives the title line. A scene marks it
    // (`data-header-root`); otherwise it is the parent of the actions
    const head =
      live.querySelector('[data-header="identity"]')?.closest("[data-header-root]") ??
      live.querySelector('[data-header="actions"]')!.parentElement!;
    const hs = getComputedStyle(head);
    const inner = head.getBoundingClientRect().right - parseFloat(hs.paddingRight);
    return {
      identity: r("identity"),
      block: r("block"),
      title: r("title"),
      status: r("status"),
      meta: r("meta"),
      actions: r("actions"),
      inner,
    };
  }, id);
  for (const k of ["identity", "block", "title", "status", "meta"] as const) expect(h[k], `header part ${k}`).not.toBeNull();
  if (withActions) expect(h.actions, "header part actions").not.toBeNull();
  const { identity, block, title, status, meta } = h as unknown as Record<string, NonNullable<(typeof h)["title"]>>;
  expect(Math.abs(identity.mid - block.mid), `identity ${identity.mid} vs text block ${block.mid}`).toBeLessThanOrEqual(1);
  expect(Math.abs(status.mid - title.mid), `status ${status.mid} vs title ${title.mid}`).toBeLessThanOrEqual(1);
  // The status keeps its line with room to spare (24 px before the actions, or before the header's edge on a phone),
  // so the font metrics of another engine do not wrap it under the title
  const limit = withActions && width >= 640 ? h.actions!.left : h.inner;
  expect(limit - status.right, `room after the status: ${(limit - status.right).toFixed(1)}`).toBeGreaterThanOrEqual(24);
  expect(block.left).toBeLessThan(status.left);
  expect(Math.abs(meta.left - title.left), `meta ${meta.left} vs title ${title.left}`).toBeLessThanOrEqual(1);
  // Below sm the Domus header wraps its actions under the title block instead of squeezing it
  if (withActions) {
    const actions = h.actions!;
    if (width >= 640)
      expect(Math.abs(actions.mid - identity.mid), `actions ${actions.mid} vs identity ${identity.mid}`).toBeLessThanOrEqual(1);
    else expect(actions.top, "actions under the title block").toBeGreaterThanOrEqual(identity.bottom);
  }
}

// GEOMETRIA DO CARROSSEL DO RELLOO, QUADRO A QUADRO
// Each frame at its settled step (its pieces landed; the step holds 1.8 s): the composer's pieces centred with equal
// insets (frame 1), every icon of a control, chip, status or marked pair on its text line, the columns of each frame
// on one left edge (`data-col`), the record header of frame 3 in the Domus DetailHeader geometry (at 1440: on a phone
// the nested pane leaves the status no room on the title's line and it wraps under it, as the Domus header wraps), the
// four stages of the funnel on one centre line and the Domus under the second stage (frame 4)
const RELLOO_SETTLED = { 1: "f1-message", 2: "f2-summary", 3: "f3-born", 4: "f4-ask" } as const;
const RELLOO_COLUMNS: Record<1 | 2 | 3 | 4, Record<string, string[]>> = {
  1: { conversation: ['[data-col="lead"]', '[data-slot="input-group"]'] },
  2: { conversation: ['[data-col="lead"]'] },
  3: { "conversation pane": ['[data-col="left"]'], "record pane": ['[data-col="right"]'] },
  4: { "deal line, funnel and question": ['[data-col="funnel"]'] },
};

for (const width of [1440, 390]) {
  test.describe(`relloo-carousel geometry at ${width}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(RELLOO);
      await page.getByRole("figure", { name: /^Relloo/ }).scrollIntoViewIfNeeded();
    });

    for (const n of [1, 2, 3, 4] as const) {
      test(`frame ${n}: fields, icon axis, columns${n === 3 ? ", record header" : ""}${n === 4 ? ", funnel" : ""}`, async ({ page }) => {
        await page.getByRole("radio", { name: `Momento ${n}` }).click();
        await expect(page.locator('[data-scene="relloo-carousel"]')).toHaveAttribute("data-step", RELLOO_SETTLED[n], {
          timeout: 10_000,
        });
        await page.waitForTimeout(900);

        const all = await fields(page);
        expect(all.length, "fields").toBeGreaterThanOrEqual(n === 1 ? 1 : 0);
        for (const f of all) {
          expect(f.pieces.length, `${f.name}: pieces`).toBeGreaterThanOrEqual(2);
          for (const p of f.pieces) {
            const above = p.top - f.inner.top;
            const below = f.inner.bottom - p.bottom;
            expect(Math.abs(above - below), `${f.name} / ${p.name}: top ${above.toFixed(1)} bottom ${below.toFixed(1)}`).toBeLessThanOrEqual(1);
          }
          const lead = f.pieces[0].left - f.inner.left;
          const trail = f.inner.right - f.pieces[f.pieces.length - 1].right;
          expect(Math.abs(lead - trail), `${f.name}: leading ${lead.toFixed(1)} trailing ${trail.toFixed(1)}`).toBeLessThanOrEqual(1);
        }

        const pairs = [...(await iconAxis(page)), ...(await axisPairs(page, "relloo-carousel"))];
        // The lab's two toolbar buttons and at least one pair of the frame
        expect(pairs.length, "icon/text pairs").toBeGreaterThanOrEqual(3);
        for (const { name, dy } of pairs) expect(dy, name).toBeLessThanOrEqual(1);

        const cols = await columns(page, "relloo-carousel", RELLOO_COLUMNS[n]);
        for (const [name, xs] of Object.entries(cols)) {
          expect(xs.length, name).toBeGreaterThan(1);
          expect(Math.max(...xs) - Math.min(...xs), `${name}: ${xs.join(", ")}`).toBeLessThanOrEqual(1);
        }

        if (n === 3 && width === 1440) await expectDetailHeader(page, "relloo-carousel", width, false);

        if (n === 4) {
          const funnel = await page.evaluate(() => {
            const live = document.querySelector('[data-scene="relloo-carousel"] > :last-child')!;
            const box = (el: Element) => el.getBoundingClientRect();
            const stages = [...live.querySelectorAll("[data-stage]")].map(box);
            const domus = box(live.querySelector("[data-domus]")!);
            return {
              mids: stages.map((r) => Math.round((r.top + r.height / 2) * 100) / 100),
              under: Math.abs(domus.left + domus.width / 2 - (stages[1].left + stages[1].width / 2)),
            };
          });
          expect(funnel.mids.length, "stages").toBe(4);
          expect(Math.max(...funnel.mids) - Math.min(...funnel.mids), `stage centres: ${funnel.mids.join(", ")}`).toBeLessThanOrEqual(1);
          expect(funnel.under, "the Domus centred under the second stage").toBeLessThanOrEqual(1);
        }
      });
    }
  });
}

// GEOMETRIA DAS CENAS V3 (DOMUS, MAGNETO, TUNER, KNOWLY, HOME)
// The same contract on the scenes rebuilt after the Relloo pilot (brief-v3-scenes, 2026-10-22): every field centres its
// pieces with equal insets, every icon of a control, chip or status sits on its text line, the record header (when the
// scene has one) is the Domus DetailHeader with 24 px of room after the status, the columns of each list share their
// left edge, and the steps of a horizontal track sit on one centre line. The columns are named selectors inside the
// live layer; a column with `wide` is measured only from that width up.
type GeoScene = {
  id: string;
  figure: RegExp;
  // Least number of fields, at 1440 and at 390 (every field found must also keep the contract)
  fields: [number, number];
  // Least number of icon/text pairs of the controls, chips and status, at 1440 and at 390
  pairs: [number, number];
  // The scene draws a record header (data-header parts); `actions`: with the record's actions on its line
  header?: { actions: boolean };
  // Name → selectors (inside the live layer) whose left edges are one column
  columns: Record<string, { sel: string[]; wide?: number }>;
  // Name → selector whose matches share one centre line (a horizontal track)
  rows?: Record<string, string>;
};
const V3: GeoScene[] = [
  {
    // The settled frame of the carousel (frame 4) under reduced motion; its frames are measured one by one above
    id: "relloo-carousel",
    figure: /^Relloo/,
    fields: [0, 0],
    // The demo request, the booked visit, and the lab's two toolbar buttons
    pairs: [4, 4],
    columns: {
      "deal line, funnel and question": { sel: ['[data-col="funnel"]'] },
    },
  },
  {
    id: "domus-modules",
    figure: /^Domus/,
    header: { actions: true },
    // The fields of the new module (3 at 1440, 3 on a phone in 2 + 1)
    fields: [3, 3],
    // "Novo módulo" (header action), the status, and the lab's two toolbar buttons
    pairs: [4, 4],
    columns: {
      // The name of each floor, its first module and the new module's card start on the ring's inner edge
      "floor heads and first cards": { sel: ["[data-floor] > :first-child", "[data-floor] li:first-child", "[data-born]"] },
      // Inside the new module: its mark and its first field
      "new module mark and fields": { sel: ["[data-born-head] > :first-child", "[data-born-fields] > :first-child"] },
      "record title and meta": { sel: ['[data-align="record"] > :last-child > *'] },
    },
  },
  {
    id: "magneto-approval",
    figure: /^Magneto/,
    header: { actions: true },
    // No field: the scene is steps and a record
    fields: [0, 0],
    // The two value chips, the status, and the lab's two toolbar buttons
    pairs: [5, 5],
    columns: {
      // `li`: the kit's stage carries data-step too (the step of the clock), and the live layer is its second child
      "step marks": { sel: ["li[data-step] > :first-child"] },
      "step titles and metas": { sel: ["li[data-step] > :nth-child(2) > *"] },
      "order pane": { sel: ['[data-pane="order"] > *'] },
      "record title and meta": { sel: ['[data-align="record"] > :last-child > *'] },
    },
  },
  {
    id: "tuner-routing",
    figure: /^Tuner/,
    // No field minimum: any field the scene draws still keeps the contract
    fields: [0, 0],
    // 1440: the lab's two buttons and the status; 390: also the three option buttons
    pairs: [3, 6],
    header: { actions: true },
    columns: {
      "menu marks": { sel: ["[data-option] > :first-child"], wide: 1024 },
      "menu texts": { sel: ["[data-option] > :last-child", "[data-option] > :last-child > *"], wide: 1024 },
      "history marks": { sel: ['[data-slot="timeline"] > li > :first-child'] },
      "history titles and bubbles": {
        sel: [
          '[data-slot="timeline"] > li > :last-child > :first-child',
          '[data-slot="timeline"] > li > :last-child > :last-child:not(:first-child) > *',
        ],
      },
      "record title and meta": { sel: ['[data-align="record"] > :last-child > *'] },
      "record, team and history": {
        sel: ['[data-align="record"]', "[data-team]", '[data-slot="timeline"] > li'],
      },
    },
  },
  {
    id: "knowly-answer",
    figure: /^Knowly/,
    fields: [0, 0],
    // The lab's two buttons, the cited sentence's source, the closed sentence and the two closed lines (lock + text)
    pairs: [6, 6],
    columns: {
      "answer sentences": { sel: ["[data-sentence] > :first-child"] },
      "source lines": { sel: ["[data-line] > :first-child"] },
      "source line texts": { sel: ["[data-line] > :nth-child(2)"] },
      "source heads and lines": { sel: ["[data-doc] > :first-child", "[data-doc] [data-line]"] },
    },
  },
  {
    id: "home-message",
    figure: /mensagem atravessa/,
    fields: [0, 0],
    pairs: [3, 3],
    header: { actions: false },
    columns: {
      "message, track and record": { sel: ["[data-message]", "[data-track]", "[data-record]"] },
      "record identity and first field": { sel: ['[data-align="record"]', "[data-field]:first-child"] },
      "record title and meta": { sel: ['[data-align="record"] > :last-child > *'] },
    },
    rows: { "track marks": '[data-station] [data-slot="avatar"]', "track names": "[data-station] b" },
  },
];

for (const s of V3) {
  for (const width of [1440, 390]) {
    test.describe(`${s.id} geometry at ${width}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(`/lab/scenes/${s.id}`);
        await page.getByRole("figure", { name: s.figure }).waitFor();
      });

      test("every piece of a field is centred, with equal leading and trailing insets", async ({ page }) => {
        const all = await fields(page);
        expect(all.length).toBeGreaterThanOrEqual(s.fields[width === 1440 ? 0 : 1]);
        for (const f of all) {
          expect(f.pieces.length, `${f.name}: pieces`).toBeGreaterThanOrEqual(2);
          for (const p of f.pieces) {
            const above = p.top - f.inner.top;
            const below = f.inner.bottom - p.bottom;
            expect(Math.abs(above - below), `${f.name} / ${p.name}: top ${above.toFixed(1)} bottom ${below.toFixed(1)}`).toBeLessThanOrEqual(1);
          }
          const lead = f.pieces[0].left - f.inner.left;
          const trail = f.inner.right - f.pieces[f.pieces.length - 1].right;
          expect(Math.abs(lead - trail), `${f.name}: leading ${lead.toFixed(1)} trailing ${trail.toFixed(1)}`).toBeLessThanOrEqual(1);
        }
      });

      test("every icon of a control, chip or status sits on its text line", async ({ page }) => {
        const pairs = await iconAxis(page);
        expect(pairs.length).toBeGreaterThanOrEqual(s.pairs[width === 1440 ? 0 : 1]);
        for (const { name, dy } of pairs) expect(dy, name).toBeLessThanOrEqual(1);
      });

      if (s.header) {
        const withActions = s.header.actions;
        test("the record header keeps the Domus DetailHeader geometry", async ({ page }) => {
          await expectDetailHeader(page, s.id, width, withActions);
        });
      }

      test("the columns of each list share their left edge", async ({ page }) => {
        const cols = await page.evaluate(
          ({ id, columns }) => {
            const live = document.querySelector(`[data-scene="${id}"] > :last-child`)!;
            const lefts = (sel: string) =>
              [...live.querySelectorAll<HTMLElement>(sel)]
                .filter((e) => e.offsetParent !== null && e.getBoundingClientRect().width > 0)
                .map((e) => Math.round(e.getBoundingClientRect().left * 100) / 100);
            return Object.fromEntries(
              Object.entries(columns).map(([name, c]) => [name, { xs: c.sel.flatMap(lefts), wide: c.wide }]),
            );
          },
          { id: s.id, columns: s.columns },
        );
        for (const [name, { xs, wide }] of Object.entries(cols)) {
          if (wide && width < wide) continue;
          expect(xs.length, name).toBeGreaterThan(1);
          expect(Math.max(...xs) - Math.min(...xs), `${name}: ${xs.join(", ")}`).toBeLessThanOrEqual(1);
        }
      });

      if (s.rows) {
        const rows = s.rows;
        test("the steps of the track share one centre line", async ({ page }) => {
          const mids = await page.evaluate(
            ({ id, rows }) => {
              const live = document.querySelector(`[data-scene="${id}"] > :last-child`)!;
              return Object.fromEntries(
                Object.entries(rows).map(([name, sel]) => [
                  name,
                  [...live.querySelectorAll<HTMLElement>(sel)]
                    .filter((e) => e.offsetParent !== null)
                    .map((e) => {
                      const r = e.getBoundingClientRect();
                      return Math.round((r.top + r.height / 2) * 100) / 100;
                    }),
                ]),
              );
            },
            { id: s.id, rows },
          );
          for (const [name, ys] of Object.entries(mids)) {
            expect(ys.length, name).toBe(5);
            expect(Math.max(...ys) - Math.min(...ys), `${name}: ${ys.join(", ")}`).toBeLessThanOrEqual(1);
          }
        });
      }
    });
  }
}

// GEOMETRIA DA CENA DO RELLOO NO LAB
// The alignment contract of the Relloo kit scene, measured on the settled frame (reduced motion) at 1440 and 390, so a
// look is accepted by numbers and not by eye (operator, 2026-10-22):
//  - inside every field (the lib's InputGroup) each piece is vertically centred in the field (|top gap − bottom gap|
//    ≤ 1 px) and the leading inset equals the trailing inset (|first piece's left gap − last piece's right gap| ≤ 1 px);
//  - every icon of a control, a chip or a status sits on the axis of its text line (≤ 1 px);
//  - the columns of each list share their left edges (≤ 1 px): the inbox rows, the history lines, the record header.
// A "piece" is what the eye sees: an icon, a chip, a button, or the content box of the text control (its padding is
// the control's own inset, not a piece).
import { expect, test, type Page } from "@playwright/test";

const LAB = "/lab/scenes/relloo-inbox";

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

// Left edges that must be one column, grouped by the column's name
async function columns(page: Page) {
  return page.evaluate(() => {
    const live = document.querySelector('[data-scene="relloo-inbox"] > :last-child')!;
    const lefts = (sel: string) =>
      [...live.querySelectorAll<HTMLElement>(sel)]
        .filter((e) => e.offsetParent !== null && e.getBoundingClientRect().width > 0)
        .map((e) => Math.round(e.getBoundingClientRect().left * 100) / 100);
    return {
      "inbox marks": lefts("[data-channel] > :first-child"),
      "inbox texts": [...lefts("[data-channel] > :last-child"), ...lefts("[data-channel] > :last-child > *")],
      "history marks": lefts('[data-slot="timeline"] > li > :first-child'),
      "history titles and bubbles": [
        ...lefts('[data-slot="timeline"] > li > :last-child > :first-child'),
        ...lefts('[data-slot="timeline"] > li > :last-child > :last-child:not(:first-child) > * > *'),
      ],
      "record title and meta": lefts('[data-align="record"] > :last-child > *'),
    };
  });
}

for (const width of [1440, 390]) {
  test.describe(`relloo geometry at ${width}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(LAB);
      await page.getByRole("figure", { name: /Relloo/ }).waitFor();
    });

    test("every piece of a field is centred, with equal leading and trailing insets", async ({ page }) => {
      const all = await fields(page);
      expect(all.length).toBeGreaterThanOrEqual(width === 1440 ? 2 : 1);
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
      expect(pairs.length).toBeGreaterThanOrEqual(width === 1440 ? 4 : 6);
      for (const { name, dy } of pairs) expect(dy, name).toBeLessThanOrEqual(1);
    });

    // The Domus DetailHeader (erpnext front ui-kit/components/detail-header.tsx): `items-center` on the identity and the
    // text block, so the identity's centre is the block's; the status sits on the title's line; the meta starts on the
    // title's left edge; the actions are centred on the header's line, which is the identity's (wrapped under it below sm)
    test("the record header keeps the Domus DetailHeader geometry", async ({ page }) => {
      const h = await page.evaluate(() => {
        const live = document.querySelector('[data-scene="relloo-inbox"] > :last-child')!;
        const r = (k: string) => {
          const el = live.querySelector(`[data-header="${k}"]`);
          if (!el) return null;
          const b = el.getBoundingClientRect();
          return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, mid: b.top + b.height / 2 };
        };
        // The header's own box, inside its padding: the room a phone gives the title line
        const head = live.querySelector('[data-header="actions"]')!.parentElement!;
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
      });
      for (const [k, v] of Object.entries(h)) expect(v, `header part ${k}`).not.toBeNull();
      const { identity, block, title, status, meta, actions } = h as unknown as Record<string, NonNullable<(typeof h)["title"]>>;
      expect(Math.abs(identity.mid - block.mid), `identity ${identity.mid} vs text block ${block.mid}`).toBeLessThanOrEqual(1);
      expect(Math.abs(status.mid - title.mid), `status ${status.mid} vs title ${title.mid}`).toBeLessThanOrEqual(1);
      // The status keeps its line with room to spare (24 px before the actions, or before the header's edge on a phone),
      // so the font metrics of another engine do not wrap it under the title
      const limit = width >= 640 ? actions.left : h.inner;
      expect(limit - status.right, `room after the status: ${(limit - status.right).toFixed(1)}`).toBeGreaterThanOrEqual(24);
      expect(block.left).toBeLessThan(status.left);
      expect(Math.abs(meta.left - title.left), `meta ${meta.left} vs title ${title.left}`).toBeLessThanOrEqual(1);
      // Below sm the Domus header wraps its actions under the title block instead of squeezing it
      if (width >= 640)
        expect(Math.abs(actions.mid - identity.mid), `actions ${actions.mid} vs identity ${identity.mid}`).toBeLessThanOrEqual(1);
      else expect(actions.top, "actions under the title block").toBeGreaterThanOrEqual(identity.bottom);
    });

    test("the columns of each list share their left edge", async ({ page }) => {
      const cols = await columns(page);
      for (const [name, xs] of Object.entries(cols)) {
        if (name.startsWith("inbox") && width < 1024) continue;
        expect(xs.length, name).toBeGreaterThan(1);
        expect(Math.max(...xs) - Math.min(...xs), `${name}: ${xs.join(", ")}`).toBeLessThanOrEqual(1);
      }
    });
  });
}

// GEOMETRIA DAS CENAS V3 (TUNER, KNOWLY, HOME)
// The same contract on the scenes rebuilt after the Relloo pilot (brief-v3-scenes.md): every icon of a control, chip or
// status on its text line, the record header (when the scene has one) in the Domus DetailHeader geometry with its 24 px
// of room, the columns of each list on one left edge, and the steps of a horizontal track on one centre line. Each scene
// names its own columns; a column marked `wide` is only laid out side by side (≥ 1024 px).
type GeoScene = {
  id: string;
  figure: RegExp;
  // Least number of icon/text pairs of the controls, chips and status, at 1440 and at 390
  pairs: [number, number];
  // The scene draws a record header (data-header parts); `actions`: with the record's actions on its line
  header?: { actions: boolean };
  // Name → selectors (inside the live layer) whose left edges are one column
  columns: Record<string, { selectors: string[]; wide?: boolean }>;
  // Name → selector whose matches share one centre line (a horizontal track)
  rows?: Record<string, string>;
};

const V3_SCENES: GeoScene[] = [
  {
    id: "tuner-routing",
    figure: /^Tuner/,
    // 1440: the lab's two buttons and the status; 390: also the three option buttons
    pairs: [3, 6],
    header: { actions: true },
    columns: {
      "menu marks": { selectors: ["[data-option] > :first-child"], wide: true },
      "menu texts": { selectors: ["[data-option] > :last-child", "[data-option] > :last-child > *"], wide: true },
      "history marks": { selectors: ['[data-slot="timeline"] > li > :first-child'] },
      "history titles and bubbles": {
        selectors: [
          '[data-slot="timeline"] > li > :last-child > :first-child',
          '[data-slot="timeline"] > li > :last-child > :last-child:not(:first-child) > *',
        ],
      },
      "record title and meta": { selectors: ['[data-align="record"] > :last-child > *'] },
      "record, team and history": {
        selectors: ['[data-align="record"]', "[data-team]", '[data-slot="timeline"] > li'],
      },
    },
  },
  {
    id: "knowly-answer",
    figure: /^Knowly/,
    pairs: [4, 4],
    columns: {
      "answer sentences": { selectors: ["[data-sentence] > :first-child"] },
      "source lines": { selectors: ["[data-line] > :first-child"] },
      "source line texts": { selectors: ["[data-line] > :nth-child(2)"] },
      "source heads and lines": { selectors: ["[data-doc] > :first-child", "[data-doc] [data-line]"] },
    },
  },
  {
    id: "home-message",
    figure: /mensagem atravessa/,
    pairs: [3, 3],
    header: { actions: false },
    columns: {
      "message, track and record": { selectors: ["[data-message]", "[data-track]", "[data-record]"] },
      "record fields": { selectors: ["[data-field] > :first-child", "[data-field] > :last-child"] },
    },
    rows: { "track marks": '[data-station] [data-slot="avatar"]', "track names": "[data-station] b" },
  },
];

for (const s of V3_SCENES) {
  const LAB_V3 = `/lab/scenes/${s.id}`;
  for (const width of [1440, 390]) {
    test.describe(`${s.id} geometry at ${width}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(LAB_V3);
        await page.getByRole("figure", { name: s.figure }).waitFor();
      });

      test("every piece of a field is centred, with equal leading and trailing insets", async ({ page }) => {
        for (const f of await fields(page)) {
          for (const p of f.pieces) {
            const above = p.top - f.inner.top;
            const below = f.inner.bottom - p.bottom;
            expect(Math.abs(above - below), `${f.name} / ${p.name}`).toBeLessThanOrEqual(1);
          }
          const lead = f.pieces[0].left - f.inner.left;
          const trail = f.inner.right - f.pieces[f.pieces.length - 1].right;
          expect(Math.abs(lead - trail), `${f.name}: leading ${lead.toFixed(1)} trailing ${trail.toFixed(1)}`).toBeLessThanOrEqual(1);
        }
      });

      test("every icon of a control, chip or status sits on its text line", async ({ page }) => {
        const pairs = await iconAxis(page);
        expect(pairs.length).toBeGreaterThanOrEqual(width === 1440 ? s.pairs[0] : s.pairs[1]);
        for (const { name, dy } of pairs) expect(dy, name).toBeLessThanOrEqual(1);
      });

      if (s.header) {
        const withActions = s.header.actions;
        test("the record header keeps the Domus DetailHeader geometry", async ({ page }) => {
          const h = await page.evaluate((id) => {
            const live = document.querySelector(`[data-scene="${id}"] > :last-child`)!;
            const r = (k: string) => {
              const el = [...live.querySelectorAll(`[data-header="${k}"]`)].find(
                (e) => (e as HTMLElement).offsetParent !== null,
              );
              if (!el) return null;
              const b = el.getBoundingClientRect();
              return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, mid: b.top + b.height / 2 };
            };
            // The header's own box, inside its padding: the room the title line has
            const head = live.querySelector('[data-header="identity"]')!.closest("[data-header-root]")!;
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
          }, s.id);
          for (const k of ["identity", "block", "title", "status", "meta"] as const)
            expect(h[k], `header part ${k}`).not.toBeNull();
          if (withActions) expect(h.actions, "header part actions").not.toBeNull();
          const { identity, block, title, status, meta } = h as unknown as Record<string, NonNullable<(typeof h)["title"]>>;
          expect(Math.abs(identity.mid - block.mid), `identity ${identity.mid} vs text block ${block.mid}`).toBeLessThanOrEqual(1);
          expect(Math.abs(status.mid - title.mid), `status ${status.mid} vs title ${title.mid}`).toBeLessThanOrEqual(1);
          const limit = withActions && width >= 640 ? h.actions!.left : h.inner;
          expect(limit - status.right, `room after the status: ${(limit - status.right).toFixed(1)}`).toBeGreaterThanOrEqual(24);
          expect(Math.abs(meta.left - title.left), `meta ${meta.left} vs title ${title.left}`).toBeLessThanOrEqual(1);
          if (withActions) {
            const actions = h.actions!;
            if (width >= 640)
              expect(Math.abs(actions.mid - identity.mid), `actions ${actions.mid} vs identity ${identity.mid}`).toBeLessThanOrEqual(1);
            else expect(actions.top, "actions under the title block").toBeGreaterThanOrEqual(identity.bottom);
          }
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
              Object.entries(columns).map(([name, c]) => [name, c.selectors.flatMap(lefts)]),
            );
          },
          { id: s.id, columns: s.columns },
        );
        for (const [name, xs] of Object.entries(cols)) {
          if (s.columns[name].wide && width < 1024) continue;
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

// NADA SOBREPOSTO, NADA CORTADO
// v2.1: the operator's prints of 2e98392 showed ties crossing the card at the centre of the stage, stamps floating over
// them, and the window of the Knowly cut at the bottom of "O que muda na operação". This spec measures it by bounding
// box, on the home and on the five products, at the three measured windows, on the settled frame (reduced motion, so
// every drawing is in its final place):
//  - cut: every piece of visible text inside a box that clips (overflow hidden or clip) lies inside that box;
//  - overlap: the items of a list, the products and the record of the stage, and the cards of the house never cross;
//  - and the page never scrolls sideways.
import { expect, test } from "@playwright/test";
import { VIEWPORTS } from "./viewports";

const PATHS = [
  "/",
  "/products/domus",
  "/products/relloo",
  "/products/magneto",
  "/products/tuner",
  "/products/knowly",
];

type Finding = { kind: string; what: string; detail: string };

for (const vp of VIEWPORTS)
  for (const path of PATHS)
    test(`nothing overlaps or is cut on ${path} at ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      // Every band laid out (the bands below the window included), then the check
      const findings: Finding[] = await page.evaluate(() => {
        const out: { kind: string; what: string; detail: string }[] = [];
        const name = (el: Element) =>
          `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${(el.className && typeof el.className === "string" ? el.className : "").split(" ")[0]} "${(el.textContent ?? "").trim().slice(0, 30)}"`;
        const visible = (el: Element) => {
          const s = getComputedStyle(el);
          if (s.visibility === "hidden" || s.display === "none") return false;
          let e: Element | null = el;
          while (e) {
            const cs = getComputedStyle(e);
            if (Number(cs.opacity) === 0 || cs.display === "none") return false;
            e = e.parentElement;
          }
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        // The home is every band; a product is the bands of its slot
        const sections = [
          ...document.querySelectorAll(
            location.pathname === "/"
              ? "section"
              : "[data-descent-slot] section",
          ),
        ];

        // CORTE: texto dentro de uma caixa que recorta
        for (const section of sections)
          for (const box of section.querySelectorAll("*")) {
            const cs = getComputedStyle(box);
            if (!/hidden|clip/.test(cs.overflow + cs.overflowX + cs.overflowY))
              continue;
            // A mask that clips on purpose (the track of the word that turns shows one word at a time)
            if (box.closest("[data-mask]")) continue;
            if (!visible(box)) continue;
            // An image-only or screen-reader-only box is not a frame of text
            const b = box.getBoundingClientRect();
            if (b.width <= 2 || b.height <= 2) continue;
            for (const node of box.querySelectorAll("*")) {
              const own = [...node.childNodes].some(
                (c) => c.nodeType === 3 && (c.textContent ?? "").trim(),
              );
              if (!own || !visible(node)) continue;
              const r = node.getBoundingClientRect();
              if (
                r.top < b.top - 1 ||
                r.bottom > b.bottom + 1 ||
                r.left < b.left - 1 ||
                r.right > b.right + 1
              )
                out.push({
                  kind: "cut",
                  what: name(node),
                  detail: `inside ${name(box)}: ${Math.round(r.top - b.top)},${Math.round(b.bottom - r.bottom)} (top, bottom)`,
                });
            }
          }

        // SOBREPOSIÇÃO: itens de lista, peças do palco, cômodos da casa
        const groups: Element[][] = [];
        for (const section of sections) {
          for (const list of section.querySelectorAll("ul, ol"))
            groups.push(
              [...list.children].filter(
                (li) => li.getAttribute("aria-hidden") !== "true",
              ),
            );
          // The stage of the products: every piece of it, the ties included (a tie may touch a card, never cross it)
          for (const stage of section.querySelectorAll('[role="group"]'))
            groups.push([...stage.children]);
        }
        const cross = (a: DOMRect, b: DOMRect) =>
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
        for (const group of groups) {
          const items = group.filter(visible);
          for (let i = 0; i < items.length; i++)
            for (let j = i + 1; j < items.length; j++)
              if (
                cross(
                  items[i].getBoundingClientRect(),
                  items[j].getBoundingClientRect(),
                )
              )
                out.push({
                  kind: "overlap",
                  what: name(items[i]),
                  detail: `crosses ${name(items[j])}`,
                });
        }

        if (document.documentElement.scrollWidth > innerWidth + 1)
          out.push({
            kind: "scroll-x",
            what: "page",
            detail: `${document.documentElement.scrollWidth} > ${innerWidth}`,
          });
        return out;
      });
      expect(findings).toEqual([]);
    });

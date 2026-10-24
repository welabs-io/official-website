// TESTES DA ABERTURA DE MARCA
// v4 (brief-v4, artboard 8): the opening plays the brand's motion file over the seal band of the light endorsed file
// (intro-run.ts, BOXES). The boxes must be the viewBoxes of the files the site serves, the motion file must be the
// same drawing as the plain light logo (same viewBox), and the endorsed file must only add the seal under it.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BOXES, SEAL_CUT } from "./intro-run";

const ROOT = path.resolve(__dirname, "../..");
const file = (dir: string, name: string) =>
  readFileSync(path.join(ROOT, "public/brands/welabs", dir, name), "utf8");
const viewBox = (text: string) =>
  /viewBox="([^"]+)"/.exec(text)![1].split(/\s+/).map(Number);

describe("the boxes of the opening", () => {
  it.each(Object.keys(BOXES))(
    "%s: the boxes are the viewBoxes of its files",
    (slug) => {
      const box = BOXES[slug as keyof typeof BOXES];
      const endorsed = viewBox(file("products", `${slug}-light-endorsed.svg`));
      const motion = viewBox(file("motion", `${slug}-light.svg`));
      const plain = viewBox(file("products", `${slug}-light.svg`));
      expect(endorsed).toEqual(box.light);
      expect(motion[3]).toBeCloseTo(box.motionHeight, 2);
      // The motion is the plain logo, and the endorsed file adds the seal under it on the same x, width and top
      expect(motion).toEqual(plain);
      expect(motion.slice(0, 3)).toEqual(endorsed.slice(0, 3));
      expect(endorsed[3]).toBeGreaterThan(motion[3]);
    },
  );

  it.each(Object.keys(BOXES))(
    "%s: the motion file plays the brand cycle of 4.8 s and draws no text",
    (slug) => {
      const motion = file("motion", `${slug}-light.svg`);
      expect(motion).toMatch(/animation:\w[\w-]* 4\.8s /);
      expect(motion).not.toMatch(/<text\b/);
    },
  );

  // v4.1 (operator, 2026-10-24): the player drops the backdrop of the motion file at run time and starts the seal band
  // at SEAL_CUT; the files stay as the brand ships them
  it.each(Object.keys(BOXES))(
    "%s: the motion file has one backdrop the size of its viewBox, and nothing else is",
    (slug) => {
      const motion = file("motion", `${slug}-light.svg`);
      const view = viewBox(motion);
      const rects = [
        ...motion.matchAll(
          /<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*>/g,
        ),
      ];
      const backdrops = rects.filter((m) =>
        [1, 2, 3, 4].every((i) => Number(m[i]) === view[i - 1]),
      );
      expect(backdrops).toHaveLength(1);
      expect(backdrops[0][0]).toMatch(/fill="#FAF5EA"/i);
    },
  );

  it.each(Object.keys(BOXES))(
    "%s: the seal band starts above the seal and below the drawing of the logo",
    (slug) => {
      const endorsed = file("products", `${slug}-light-endorsed.svg`);
      // The seal group: translate(x y) scale(s), whose highest piece is the amber block of the "by welabs" lockup
      const g =
        /<g transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\)">([\s\S]*)<\/g>/.exec(
          endorsed,
        )!;
      const ys = [...g[4].matchAll(/<rect [^>]*y="([-\d.]+)"/g)].map((m) =>
        Number(m[1]),
      );
      const sealTop = Number(g[2]) + Number(g[3]) * Math.min(0, ...ys);
      expect(SEAL_CUT).toBeLessThan(sealTop - 10);
      // The lowest drawing of the five logos is the descender of the Knowly, y 284.1 (measured by getBBox)
      expect(SEAL_CUT).toBeGreaterThan(284.1 + 10);
    },
  );
});

describe("the player", () => {
  it("draws with no blur and no scale of the logo", () => {
    for (const name of ["intro-run.ts", "intro.module.css"]) {
      const src = readFileSync(path.join(__dirname, name), "utf8").replace(
        /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
        "",
      );
      expect(src, name).not.toMatch(/blur|scale\(|zoom/);
    }
  });
});

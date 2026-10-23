// TESTES DA ABERTURA DE MARCA
// v4 (brief-v4, artboard 8): the opening plays the brand's motion file over the seal band of the light endorsed file
// (intro-run.ts, BOXES). The boxes must be the viewBoxes of the files the site serves, the motion file must be the
// same drawing as the plain light logo (same viewBox), and the endorsed file must only add the seal under it.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BOXES } from "./intro-run";

const ROOT = path.resolve(__dirname, "../..");
const file = (dir: string, name: string) => readFileSync(path.join(ROOT, "public/brands/welabs", dir, name), "utf8");
const viewBox = (text: string) => /viewBox="([^"]+)"/.exec(text)![1].split(/\s+/).map(Number);

describe("the boxes of the opening", () => {
  it.each(Object.keys(BOXES))("%s: the boxes are the viewBoxes of its files", (slug) => {
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
  });

  it.each(Object.keys(BOXES))("%s: the motion file plays the brand cycle of 4.8 s and draws no text", (slug) => {
    const motion = file("motion", `${slug}-light.svg`);
    expect(motion).toMatch(/animation:\w[\w-]* 4\.8s /);
    expect(motion).not.toMatch(/<text\b/);
  });
});

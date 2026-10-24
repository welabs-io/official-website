// TESTES DAS ABERTURAS PORTADAS
// The player lays the light endorsed logo of the site inside the box the round drew in (intro-run.ts, BOXES): the light
// boxes must be the viewBoxes of the files the site shows, every opening must find its sign in the light logo, and the
// eases written without GSAP must keep GSAP's ends and shape. v4 (operator, 2026-10-24): the camera's close-up is the
// one contained factor of kit.js, at most 1.2; the sources carry no retired cream or sand colour and no blur.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CLOSE_UP, LIGHT, parseEase } from "./kit";
import { BOXES, stageScale } from "./intro-run";

const ROOT = path.resolve(__dirname, "../..");
const svg = (file: string) =>
  readFileSync(path.join(ROOT, "public/brands/welabs/products", file), "utf8");
const viewBox = (text: string) =>
  /viewBox="([^"]+)"/.exec(text)![1].split(/\s+/).map(Number);
const SOURCES = readdirSync(__dirname).filter(
  (f) => /\.(js|ts|css)$/.test(f) && !/\.test\.ts$/.test(f),
);
const source = (f: string) => readFileSync(path.join(__dirname, f), "utf8");
// The source without its comments, so a retired value named in a comment does not count
const code = (f: string) =>
  source(f)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");

describe("the boxes of the openings", () => {
  it.each(Object.keys(BOXES))(
    "%s: the light box is the viewBox of its endorsed file",
    (slug) => {
      const box = BOXES[slug as keyof typeof BOXES];
      expect(viewBox(svg(`${slug}-light-endorsed.svg`))).toEqual(box.light);
      // Same drawing, so the light box only adds the protection area around the round's box
      expect(box.light[0]).toBeLessThanOrEqual(box.dark[0]);
      expect(box.light[1]).toBeLessThanOrEqual(box.dark[1]);
      expect(box.light[0] + box.light[2]).toBeGreaterThanOrEqual(
        box.dark[0] + box.dark[2],
      );
    },
  );
  it("each choreography finds its sign in the light logo", () => {
    expect(svg("domus-light.svg")).toMatch(
      /<rect [^>]*fill="none" stroke="#[0-9A-Fa-f]{6}" stroke-width/,
    );
    expect(
      svg("relloo-light.svg").match(
        /<path d="M4\.80 135\.00C[^"]*" fill="#[0-9A-Fa-f]{6}" transform="translate\([\d.]+ 0\)"\/>/g,
      ),
    ).toHaveLength(2);
    expect(
      svg("tuner-light.svg").match(
        /A[\d.]+ [\d.]+ 0 0 1 [-\d.]+ [-\d.]+" fill="none" stroke="#[0-9A-Fa-f]{6}" stroke-width="[\d.]+" stroke-linecap="round"\/>/g,
      ),
    ).toHaveLength(2);
    expect(svg("knowly-light.svg")).toMatch(
      /<circle cx="[\d.]+" cy="[\d.]+" r="[\d.]+" fill="none"/,
    );
    expect(svg("magneto-light.svg")).toMatch(
      /<rect x="[\d.]+" y="[\d.]+" width="[\d.]+" height="[\d.]+" fill="#/,
    );
  });
});

describe("the camera and the stage", () => {
  it("the close-up of the camera is contained (at most 1.2) and every opening uses it", () => {
    expect(CLOSE_UP).toBeGreaterThan(1);
    expect(CLOSE_UP).toBeLessThanOrEqual(1.2);
    for (const f of [
      "domus.js",
      "relloo.js",
      "magneto-flow.js",
      "tuner.js",
      "knowly.js",
    ]) {
      // No opening sets a close-up factor of its own
      expect(code(f), f).not.toMatch(/\bzIn:\s*[\d.]|\bZ_?IN\s*=\s*[\d.]/);
      expect(code(f), f).toMatch(/CLOSE_UP/);
    }
  });
  it("the stage fits the window: the scene's width on a wide window, the logo on a phone, never past its size", () => {
    for (const slug of Object.keys(BOXES) as (keyof typeof BOXES)[]) {
      const desk = stageScale(slug, 1440, 900, 72);
      // At least the scene's width, at most the room under the header
      expect(desk).toBeGreaterThanOrEqual((1440 * 0.94) / 1920 - 1e-9);
      expect(desk).toBeLessThanOrEqual(((900 - 72) * 0.94) / 1080 + 1e-9);
      const phone = stageScale(slug, 390, 844, 56);
      // The closing logo (its light box) fits the phone's width with a margin
      expect(BOXES[slug].light[2] * phone).toBeLessThanOrEqual(390 * 0.75);
      expect(phone).toBeGreaterThanOrEqual((390 * 0.94) / 1920);
      expect(stageScale(slug, 4000, 3000, 72)).toBe(1);
    }
  });
});

describe("the palette and the effects of the openings", () => {
  it("the light palette is the v4 one (app/lib.css roles)", () => {
    expect(LIGHT.page).toBe("#f7f7f5");
    expect(LIGHT.card).toBe("#ffffff");
    expect(LIGHT.ink).toBe("#121212");
  });
  it.each(SOURCES)(
    "%s carries no retired cream or sand, no halo and no blur",
    (f) => {
      const text = code(f).toLowerCase();
      for (const retired of [
        "#faf5ea",
        "#f3ecdd",
        "#d4c7ab",
        "#1c1a16",
        "#827968",
        "#a39883",
        "#e2d8c3",
        "#625b4e",
      ])
        expect(text, retired).not.toContain(retired);
      expect(text).not.toMatch(/blur|gaussianblur|backdrop-filter/);
      expect(text).not.toMatch(/radial-gradient/);
    },
  );
});

describe("the eases without GSAP", () => {
  it.each([
    "power2.in",
    "power3.out",
    "power3.inOut",
    "power4.out",
    "sine.inOut",
    "back.inOut(0.9)",
    "power1.inOut",
  ])("%s starts at 0 and ends at 1", (name) => {
    const f = parseEase(name);
    expect(f(0)).toBeCloseTo(0, 6);
    expect(f(1)).toBeCloseTo(1, 6);
  });
  it("power3.out is GSAP's quartic out, and back overshoots", () => {
    expect(parseEase("power3.out")(0.5)).toBeCloseTo(1 - 0.5 ** 4, 6);
    expect(
      Math.min(...[0.05, 0.1, 0.15].map(parseEase("back.inOut(0.9)"))),
    ).toBeLessThan(0);
  });
});

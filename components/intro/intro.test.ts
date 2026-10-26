// TESTES DAS ABERTURAS PORTADAS
// The player lays the light endorsed logo of the site inside the box the round drew in (intro-run.ts, BOXES): the light
// boxes must be the viewBoxes of the files the site shows, every opening must find its sign in the light logo, and the
// eases written without GSAP must keep GSAP's ends and shape. v4 (operator, 2026-10-24): the choreographies keep the
// round's camera, the stage is sized by its closing logo, and the sources carry no retired cream or sand colour and no blur.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LIGHT, parseEase } from "./kit";
import { BOXES, LOGO_SHARE, PANEL, panelBox, stageScale } from "./intro-run";

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
  it("every opening keeps the camera of the round (the official intro, untouched)", () => {
    expect(code("domus.js")).toMatch(/\bzIn:\s*1\.7\b/);
    expect(code("relloo.js")).toMatch(/\bzIn:\s*1\.55\b/);
    expect(code("knowly.js")).toMatch(/\bzIn:\s*1\.55\b/);
    expect(code("magneto-flow.js")).toMatch(/\bZ_IN\s*=\s*1\.55\b/);
    expect(code("tuner.js")).toMatch(/\bZIN\s*=\s*1\.55\b/);
  });
  // v6 (operator, 2026-10-26): the opening plays in a compact panel, no longer over the whole window
  it("the panel is compact: 480 x 270 centred under the header at 1440 x 900, 88 % of a phone, 16:9", () => {
    const desk = panelBox(1440, 900, 72);
    expect(desk).toEqual({
      x: 480,
      y: 72 + (900 - 72 - 270) / 2,
      w: 480,
      h: 270,
    });
    const phone = panelBox(390, 844, 56);
    expect(phone.w).toBe(Math.round(390 * PANEL.phone));
    expect(phone.h).toBe(Math.round((phone.w * 9) / 16));
    // Centred to the whole pixel
    expect(Math.abs(phone.x * 2 + phone.w - 390)).toBeLessThanOrEqual(1);
    for (const [w, h] of [
      [768, 1024],
      [1280, 720],
      [1920, 1080],
      [2560, 1440],
    ]) {
      const b = panelBox(w, h, 72);
      expect(b.w / w).toBeLessThanOrEqual(PANEL.cap);
      expect(b.h / h).toBeLessThanOrEqual(PANEL.cap);
    }
  });
  it("the stage is sized by its closing logo: ~200 px in the panel of a 1440 window, never past the panel nor its size", () => {
    for (const slug of Object.keys(BOXES) as (keyof typeof BOXES)[]) {
      const desk = stageScale(slug, 480);
      const logo = BOXES[slug].light[2] * desk;
      expect(logo).toBeLessThanOrEqual(480 * LOGO_SHARE + 1e-6);
      expect(logo).toBeGreaterThan(195);
      expect(1920 * desk).toBeLessThanOrEqual(480 + 1e-6);
      const phone = stageScale(slug, 343);
      expect(BOXES[slug].light[2] * phone).toBeLessThanOrEqual(
        343 * LOGO_SHARE + 1e-6,
      );
      expect(1920 * phone).toBeLessThanOrEqual(343 + 1e-6);
      expect(stageScale(slug, 4000)).toBeLessThanOrEqual(1);
    }
  });
});

describe("the palette and the effects of the openings", () => {
  it("the light palette is the v4 one (app/lib.css roles)", () => {
    expect(LIGHT.page).toBe("#f7f7f5");
    expect(LIGHT.card).toBe("#ffffff");
    expect(LIGHT.ink).toBe("#121212");
    // v6 (brand video QA, 2026-10-26): the arcs of the Tuner dial, a stone step at ~2:1 on the stage (was 1.07:1)
    expect(LIGHT.dial).toBe("#b4b4b0");
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

// TESTES DAS ABERTURAS PORTADAS
// The player lays the light endorsed logo of the site inside the box the round drew in (intro-run.ts, BOXES): the light
// boxes must be the viewBoxes of the files the site shows, every opening must find its sign in the light logo, and the
// eases written without GSAP must keep GSAP's ends and shape.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseEase } from "./kit";
import { BOXES } from "./intro-run";

const ROOT = path.resolve(__dirname, "../..");
const svg = (file: string) =>
  readFileSync(path.join(ROOT, "public/brands/welabs/products", file), "utf8");
const viewBox = (text: string) =>
  /viewBox="([^"]+)"/.exec(text)![1].split(/\s+/).map(Number);

describe("the boxes of the openings", () => {
  it.each(Object.keys(BOXES))("%s: the light box is the viewBox of its endorsed file", (slug) => {
    const box = BOXES[slug as keyof typeof BOXES];
    expect(viewBox(svg(`${slug}-light-endorsed.svg`))).toEqual(box.light);
    // Same drawing, so the light box only adds the protection area around the round's box
    expect(box.light[0]).toBeLessThanOrEqual(box.dark[0]);
    expect(box.light[1]).toBeLessThanOrEqual(box.dark[1]);
    expect(box.light[0] + box.light[2]).toBeGreaterThanOrEqual(box.dark[0] + box.dark[2]);
  });
  it("each choreography finds its sign in the light logo", () => {
    expect(svg("domus-light.svg")).toMatch(/<rect [^>]*fill="none" stroke="#[0-9A-Fa-f]{6}" stroke-width/);
    expect(svg("relloo-light.svg").match(/<path d="M4\.80 135\.00C[^"]*" fill="#[0-9A-Fa-f]{6}" transform="translate\([\d.]+ 0\)"\/>/g)).toHaveLength(2);
    expect(svg("tuner-light.svg").match(/A[\d.]+ [\d.]+ 0 0 1 [-\d.]+ [-\d.]+" fill="none" stroke="#[0-9A-Fa-f]{6}" stroke-width="[\d.]+" stroke-linecap="round"\/>/g)).toHaveLength(2);
    expect(svg("knowly-light.svg")).toMatch(/<circle cx="[\d.]+" cy="[\d.]+" r="[\d.]+" fill="none"/);
    expect(svg("magneto-light.svg")).toMatch(/<rect x="[\d.]+" y="[\d.]+" width="[\d.]+" height="[\d.]+" fill="#/);
  });
});

describe("the eases without GSAP", () => {
  it.each(["power2.in", "power3.out", "power3.inOut", "power4.out", "sine.inOut", "back.inOut(0.9)", "power1.inOut"])(
    "%s starts at 0 and ends at 1",
    (name) => {
      const f = parseEase(name);
      expect(f(0)).toBeCloseTo(0, 6);
      expect(f(1)).toBeCloseTo(1, 6);
    },
  );
  it("power3.out is GSAP's quartic out, and back overshoots", () => {
    expect(parseEase("power3.out")(0.5)).toBeCloseTo(1 - 0.5 ** 4, 6);
    expect(Math.min(...[0.05, 0.1, 0.15].map(parseEase("back.inOut(0.9)")))).toBeLessThan(0);
  });
});

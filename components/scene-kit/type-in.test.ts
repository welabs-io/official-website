// TESTES DOS TEMPOS DA DIGITAÇÃO
// The typing times a scene reads in TypeScript (type-in.ts) mirror the tokens of app/lib.css that the CSS of TypeIn
// reads (brief-v4: ~18 ms per character, "digitando" 1 s, ~2 s between phrases): one change must reach both.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PHRASE_PAUSE_MS, TYPE_CHAR_MS, TYPING_MS, typeDuration } from "./type-in";

const lib = readFileSync(path.resolve(__dirname, "../../app/lib.css"), "utf8");
// A duration token of app/lib.css, in ms
const token = (name: string) => {
  const m = new RegExp(`${name}:\\s*([\\d.]+)(ms|s);`).exec(lib);
  if (!m) throw new Error(`${name} is not a duration in app/lib.css`);
  return Number(m[1]) * (m[2] === "s" ? 1000 : 1);
};

describe("the typing times", () => {
  it("mirror the tokens of app/lib.css", () => {
    expect(TYPE_CHAR_MS).toBe(token("--type-char"));
    expect(TYPING_MS).toBe(token("--typing-hold"));
    expect(PHRASE_PAUSE_MS).toBe(token("--phrase-pause"));
  });

  it("type a phrase one step per character (an accented letter or an emoji is one)", () => {
    expect(typeDuration("Olá")).toBe(3 * TYPE_CHAR_MS);
    expect(typeDuration("")).toBe(0);
  });

  it("the three curves of v4 are tokens", () => {
    expect(lib).toMatch(/--ease-enter:\s*cubic-bezier\(0\.22, 1, 0\.36, 1\);/);
    expect(lib).toMatch(/--ease-swap:\s*var\(--ease-in-out\);/);
    expect(lib).toMatch(/--ease-in-out:\s*cubic-bezier\(0\.65, 0, 0\.35, 1\);/);
    expect(lib).toMatch(/--ease-hover:\s*cubic-bezier\(0\.4, 0, 0\.2, 1\);/);
    expect(token("--dur-enter")).toBe(800);
    expect(token("--dur-swap")).toBe(450);
    expect(token("--dur-grow")).toBe(700);
    expect(token("--stagger")).toBe(80);
  });
});

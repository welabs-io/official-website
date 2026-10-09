// TESTES DA SINCRONIA DA CADEIA
// The list of products follows the film time: the opening lights nothing, each beat lights its product and keeps the
// ones before it, the closing beat lights all, and a frame that is not playing shows everything lit.
import { describe, expect, it } from "vitest";
import { CHAIN_BEATS } from "@/lib/motion-slides";
import { chainStep, stateOfRow } from "./Chain";

describe("chain step by film time", () => {
  it("has one beat per product plus the closing one", () => {
    expect(CHAIN_BEATS).toHaveLength(6);
    expect([...CHAIN_BEATS].sort((a, b) => a - b)).toEqual([...CHAIN_BEATS]);
  });
  it("lights nothing during the opening and before the first beat", () => {
    expect(chainStep(-1)).toBe(-1);
    expect(chainStep(CHAIN_BEATS[0] - 0.1)).toBe(-1);
  });
  it("moves to the product of each beat", () => {
    for (let i = 0; i < 5; i++)
      expect(chainStep(CHAIN_BEATS[i] + 0.05)).toBe(i);
    expect(chainStep(CHAIN_BEATS[5] + 0.05)).toBe(5);
  });
  it("is static (null) when the frame is not playing", () => {
    expect(chainStep(null)).toBeNull();
  });
});

describe("row state", () => {
  it("current, done and idle follow the step", () => {
    expect(stateOfRow(2, 2)).toBe("current");
    expect(stateOfRow(2, 1)).toBe("done");
    expect(stateOfRow(2, 3)).toBe("idle");
    expect(stateOfRow(-1, 0)).toBe("idle");
  });
  it("everything is lit when static or at the closing beat", () => {
    for (let i = 0; i < 5; i++) {
      expect(stateOfRow(null, i)).toBe("done");
      expect(stateOfRow(5, i)).toBe("done");
    }
  });
});

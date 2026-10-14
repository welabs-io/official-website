// TESTES DO ROTEIRO DAS CENAS
// The script is the clock of the native chain: seven scenes that follow the seven steps of the chain, actions that fit
// inside their scene, a token that walks inside it and at least STILL_TARGET of the cycle with nothing moving.
import { describe, expect, it } from "vitest";
import { CHAIN_STEPS } from "@/lib/chain";
import {
  CONNECTOR_SECONDS,
  CYCLE_MAX_SECONDS,
  HOLD_SECONDS_RANGE,
  SCENE_SECONDS_RANGE,
  SCRIPT,
  STILL_TARGET,
  SWAP_SECONDS,
  cycleSeconds,
  motionSeconds,
  sceneSeconds,
  stillRatio,
} from "./script";
import { SCENE_IDS } from "./types";

describe("scene script", () => {
  it("has the seven scenes in order, one per step of the chain", () => {
    expect(SCRIPT.map((s) => s.id)).toEqual([...SCENE_IDS]);
    expect(SCRIPT.map((s) => s.step)).toEqual(CHAIN_STEPS.map((s) => s.step));
    SCRIPT.forEach((scene) =>
      expect(scene.products).toEqual(CHAIN_STEPS[scene.step].products),
    );
  });

  it.each(SCRIPT.map((s) => [s.id, s] as const))(
    "%s: actions start after the swap, end at settle and have unique ids",
    (_, scene) => {
      expect(new Set(scene.actions.map((a) => a.id)).size).toBe(
        scene.actions.length,
      );
      const ends = scene.actions.map((a) => a.at + a.dur);
      for (const a of scene.actions) {
        expect(a.at).toBeGreaterThanOrEqual(SWAP_SECONDS);
        expect(a.dur).toBeGreaterThan(0);
      }
      expect(Math.max(...ends)).toBeCloseTo(scene.settle, 3);
    },
  );

  // Twice the pace measured on khal.ai (a scene of 4.4 to 5 s there): about 2.5 s per scene with 0.8 to 1.0 s of hold
  it.each(SCRIPT.map((s) => [s.id, s] as const))(
    `%s: lasts ${SCENE_SECONDS_RANGE[0]} to ${SCENE_SECONDS_RANGE[1]} s and holds the final frame ${HOLD_SECONDS_RANGE[0]} to ${HOLD_SECONDS_RANGE[1]} s`,
    (_, scene) => {
      expect(sceneSeconds(scene)).toBeGreaterThanOrEqual(
        SCENE_SECONDS_RANGE[0],
      );
      expect(sceneSeconds(scene)).toBeLessThanOrEqual(SCENE_SECONDS_RANGE[1]);
      expect(scene.hold).toBeGreaterThanOrEqual(HOLD_SECONDS_RANGE[0]);
      expect(scene.hold).toBeLessThanOrEqual(HOLD_SECONDS_RANGE[1]);
    },
  );

  it.each(SCRIPT.map((s) => [s.id, s] as const))(
    "%s: no action starts before the swap has landed",
    (_, scene) => {
      const first = Math.min(...scene.actions.map((a) => a.at));
      expect(first).toBeGreaterThanOrEqual(SWAP_SECONDS);
    },
  );

  it("the swap is a rotation of 0.4 to 0.5 s (2x pace)", () => {
    expect(SWAP_SECONDS).toBeGreaterThanOrEqual(0.4);
    expect(SWAP_SECONDS).toBeLessThanOrEqual(0.5);
  });

  it(`the cycle is at most ${CYCLE_MAX_SECONDS} s`, () => {
    expect(cycleSeconds()).toBeLessThanOrEqual(CYCLE_MAX_SECONDS);
  });

  it.each(SCRIPT.map((s) => [s.id, s] as const))(
    "%s: the token walks inside the scene, after the swap",
    (_, scene) => {
      expect(scene.token.at).toBeGreaterThanOrEqual(SWAP_SECONDS);
      expect(scene.token.at + scene.token.dur).toBeLessThanOrEqual(
        scene.settle + 1e-9,
      );
    },
  );

  it("the first action waits for the connector pulse to finish or overlaps it knowingly", () => {
    // The connector pulse after a swap lasts CONNECTOR_SECONDS; it is counted as motion with the swap
    expect(CONNECTOR_SECONDS).toBeLessThanOrEqual(1);
    expect(motionSeconds(SCRIPT[0])).toBeGreaterThanOrEqual(CONNECTOR_SECONDS);
  });

  it(`at least ${STILL_TARGET * 100}% of the cycle is still`, () => {
    expect(stillRatio()).toBeGreaterThanOrEqual(STILL_TARGET);
    // And no scene is below the bar on its own: each one stays at the target or above (51.6% to 55.1% measured)
    for (const scene of SCRIPT)
      expect(
        1 - motionSeconds(scene) / sceneSeconds(scene),
      ).toBeGreaterThanOrEqual(STILL_TARGET);
  });

  it("the cycle is the sum of the scenes, and the last scene holds longest", () => {
    expect(cycleSeconds()).toBeCloseTo(
      SCRIPT.reduce((sum, s) => sum + sceneSeconds(s), 0),
      3,
    );
    const holds = SCRIPT.map((s) => s.hold);
    expect(holds[holds.length - 1]).toBe(Math.max(...holds));
  });
});

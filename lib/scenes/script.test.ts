// TESTES DO ROTEIRO DAS CENAS
// The script is the clock of the native scenes: the three outcomes of the home, with actions that fit inside their
// scene, the pace shared with the capability scenes and at least STILL_TARGET of a scene with nothing moving.
import { describe, expect, it } from "vitest";
import {
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
  it("has the three outcomes of the home, in order", () => {
    expect(SCRIPT.map((s) => s.id)).toEqual([...SCENE_IDS]);
    expect(SCRIPT.map((s) => s.products[0])).toEqual([
      "tuner",
      "knowly",
      "domus",
    ]);
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

  it("the swap is a rotation of 0.4 to 0.5 s (2x pace)", () => {
    expect(SWAP_SECONDS).toBeGreaterThanOrEqual(0.4);
    expect(SWAP_SECONDS).toBeLessThanOrEqual(0.5);
  });

  it(`at least ${STILL_TARGET * 100}% of every scene is still`, () => {
    expect(stillRatio(SCRIPT)).toBeGreaterThanOrEqual(STILL_TARGET);
    for (const scene of SCRIPT)
      expect(
        1 - motionSeconds(scene) / sceneSeconds(scene),
      ).toBeGreaterThanOrEqual(STILL_TARGET);
  });

  it("a cycle is the sum of its scenes", () => {
    expect(cycleSeconds(SCRIPT)).toBeCloseTo(
      SCRIPT.reduce((sum, s) => sum + sceneSeconds(s), 0),
      3,
    );
  });
});

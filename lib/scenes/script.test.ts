// TESTES DO ROTEIRO DAS CENAS
// The script is the clock of the native chain: seven scenes that follow the seven steps of the manifest, actions that fit
// inside their scene, a token that walks inside it and at least STILL_TARGET of the cycle with nothing moving.
import { describe, expect, it } from "vitest";
import { MANIFEST } from "@/lib/manifest";
import {
  CONNECTOR_SECONDS,
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
  it("has the seven scenes in order, one per step of the motion manifest", () => {
    expect(SCRIPT.map((s) => s.id)).toEqual([...SCENE_IDS]);
    expect(SCRIPT.map((s) => s.step)).toEqual(
      MANIFEST.chain.steps.map((s) => s.step),
    );
    SCRIPT.forEach((scene) =>
      expect(scene.products).toEqual(MANIFEST.chain.steps[scene.step].products),
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
      expect(scene.hold).toBeGreaterThanOrEqual(1);
    },
  );

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
    // And no scene is below the bar by much on its own: each one stays above 60%
    for (const scene of SCRIPT)
      expect(1 - motionSeconds(scene) / sceneSeconds(scene)).toBeGreaterThan(
        0.6,
      );
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

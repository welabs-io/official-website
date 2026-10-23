// ROTEIRO DAS CENAS NATIVAS (VERSÃO 3.0)
// The clock of every native scene: per scene, the actions with a time relative to the start of the scene, the instant
// everything is settled (`settle`) and how long the settled frame stays (`hold`). The scene lasts settle + hold; the
// runner (components/scenes/scene-run.ts) swaps to the next scene at that instant and nothing else moves in between.
//
// Version 3.0 (v2 of the content, 2026-10-20): the chain carousel left the home, so the script keeps only the three
// scenes the home shows as outcomes (their settled frame, MiniScene) and the shared clock the capability stage of a
// product page reads (lib/scenes/capabilities.ts). Every scene keeps the three beats of the ludic pass (0.45 s for
// 0.22 s, 0.8 s for 0.28 s, 1.25 s for 0.27 s) and a hold of 1.0 s.
//
// Rules the tests enforce (lib/scenes/script.test.ts):
//  - every action ends at or before `settle`, and the last one ends exactly at it;
//  - the first action starts after the swap (0.45 s), so scene and swap never move together;
//  - the scene lasts 2.3 to 2.8 s and its hold 0.8 to 1.0 s;
//  - at least STILL_TARGET of a stage is still (the swap and the actions counted as motion).
import type { SceneId } from "./types";

export const SCRIPT_VERSION = "3.0.0";

// Seconds the swap between two scenes takes (the rotation of the tiles)
export const SWAP_SECONDS = 0.45;

// Share of a stage that must be still, from the script alone
export const STILL_TARGET = 0.5;

// Bounds of a scene and of its final hold, in seconds
export const SCENE_SECONDS_RANGE = [2.3, 2.8] as const;
export const HOLD_SECONDS_RANGE = [0.8, 1.0] as const;

export type Action = {
  // Name the components look up (`data-act`); unique inside the scene
  id: string;
  // Start, relative to the beginning of the scene
  at: number;
  // Length of the whole action (with the stagger of its items)
  dur: number;
};

// The clock of any native scene: the stage, the runner and the still share only read these fields
export type TimedScene = {
  id: string;
  actions: readonly Action[];
  // End of the last action: from here the frame is final
  settle: number;
  // Seconds the final frame stays before the swap
  hold: number;
};

export type SceneScript = TimedScene & {
  id: SceneId;
  // Products the scene is about (the first is the protagonist)
  products: readonly string[];
};

export const SCRIPT: readonly SceneScript[] = [
  {
    id: "s1",
    products: ["tuner"],
    // The call rises and its waveform grows; the contact types, the bubble springs on the phone and flies into the inbox;
    // the two channels join, the pill pops and the Tuner logo swells
    actions: [
      { id: "call", at: 0.45, dur: 0.22 },
      { id: "ask", at: 0.8, dur: 0.28 },
      { id: "merge", at: 1.25, dur: 0.27 },
    ],
    settle: 1.52,
    hold: 1.0,
  },
  {
    id: "s4",
    products: ["knowly"],
    // The document rises, its line is marked, and the answer flies out of it with the source
    actions: [
      { id: "doc", at: 0.45, dur: 0.22 },
      { id: "hit", at: 0.8, dur: 0.28 },
      { id: "answer", at: 1.25, dur: 0.27 },
    ],
    settle: 1.52,
    hold: 1.0,
  },
  {
    id: "s6",
    products: ["domus", "tuner"],
    // The room Pedidos takes the result, the notification springs over the phone, the reply springs in
    actions: [
      { id: "home", at: 0.45, dur: 0.22 },
      { id: "toast", at: 0.8, dur: 0.28 },
      { id: "received", at: 1.25, dur: 0.27 },
    ],
    settle: 1.52,
    hold: 1.0,
  },
];

const round = (n: number) => Math.round(n * 1000) / 1000;

export const sceneSeconds = (scene: TimedScene) =>
  round(scene.settle + scene.hold);

export const cycleSeconds = (script: readonly TimedScene[]) =>
  round(script.reduce((sum, scene) => sum + sceneSeconds(scene), 0));

// Moving intervals of a scene, relative to its start: the swap and the actions
function motionIntervals(scene: TimedScene): [number, number][] {
  return [
    [0, SWAP_SECONDS],
    ...scene.actions.map((a): [number, number] => [a.at, a.at + a.dur]),
  ];
}

// Seconds of the scene in which something moves (union of the intervals)
export function motionSeconds(scene: TimedScene): number {
  const sorted = motionIntervals(scene).sort((a, b) => a[0] - b[0]);
  let total = 0;
  let [from, to] = sorted[0];
  for (const [start, end] of sorted.slice(1)) {
    if (start > to) {
      total += to - from;
      [from, to] = [start, end];
    } else to = Math.max(to, end);
  }
  return round(total + (to - from));
}

// Share of a stage that is still, from the script alone
export const stillRatio = (script: readonly TimedScene[]) =>
  round(
    1 -
      script.reduce((sum, scene) => sum + motionSeconds(scene), 0) /
        cycleSeconds(script),
  );

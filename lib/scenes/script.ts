// ROTEIRO DAS CENAS DA CADEIA (VERSÃO 1.1)
// The script is the clock of the native chain. Per scene: the actions with a time relative to the start of the scene,
// the instant everything is settled (`settle`) and how long the settled frame stays (`hold`). The scene lasts
// settle + hold; the runner (components/scenes/scene-run.ts) swaps to the next scene at that instant and nothing else
// moves in between. The seven scenes follow the seven steps of the motion manifest, one to one (the manifest keeps the
// caption, the lit nodes and the accessible name; the time is decided here). Seconds everywhere.
//
// Version 1.1 follows the pace measured on khal.ai (hero: four scenes of 4.4 to 5 s, one action each, 1.2 to 2.5 s of
// legible hold, the swap as the only large movement): scenes of 4.5 to 5.5 s, a swap of 0.7 s (a turn with depth, see
// components/ring/rotation.css), short actions with a reading pause between them, and a hold of 1.2 to 1.8 s.
//
// Rules the tests enforce (lib/scenes/script.test.ts):
//  - every action ends at or before `settle`, and the last one ends exactly at it;
//  - the first action starts after the swap (0.7 s), so scene and swap never move together and no text changes before
//    the scene has settled;
//  - the token of the overview walks inside the scene;
//  - the scene lasts 4.5 to 5.5 s, its hold 1.2 to 1.8 s, and the cycle at most CYCLE_MAX_SECONDS;
//  - at least STILL_TARGET of the cycle is still (swap, connector and actions counted as motion).
import type { SceneId } from "./types";

export const SCRIPT_VERSION = "1.1.0";

// Seconds the swap between two scenes takes (the rotation of the tiles) and the connector pulse after it
export const SWAP_SECONDS = 0.7;
export const CONNECTOR_SECONDS = 0.7;

// Share of the cycle that must be still, from the script alone (the browser spec asks 55% of the page, which also counts
// the overview's own movement)
export const STILL_TARGET = 0.6;

// Bounds of a scene, of its final hold and of the whole chain, in seconds
export const SCENE_SECONDS_RANGE = [4.5, 5.5] as const;
export const HOLD_SECONDS_RANGE = [1.2, 1.8] as const;
export const CYCLE_MAX_SECONDS = 35;

export type Action = {
  // Name the components look up (`data-act`); unique inside the scene
  id: string;
  // Start, relative to the beginning of the scene
  at: number;
  // Length of the whole action (with the stagger of its items)
  dur: number;
};

// The clock of any native scene, of the chain or of a product page (lib/scenes/capabilities.ts): the stage, the runner and
// the still share only read these fields
export type TimedScene = {
  id: string;
  actions: readonly Action[];
  // End of the last action: from here the frame is final
  settle: number;
  // Seconds the final frame stays before the swap
  hold: number;
  // The token of the overview, where the stage has one: when it starts walking and how long it walks, inside the scene
  token?: { at: number; dur: number };
};

export type SceneScript = TimedScene & {
  id: SceneId;
  // Index of the step of the motion manifest this scene plays
  step: number;
  // Products the scene is about (the first is the protagonist)
  products: readonly string[];
  token: { at: number; dur: number };
};

export const SCRIPT: readonly SceneScript[] = [
  {
    id: "s0",
    step: 0,
    products: ["domus", "relloo"],
    actions: [
      { id: "rooms", at: 0.75, dur: 0.5 },
      { id: "funnel", at: 2.7, dur: 0.35 },
    ],
    settle: 3.05,
    hold: 1.8,
    token: { at: 0.75, dur: 0.5 },
  },
  {
    id: "s1",
    step: 1,
    products: ["tuner"],
    actions: [
      { id: "call", at: 0.75, dur: 0.2 },
      { id: "ask", at: 1.6, dur: 0.4 },
      { id: "merge", at: 3.15, dur: 0.3 },
    ],
    settle: 3.45,
    hold: 1.5,
    token: { at: 3.15, dur: 0.3 },
  },
  {
    id: "s2",
    step: 2,
    products: ["relloo"],
    actions: [
      { id: "born", at: 0.75, dur: 0.2 },
      { id: "facts", at: 1.6, dur: 0.45 },
      { id: "review", at: 3.15, dur: 0.3 },
    ],
    settle: 3.45,
    hold: 1.5,
    token: { at: 3.15, dur: 0.3 },
  },
  {
    id: "s3",
    step: 3,
    products: ["domus"],
    // The rooms light up, then the card takes what they hand over
    actions: [
      { id: "handoff", at: 0.8, dur: 0.45 },
      { id: "card", at: 2.55, dur: 0.5 },
    ],
    settle: 3.05,
    hold: 1.8,
    token: { at: 0.8, dur: 0.45 },
  },
  {
    id: "s4",
    step: 4,
    products: ["knowly"],
    actions: [
      { id: "doc", at: 0.75, dur: 0.25 },
      { id: "hit", at: 1.8, dur: 0.3 },
      { id: "answer", at: 2.9, dur: 0.4 },
    ],
    settle: 3.3,
    hold: 1.55,
    token: { at: 2.9, dur: 0.4 },
  },
  {
    id: "s5",
    step: 5,
    products: ["magneto"],
    actions: [
      { id: "rule", at: 0.75, dur: 0.35 },
      { id: "approve", at: 2.0, dur: 0.3 },
      { id: "finish", at: 3.1, dur: 0.4 },
    ],
    settle: 3.5,
    hold: 1.55,
    token: { at: 0.75, dur: 0.35 },
  },
  {
    id: "s6",
    step: 6,
    products: ["domus", "tuner"],
    actions: [
      { id: "home", at: 0.75, dur: 0.35 },
      { id: "toast", at: 1.8, dur: 0.35 },
      { id: "received", at: 2.9, dur: 0.25 },
    ],
    settle: 3.15,
    // The last scene stays longest, with the whole map at rest before the loop
    hold: 1.8,
    token: { at: 0.75, dur: 0.35 },
  },
];

const round = (n: number) => Math.round(n * 1000) / 1000;

export const sceneSeconds = (scene: TimedScene) =>
  round(scene.settle + scene.hold);

export const cycleSeconds = (script: readonly TimedScene[] = SCRIPT) =>
  round(script.reduce((sum, scene) => sum + sceneSeconds(scene), 0));

// Moving intervals of a scene, relative to its start: the swap and the connector pulse that follow it, the actions and
// the walk of the token (a stage without an overview has none)
function motionIntervals(scene: TimedScene): [number, number][] {
  return [
    [0, Math.max(SWAP_SECONDS, CONNECTOR_SECONDS)],
    ...scene.actions.map((a): [number, number] => [a.at, a.at + a.dur]),
    ...(scene.token
      ? [[scene.token.at, scene.token.at + scene.token.dur] as [number, number]]
      : []),
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

// Share of the cycle that is still, from the script alone (the browser test measures the same thing on the page)
export const stillRatio = (script: readonly TimedScene[] = SCRIPT) =>
  round(
    1 -
      script.reduce((sum, scene) => sum + motionSeconds(scene), 0) /
        cycleSeconds(script),
  );

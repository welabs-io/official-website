// ROTEIRO DAS CENAS DA CADEIA (VERSÃO 1)
// The script is the clock of the native chain. Per scene: the actions with a time relative to the start of the scene,
// the instant everything is settled (`settle`) and how long the settled frame stays (`hold`). The scene lasts
// settle + hold; the runner (components/scenes/scene-run.ts) swaps to the next scene at that instant and nothing else
// moves in between. The seven scenes follow the seven steps of the motion manifest, one to one (the manifest keeps the
// caption, the lit nodes and the accessible name; the time is decided here). Seconds everywhere.
//
// Rules the tests enforce (lib/scenes/script.test.ts):
//  - every action ends at or before `settle`, and the last one ends exactly at it;
//  - the first action starts after the swap (0.4 s), so scene and swap never move together;
//  - the token of the overview walks inside the scene;
//  - at least SCRIPT_VERSION's STILL_TARGET of the cycle is still (swap, connector and actions counted as motion).
import type { SceneId } from "./types";

export const SCRIPT_VERSION = "1.0.0";

// Seconds the swap between two scenes takes (CSS transition of the tiles) and the connector pulse after it
export const SWAP_SECONDS = 0.4;
export const CONNECTOR_SECONDS = 0.7;

// Share of the cycle that must be still
export const STILL_TARGET = 0.7;

export type Action = {
  // Name the components look up (`data-act`); unique inside the scene
  id: string;
  // Start, relative to the beginning of the scene
  at: number;
  // Length of the whole action (with the stagger of its items)
  dur: number;
};

export type SceneScript = {
  id: SceneId;
  // Index of the step of the motion manifest this scene plays
  step: number;
  // Products the scene is about (the first is the protagonist)
  products: readonly string[];
  actions: readonly Action[];
  // End of the last action: from here the frame is final
  settle: number;
  // Seconds the final frame stays before the swap
  hold: number;
  // The token of the overview: when it starts walking and how long it walks, inside the scene
  token: { at: number; dur: number };
};

export const SCRIPT: readonly SceneScript[] = [
  {
    id: "s0",
    step: 0,
    products: ["domus", "relloo"],
    actions: [
      { id: "rooms", at: 0.5, dur: 0.8 },
      { id: "funnel", at: 1.5, dur: 0.35 },
    ],
    settle: 1.85,
    hold: 4.7,
    token: { at: 0.5, dur: 1.35 },
  },
  {
    id: "s1",
    step: 1,
    products: ["tuner"],
    actions: [
      { id: "call", at: 0.5, dur: 0.35 },
      { id: "ask", at: 1.2, dur: 0.8 },
      { id: "merge", at: 2.3, dur: 0.5 },
    ],
    settle: 2.8,
    hold: 4.7,
    token: { at: 2.3, dur: 0.5 },
  },
  {
    id: "s2",
    step: 2,
    products: ["relloo"],
    actions: [
      { id: "born", at: 0.5, dur: 0.35 },
      { id: "facts", at: 1.1, dur: 0.9 },
      { id: "review", at: 2.4, dur: 0.45 },
    ],
    settle: 2.85,
    hold: 4.7,
    token: { at: 2.4, dur: 0.45 },
  },
  {
    id: "s3",
    step: 3,
    products: ["domus"],
    actions: [{ id: "handoff", at: 0.5, dur: 1.1 }],
    settle: 1.6,
    hold: 4.7,
    token: { at: 0.5, dur: 1.1 },
  },
  {
    id: "s4",
    step: 4,
    products: ["knowly"],
    actions: [
      { id: "doc", at: 0.5, dur: 0.35 },
      { id: "hit", at: 1.2, dur: 0.4 },
      { id: "answer", at: 1.9, dur: 0.5 },
    ],
    settle: 2.4,
    hold: 4.7,
    token: { at: 1.9, dur: 0.5 },
  },
  {
    id: "s5",
    step: 5,
    products: ["magneto"],
    actions: [
      { id: "rule", at: 0.5, dur: 0.6 },
      { id: "approve", at: 1.5, dur: 0.5 },
      { id: "finish", at: 2.5, dur: 0.8 },
    ],
    settle: 3.3,
    hold: 4.9,
    token: { at: 0.5, dur: 0.6 },
  },
  {
    id: "s6",
    step: 6,
    products: ["domus", "tuner"],
    actions: [
      { id: "home", at: 0.5, dur: 0.45 },
      { id: "toast", at: 1.3, dur: 0.5 },
      { id: "received", at: 1.9, dur: 0.3 },
    ],
    settle: 2.2,
    // The last scene stays longer, with the whole map at rest before the loop
    hold: 5.7,
    token: { at: 0.5, dur: 0.8 },
  },
];

const round = (n: number) => Math.round(n * 1000) / 1000;

export const sceneSeconds = (scene: SceneScript) =>
  round(scene.settle + scene.hold);

export const cycleSeconds = (script: readonly SceneScript[] = SCRIPT) =>
  round(script.reduce((sum, scene) => sum + sceneSeconds(scene), 0));

// Moving intervals of a scene, relative to its start: the swap and the connector pulse that follow it, the actions and
// the walk of the token
function motionIntervals(scene: SceneScript): [number, number][] {
  return [
    [0, Math.max(SWAP_SECONDS, CONNECTOR_SECONDS)],
    ...scene.actions.map((a): [number, number] => [a.at, a.at + a.dur]),
    [scene.token.at, scene.token.at + scene.token.dur],
  ];
}

// Seconds of the scene in which something moves (union of the intervals)
export function motionSeconds(scene: SceneScript): number {
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
export const stillRatio = (script: readonly SceneScript[] = SCRIPT) =>
  round(
    1 -
      script.reduce((sum, scene) => sum + motionSeconds(scene), 0) /
        cycleSeconds(script),
  );

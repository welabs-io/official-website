// ROTEIRO DAS CENAS DA CADEIA (VERSÃO 2.0, VELOCIDADE 2x)
// The script is the clock of the native chain. Per scene: the actions with a time relative to the start of the scene,
// the instant everything is settled (`settle`) and how long the settled frame stays (`hold`). The scene lasts
// settle + hold; the runner (components/scenes/scene-run.ts) swaps to the next scene at that instant and nothing else
// moves in between. The seven scenes follow the seven steps of the chain, one to one (lib/chain.ts keeps the caption,
// the lit nodes and the accessible name; the time is decided here). Seconds everywhere.
//
// Version 2.0 doubles the pace of 1.1 (the operator asked for twice the speed on 2026-10-13): the 1.1 scenes of 4.5 to
// 5.5 s became 2.45 to 2.6 s, the swap went from 0.7 to 0.45 s, every action takes half of its old length, the reading
// pause between actions shrank to 0.45 of its old length and the hold went from 1.2-1.8 s to 0.9-1.0 s. The cycle went
// from 34.45 s to 17.6 s.
//
// Rules the tests enforce (lib/scenes/script.test.ts):
//  - every action ends at or before `settle`, and the last one ends exactly at it;
//  - the first action starts after the swap (0.45 s), so scene and swap never move together and no text changes before
//    the scene has settled;
//  - the token of the overview walks inside the scene;
//  - the scene lasts 2.3 to 2.8 s, its hold 0.8 to 1.0 s, and the cycle at most CYCLE_MAX_SECONDS;
//  - at least STILL_TARGET of the cycle is still (swap, connector and actions counted as motion).
import type { SceneId } from "./types";

export const SCRIPT_VERSION = "2.0.0";

// Seconds the swap between two scenes takes (the rotation of the tiles) and the connector pulse after it
export const SWAP_SECONDS = 0.45;
export const CONNECTOR_SECONDS = 0.35;

// Share of the cycle that must be still, from the script alone (63% for the chain and 59% for the Magneto opening at the
// 2x pace; it was 60% at 1x, but a swap of 0.45 s weighs more in a 2.5 s scene). The browser specs ask 35% (chain stages) to
// 40% (single-scene carousels) of the page, which also counts the overview, the rails and the sampling grain of 100 ms
export const STILL_TARGET = 0.55;

// Bounds of a scene, of its final hold and of the whole chain, in seconds
export const SCENE_SECONDS_RANGE = [2.3, 2.8] as const;
export const HOLD_SECONDS_RANGE = [0.8, 1.0] as const;
export const CYCLE_MAX_SECONDS = 18;

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
  // Index of the step of the chain (lib/chain.ts) this scene plays
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
      { id: "rooms", at: 0.45, dur: 0.25 },
      { id: "funnel", at: 1.325, dur: 0.175 },
    ],
    settle: 1.5,
    hold: 0.9,
    token: { at: 0.45, dur: 0.25 },
  },
  {
    id: "s1",
    step: 1,
    products: ["tuner"],
    // Ludic pilot: the gestures need room for a spring, so the actions are longer and the reading pauses shorter; the
    // scene keeps the 2x length (call: the call rises and its waveform grows; ask: Marina types, the bubble springs on
    // her phone and flies into the inbox; merge: the two channels join, the pill pops and the Tuner logo swells)
    actions: [
      { id: "call", at: 0.45, dur: 0.3 },
      { id: "ask", at: 0.8, dur: 0.45 },
      { id: "merge", at: 1.3, dur: 0.375 },
    ],
    settle: 1.675,
    hold: 0.9,
    token: { at: 1.3, dur: 0.375 },
  },
  {
    id: "s2",
    step: 2,
    products: ["relloo"],
    // Ludic pilot: the card springs into Novo and the counter rolls; the facts rise one after the other while the emblems
    // of the card pop; the card travels to Em análise lifted and tilted, and both counters roll
    actions: [
      { id: "born", at: 0.45, dur: 0.3 },
      { id: "facts", at: 0.8, dur: 0.45 },
      { id: "review", at: 1.3, dur: 0.375 },
    ],
    settle: 1.675,
    hold: 0.9,
    token: { at: 1.3, dur: 0.375 },
  },
  {
    id: "s3",
    step: 3,
    products: ["domus"],
    // The rooms light up, then the card takes what they hand over
    actions: [
      { id: "handoff", at: 0.475, dur: 0.225 },
      { id: "card", at: 1.25, dur: 0.25 },
    ],
    settle: 1.5,
    hold: 0.9,
    token: { at: 0.475, dur: 0.225 },
  },
  {
    id: "s4",
    step: 4,
    products: ["knowly"],
    actions: [
      { id: "doc", at: 0.45, dur: 0.125 },
      { id: "hit", at: 0.925, dur: 0.15 },
      { id: "answer", at: 1.425, dur: 0.2 },
    ],
    settle: 1.625,
    hold: 0.9,
    token: { at: 1.425, dur: 0.2 },
  },
  {
    id: "s5",
    step: 5,
    products: ["magneto"],
    actions: [
      { id: "rule", at: 0.45, dur: 0.175 },
      { id: "approve", at: 1.025, dur: 0.15 },
      { id: "finish", at: 1.5, dur: 0.2 },
    ],
    settle: 1.7,
    hold: 0.9,
    token: { at: 0.45, dur: 0.175 },
  },
  {
    id: "s6",
    step: 6,
    products: ["domus", "tuner"],
    actions: [
      { id: "home", at: 0.45, dur: 0.175 },
      { id: "toast", at: 0.925, dur: 0.175 },
      { id: "received", at: 1.425, dur: 0.125 },
    ],
    settle: 1.55,
    // The last scene stays longest, with the whole map at rest before the loop
    hold: 1.0,
    token: { at: 0.45, dur: 0.175 },
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

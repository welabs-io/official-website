// TIPOS DAS CENAS NATIVAS
// Shared by the scene components (components/scenes), the script (lib/scenes/script.ts) and the stage. A scene is a
// product screen drawn in HTML and CSS; its motion is a list of named actions the script times.
import type { CSSProperties } from "react";

export type SceneId = "s0" | "s1" | "s2" | "s3" | "s4" | "s5" | "s6";

export const SCENE_IDS: readonly SceneId[] = [
  "s0",
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
];

// Props that tie an element to an action of the script: `data-act` names it, `--at`/`--d` carry the time of the action
// (and of each item of a staggered one) so CSS animates with the numbers of the script, never with numbers of its own.
export type ActProps = {
  "data-act": string;
  "data-fx": string;
  style: CSSProperties;
};

// `act(id, fx, options)` builds the props; `index` and `count` stagger the items of one action, `offset` delays an item
// inside it (seconds)
export type Act = (
  id: string,
  fx: Fx,
  options?: {
    index?: number;
    count?: number;
    offset?: number;
    // Length of one item, when it must be shorter than the rest of the action
    length?: number;
  },
) => ActProps;

// Entrance kinds (components/scenes/fx.css defines each one). All of them animate FROM a state to the natural one, so
// the settled frame is plain CSS with no animation.
export type Fx =
  // fade and rise
  | "in"
  // scale from 0.9 with a fade
  | "pop"
  // clip reveal from the left
  | "wipe"
  // fade out (the element is visible at the start and gone at the end)
  | "out"
  // colour change to the lit state
  | "light"
  // slide down by --dy
  | "drop"
  // dots that appear, stay and vanish
  | "blink";

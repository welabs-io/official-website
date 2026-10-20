// TIPOS DAS CENAS NATIVAS
// Shared by the scene components (components/scenes), the script (lib/scenes/script.ts) and the stage. A scene is a
// product screen drawn in HTML and CSS; its motion is a list of named actions the script times.
import type { CSSProperties } from "react";

// The outcomes of the story the home shows (the call and the message as one person, the answer with its source, the
// order back confirmed); the ids are those of the scenes of the former chain, kept so the frames stay comparable
export type SceneId = "s1" | "s4" | "s6";

export const SCENE_IDS: readonly SceneId[] = ["s1", "s4", "s6"];

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
  // fade and rise, with a small overshoot (same keyframes as "rise" since the ludic pass)
  | "in"
  // born with a spring, its glyph drawing itself after (same keyframes as "spring" since the ludic pass)
  | "pop"
  // clip reveal from the left
  | "wipe"
  // fade out (the element is visible at the start and gone at the end)
  | "out"
  // colour change to the lit state
  | "light"
  // travel down from --dy, lifted and tilted on the way (same keyframes as "lift" since the ludic pass)
  | "drop"
  // dots that appear, stay and vanish
  | "blink"
  // Component motion of the ludic pilot (S1 and S2; see components/scenes/fx.css, "MOVIMENTO DE COMPONENTE"):
  // born with a spring (scale from 0.6, overshoot, settle) about --origin
  | "spring"
  // rise 10 px with a small overshoot
  | "rise"
  // grow from the bottom (a bar of the waveform), with overshoot
  | "grow"
  // fly in from --fx/--fy (another component of the screen) and land
  | "fly"
  // travel from --dy lanes above, lifted and tilted on the way, and land with a bounce
  | "lift"
  // receive: a short swell of the element and a ring that leaves it
  | "pulse"
  // a column of digits rolls one row up (a counter that counts)
  | "roll";

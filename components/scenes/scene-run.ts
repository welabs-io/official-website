// EXECUÇÃO DAS CENAS NO NAVEGADOR
// Loaded on demand by SceneDriver. The whole runner is a timer over the scene durations the server wrote next to the
// stage (lib/scenes/script.ts: settle + hold). On every boundary it moves the tiles to their new places (`data-pos`),
// writes the phase of each scene (`play` for the centre, `start` for the ones that come next, `end` for the ones behind)
// and lights the short name of the scene on screen (the capability stage of a product page). The animations themselves
// are CSS (components/scenes/fx.css) and nothing here reads layout. `pause` stops the timer and freezes the CSS
// animations (`data-run="paused"`); `resume` continues from the same instant; `destroy` puts the stage back on its
// settled first scene.
import { placeOf, ringPosition } from "@/components/ring/positions";
import { turn } from "@/components/ring/turn";

type SceneData = {
  version: number;
  cycle: number;
  // Seconds the rotation of a swap takes (the script's SWAP_SECONDS)
  swap: number;
  scenes: number[];
};

export function run(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-ring]");
  const source = root.querySelector("script[data-scene-data]")?.textContent;
  const noop = { pause() {}, resume() {}, destroy() {} };
  if (!stage || !source) return noop;
  const data = JSON.parse(source) as SceneData;
  // The stage element, kept as a plain const so the closures below see it as non-null
  const arena: HTMLElement = stage;
  const tiles = [...stage.children] as HTMLElement[];
  const scenes = tiles.map((tile) => tile.querySelector<HTMLElement>(".scn"));
  const count = tiles.length;

  // The short names of the scenes under the stage, the one on screen lit
  const names = [...root.querySelectorAll<HTMLElement>("[data-cap]")];
  const label = (active: number) => {
    names.forEach((name, i) => {
      name.dataset.on = i === active ? "true" : "false";
    });
  };

  // Places and phases for the scene `active` at the centre. A scene ahead waits on its first frame, one behind keeps its
  // settled frame, so a neighbour is always a scene standing still.
  const show = (active: number) => {
    label(active);
    tiles.forEach((tile, i) => {
      const position = ringPosition(i, active, count);
      tile.dataset.pos = String(placeOf(position));
      if (position === 0) tile.removeAttribute("aria-hidden");
      else tile.setAttribute("aria-hidden", "true");
      const scene = scenes[i];
      if (scene)
        scene.dataset.phase =
          position === 0 ? "play" : position > 0 ? "start" : "end";
    });
  };

  // Replays the only scene: first frame, a forced style flush so the animations restart, then play
  const restart = () => {
    const scene = scenes[0];
    if (!scene) return;
    scene.dataset.phase = "start";
    scene.getBoundingClientRect();
    scene.dataset.phase = "play";
  };

  let active = 0;
  let started = false;
  let paused = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Instant the current scene ends (performance.now), and what was left of it when paused
  let due = 0;
  let left = 0;

  const schedule = (ms: number) => {
    clearTimeout(timer);
    due = performance.now() + ms;
    timer = setTimeout(next, ms);
  };
  function next() {
    // Count from the planned boundary, not from now, so the cycle does not drift with the timer's lateness
    const planned = due;
    active = (active + 1) % count;
    root.style.setProperty("--swap-time", `${data.swap}s`);
    // A stage of one scene has nothing to swap to: the scene goes back to its first frame and plays again
    if (count === 1) restart();
    else {
      show(active);
      // Starts the arc (lift in, dip out) of the rotation
      turn(arena);
    }
    clearTimeout(timer);
    due = planned + data.scenes[active] * 1000;
    timer = setTimeout(next, Math.max(0, due - performance.now()));
  }

  return {
    resume() {
      delete root.dataset.run;
      if (!started) {
        started = true;
        // The first scene starts from its first frame
        show(0);
        schedule(data.scenes[0] * 1000);
        return;
      }
      // Only a paused runner reschedules (a running one is left alone), and it always does: a timer that was late past
      // its deadline leaves nothing (left = 0), and the loop must still go on, with the swap due right now
      if (paused) {
        paused = false;
        schedule(left);
        left = 0;
      }
    },
    pause() {
      if (!started || paused) return;
      paused = true;
      root.dataset.run = "paused";
      clearTimeout(timer);
      left = Math.max(0, due - performance.now());
    },
    destroy() {
      clearTimeout(timer);
      delete root.dataset.run;
      active = 0;
      label(0);
      delete arena.dataset.turn;
      tiles.forEach((tile, i) => {
        const position = ringPosition(i, 0, count);
        tile.dataset.pos = String(placeOf(position));
        if (position === 0) tile.removeAttribute("aria-hidden");
        else tile.setAttribute("aria-hidden", "true");
        const scene = scenes[i];
        if (scene) scene.dataset.phase = "end";
      });
    },
  };
}

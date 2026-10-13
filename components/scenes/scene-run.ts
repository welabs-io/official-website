// EXECUÇÃO DAS CENAS NO NAVEGADOR
// Loaded on demand by SceneDriver. The whole runner is a timer over the scene durations the server wrote next to the
// stage (lib/scenes/script.ts: settle + hold). On every boundary it moves the tiles to their new places (`data-pos`),
// writes the phase of each scene (`play` for the centre, `start` for the ones that come next, `end` for the ones behind),
// flips the pulse of the thread and tells the overview with the `ring:swap` event. The animations themselves are CSS
// (components/scenes/fx.css) and nothing here reads layout. `pause` stops the timer and freezes the CSS animations
// (`data-run="paused"`); `resume` continues from the same instant; `destroy` puts the stage back on its settled first
// scene.
import { follow } from "@/components/ring/overview-follow";
import { placeOf, ringPosition } from "@/components/ring/positions";

// `steps` maps each scene of the stage to the step of the chain it plays (identity on the home; a product page plays a
// subset, so the overview must be told the step, not the position)
type SceneData = {
  version: number;
  cycle: number;
  scenes: number[];
  steps?: number[];
};

export function run(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-ring]");
  const source = root.querySelector("script[data-scene-data]")?.textContent;
  const noop = { pause() {}, resume() {}, destroy() {} };
  if (!stage || !source) return noop;
  const data = JSON.parse(source) as SceneData;
  const tiles = [...stage.children] as HTMLElement[];
  const scenes = tiles.map((tile) => tile.querySelector<HTMLElement>(".scn"));
  const count = tiles.length;

  // The block above (the overview) follows this stage through the swap event; it has no clock of its own
  const stepOf = (scene: number) => data.steps?.[scene] ?? scene;
  const overview = follow(root.id, root.closest("section"), stepOf(0));
  const rail = root
    .closest("section")
    ?.querySelector<HTMLElement>(":scope > [data-rail]");
  const flipRail = () => {
    if (rail) rail.dataset.pulse = rail.dataset.pulse === "a" ? "b" : "a";
  };

  // Places and phases for the scene `active` at the centre. A scene ahead waits on its first frame, one behind keeps its
  // settled frame, so a neighbour is always a scene standing still.
  const show = (active: number) => {
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
    const from = active;
    active = (active + 1) % count;
    root.style.setProperty("--swap-time", "0.4s");
    // A stage of one scene has nothing to swap to: the scene goes back to its first frame and plays again
    if (count === 1) restart();
    else show(active);
    flipRail();
    window.dispatchEvent(
      new CustomEvent("ring:swap", {
        detail: {
          ring: root.id,
          from,
          to: active,
          index: stepOf(active),
        },
      }),
    );
    clearTimeout(timer);
    due = planned + data.scenes[active] * 1000;
    timer = setTimeout(next, Math.max(0, due - performance.now()));
  }

  return {
    resume() {
      delete root.dataset.run;
      if (!started) {
        started = true;
        // The first scene starts from its first frame; the overview plays the token of step 0
        show(0);
        overview.begin();
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
      overview();
      active = 0;
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

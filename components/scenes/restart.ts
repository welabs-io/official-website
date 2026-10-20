// REINÍCIO DE UMA CENA
// v2.2 (audit A01, A02, A03, M04): the one way to put a scene back on its first frame. `start` and `play` share the same
// animation names (fx.css), so going from one to the other never restarts a CSS animation that already finished: the
// Magneto and Tuner openings, the outcomes of the home, the Domus opening and the Relloo from its 2nd cycle played once
// and froze (measured on 5fc85df: 0 content animations running in the 2nd and 3rd cycles). Passing through `end` (no
// animation names at all) with a style flush in between drops the old animations, so the next phase creates new ones.
export type ScenePhase = "start" | "play";

export function restartScene(scene: HTMLElement, phase: ScenePhase = "play") {
  scene.dataset.phase = "end";
  // getAnimations flushes pending style first, which drops the CSS animations of the scene (no name under `end`); any
  // script animation left is cancelled too, so the new phase always starts from zero
  scene.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  scene.dataset.phase = phase;
}

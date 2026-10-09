// CONTROLADOR ÚNICO DA PÁGINA
// One controller per page, created on the first client call. prefers-reduced-motion is read once: with it the
// controller never mounts a player and every stage keeps its cover frame. There is no stored user choice.
import { MotionController } from "./motion-controller";

let controller: MotionController | null = null;

export function getController(): MotionController {
  if (controller) return controller;
  controller = new MotionController({
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  });
  document.addEventListener("visibilitychange", () =>
    controller?.setPageHidden(document.hidden),
  );
  return controller;
}

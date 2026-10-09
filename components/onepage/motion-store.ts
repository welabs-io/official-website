// ESTADO GLOBAL DE MOTION DA PÁGINA /new
// One controller per page, created on the first client call. The pause choice persists in localStorage; without a
// stored choice the page starts paused under prefers-reduced-motion and playing otherwise. Server snapshot is
// "paused", so the first paint never runs an animation.
import { MotionController } from "./motion-controller";

const KEY = "welabs-new-motion";
let controller: MotionController | null = null;
const listeners = new Set<() => void>();

function stored(): "paused" | "playing" | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "paused" || value === "playing" ? value : null;
  } catch {
    return null;
  }
}

export function getController(): MotionController {
  if (controller) return controller;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const choice = stored();
  controller = new MotionController({
    reducedMotion: choice ? choice === "paused" : reduced,
  });
  controller.subscribe(() => listeners.forEach((l) => l()));
  document.addEventListener("visibilitychange", () =>
    controller?.setPageHidden(document.hidden),
  );
  return controller;
}

// useSyncExternalStore contract
export function subscribePaused(listener: () => void) {
  listeners.add(listener);
  // First subscriber on the client creates the controller and publishes the real state
  const first = !controller;
  getController();
  if (first) queueMicrotask(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const getPausedSnapshot = () => getController().isPaused;
export const getPausedServerSnapshot = () => true;

export function setMotionPaused(paused: boolean) {
  getController().setPaused(paused);
  try {
    window.localStorage.setItem(KEY, paused ? "paused" : "playing");
  } catch {
    /* storage unavailable: the choice lasts for this visit only */
  }
}

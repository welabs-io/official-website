// TESTES DO CONTROLADOR DE MOTION
import { describe, expect, it } from "vitest";
import {
  MotionController,
  type MotionSlot,
  type ObserverFactory,
} from "./motion-controller";

// Fake IntersectionObserver: the test pushes ratios by hand
function harness(options: { reducedMotion?: boolean; maxLive?: number } = {}) {
  let callback: Parameters<ObserverFactory>[0] = () => {};
  const factory: ObserverFactory = (cb) => {
    callback = cb;
    return { observe() {}, unobserve() {}, disconnect() {} };
  };
  const controller = new MotionController({
    ...options,
    observerFactory: factory,
  });
  const log: string[] = [];
  const slot = (id: string): MotionSlot => ({
    id,
    element: { id } as unknown as Element,
    mount: () => log.push(`mount:${id}`),
    unmount: () => log.push(`unmount:${id}`),
    play: () => log.push(`play:${id}`),
    pause: () => log.push(`pause:${id}`),
  });
  const see = (slots: MotionSlot[], ratios: Record<string, number>) =>
    callback(
      slots.map((s) => ({
        target: s.element,
        intersectionRatio: ratios[s.id] ?? 0,
        isIntersecting: (ratios[s.id] ?? 0) > 0,
      })),
    );
  return { controller, log, slot, see };
}

describe("MotionController", () => {
  it("mounts and plays a slot once it is visible enough", () => {
    const { controller, log, slot, see } = harness();
    const a = slot("a");
    controller.register(a);
    see([a], { a: 0.05 });
    expect(controller.liveIds).toEqual([]);
    see([a], { a: 0.4 });
    expect(controller.liveIds).toEqual(["a"]);
    expect(log).toEqual(["mount:a", "play:a"]);
  });

  it("pauses and then unmounts a slot that leaves the screen", () => {
    const { controller, log, slot, see } = harness();
    const a = slot("a");
    controller.register(a);
    see([a], { a: 1 });
    log.length = 0;
    see([a], { a: 0 });
    expect(log).toEqual(["pause:a", "unmount:a"]);
    expect(controller.liveIds).toEqual([]);
  });

  it("never keeps more than 2 players live, the most visible first", () => {
    const { controller, slot, see } = harness();
    const slots = ["a", "b", "c", "d"].map(slot);
    slots.forEach((s) => controller.register(s));
    see(slots, { a: 0.3, b: 0.9, c: 0.6, d: 0.2 });
    expect(controller.liveIds).toEqual(["b", "c"]);
    // c scrolls out, b stays, the next most visible takes its place
    see(slots, { a: 0.3, b: 0.9, c: 0, d: 0.5 });
    expect(controller.liveIds).toEqual(["b", "d"]);
    expect(controller.liveIds.length).toBeLessThanOrEqual(2);
  });

  it("under reduced motion nothing is ever mounted: cover frames only, no control", () => {
    const { controller, log, slot, see } = harness({ reducedMotion: true });
    const a = slot("a");
    controller.register(a);
    see([a], { a: 1 });
    expect(controller.reducedMotion).toBe(true);
    expect(controller.liveIds).toEqual([]);
    expect(log).toEqual([]);
    // The controller exposes no way to resume
    expect("setPaused" in controller).toBe(false);
  });

  it("releases everything while the tab is hidden and restores it after", () => {
    const { controller, slot, see } = harness();
    const a = slot("a");
    controller.register(a);
    see([a], { a: 1 });
    controller.setPageHidden(true);
    expect(controller.liveIds).toEqual([]);
    controller.setPageHidden(false);
    expect(controller.liveIds).toEqual(["a"]);
  });

  it("unregister pauses and unmounts a live slot", () => {
    const { controller, log, slot, see } = harness();
    const a = slot("a");
    const off = controller.register(a);
    see([a], { a: 1 });
    log.length = 0;
    off();
    expect(log).toEqual(["pause:a", "unmount:a"]);
  });
});

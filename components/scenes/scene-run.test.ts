// TESTES DO RUNNER DAS CENAS
// The runner is a timer over the scene durations. These tests drive it with fake timers and a minimal DOM stub: the loop
// must go on after a pause (also when the timer ran late past its deadline, as a hidden tab makes it), pause must freeze
// the scene and resume must continue from the same instant.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "./scene-run";

const SCENES = [1, 2, 3, 4, 5, 6, 7]; // seconds

function stage() {
  const tiles = SCENES.map(() => {
    const scn = { dataset: {} as Record<string, string> };
    return {
      dataset: {} as Record<string, string>,
      removeAttribute: () => {},
      setAttribute: () => {},
      querySelector: () => scn,
      scn,
    };
  });
  const root = {
    id: "chain-ring",
    dataset: {} as Record<string, string>,
    style: { setProperty: () => {} },
    closest: () => null,
    querySelector: (sel: string) =>
      sel === "[data-ring]"
        ? { children: tiles }
        : sel.startsWith("script")
          ? { textContent: JSON.stringify({ scenes: SCENES, cycle: 28 }) }
          : null,
  };
  return { root, tiles };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const centre = (tiles: ReturnType<typeof stage>["tiles"]) =>
  tiles.findIndex((t) => t.dataset.pos === "0");

describe("scene runner", () => {
  it("advances scene by scene with the durations of the script", () => {
    const { root, tiles } = stage();
    const runner = run(root as unknown as HTMLElement);
    runner.resume();
    expect(centre(tiles)).toBe(0);
    vi.advanceTimersByTime(999);
    expect(centre(tiles)).toBe(0);
    vi.advanceTimersByTime(2);
    expect(centre(tiles)).toBe(1);
    vi.advanceTimersByTime(2000);
    expect(centre(tiles)).toBe(2);
  });

  it("pause freezes the scene and resume continues with what was left", () => {
    const { root, tiles } = stage();
    const runner = run(root as unknown as HTMLElement);
    runner.resume();
    vi.advanceTimersByTime(600);
    runner.pause();
    expect(root.dataset.run).toBe("paused");
    vi.advanceTimersByTime(60000);
    expect(centre(tiles)).toBe(0);
    runner.resume();
    expect(root.dataset.run).toBeUndefined();
    vi.advanceTimersByTime(399);
    expect(centre(tiles)).toBe(0);
    vi.advanceTimersByTime(2);
    expect(centre(tiles)).toBe(1);
  });

  it("the loop goes on when the timer was late past its deadline before the pause (hidden tab, then back)", () => {
    const { root, tiles } = stage();
    const runner = run(root as unknown as HTMLElement);
    runner.resume();
    // The tab is hidden: the clock moves 30 s but the throttled timer has not fired yet
    const now = performance.now.bind(performance);
    vi.spyOn(performance, "now").mockImplementation(() => now() + 30000);
    runner.pause();
    vi.restoreAllMocks();
    // The tab comes back
    runner.resume();
    vi.advanceTimersByTime(5);
    expect(centre(tiles)).toBe(1);
    // And it keeps looping afterwards, on the planned durations
    vi.advanceTimersByTime(2100);
    expect(centre(tiles)).toBe(2);
    vi.advanceTimersByTime(3000 + 4000 + 5000 + 6000 + 7000);
    expect(centre(tiles)).toBe(0);
  });

  it("a running runner is not rescheduled by a second resume", () => {
    const { root, tiles } = stage();
    const runner = run(root as unknown as HTMLElement);
    runner.resume();
    vi.advanceTimersByTime(500);
    runner.resume();
    vi.advanceTimersByTime(501);
    expect(centre(tiles)).toBe(1);
  });
});

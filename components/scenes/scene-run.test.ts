// TESTES DO RUNNER DAS CENAS
// The runner is a timer over the scene durations. These tests drive it with fake timers and a minimal DOM stub: the loop
// must go on after a pause (also when the timer ran late past its deadline, as a hidden tab makes it), pause must freeze
// the scene and resume must continue from the same instant; the name of the scene on screen is lit, and a stage of one
// scene replays it.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "./scene-run";

const SCENES = [1, 2, 3, 4, 5, 6, 7]; // seconds

function stage(
  seconds = SCENES,
  names: { dataset: Record<string, string> }[] = [],
) {
  const phases: string[] = [];
  const tiles = seconds.map(() => {
    const scn = {
      dataset: {
        set phase(v: string) {
          phases.push(v);
        },
      } as unknown as Record<string, string>,
      getBoundingClientRect: () => ({}),
      getAnimations: () => [],
    };
    return {
      dataset: {} as Record<string, string>,
      removeAttribute: () => {},
      setAttribute: () => {},
      querySelector: () => scn,
      scn,
    };
  });
  const ring = { children: tiles, dataset: {} as Record<string, string> };
  const props: Record<string, string> = {};
  const root = {
    id: "product-scenes",
    dataset: {} as Record<string, string>,
    style: {
      setProperty: (name: string, value: string) => {
        props[name] = value;
      },
    },
    querySelectorAll: (sel: string) => (sel === "[data-cap]" ? names : []),
    querySelector: (sel: string) =>
      sel === "[data-ring]"
        ? ring
        : sel.startsWith("script")
          ? {
              textContent: JSON.stringify({
                scenes: seconds,
                cycle: 28,
                swap: 0.7,
              }),
            }
          : null,
  };
  return { root, tiles, ring, props, phases };
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
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

  it("every swap sets the rotation time of the script and restarts the arc", () => {
    const { root, ring, props } = stage();
    const runner = run(root as unknown as HTMLElement);
    runner.resume();
    expect(ring.dataset.turn).toBeUndefined();
    vi.advanceTimersByTime(1001);
    expect(props["--swap-time"]).toBe("0.7s");
    expect(ring.dataset.turn).toBe("a");
    vi.advanceTimersByTime(2000);
    expect(ring.dataset.turn).toBe("b");
    runner.destroy();
    expect(ring.dataset.turn).toBeUndefined();
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

describe("scene runner on the capability stage", () => {
  it("lights the short name of the scene on screen and puts the first one back on destroy", () => {
    const names = [0, 1, 2].map(() => ({
      dataset: {} as Record<string, string>,
    }));
    const { root } = stage([2, 2, 2], names);
    const runner = run(root as unknown as HTMLElement);
    runner.resume();
    expect(names.map((n) => n.dataset.on)).toEqual(["true", "false", "false"]);
    vi.advanceTimersByTime(2001);
    expect(names.map((n) => n.dataset.on)).toEqual(["false", "true", "false"]);
    vi.advanceTimersByTime(4000);
    expect(names.map((n) => n.dataset.on)).toEqual(["true", "false", "false"]);
    vi.advanceTimersByTime(2000);
    runner.destroy();
    expect(names.map((n) => n.dataset.on)).toEqual(["true", "false", "false"]);
  });

  it("a stage of one scene replays it at every boundary", () => {
    const { root, phases } = stage([2]);
    const runner = run(root as unknown as HTMLElement);
    runner.resume();
    phases.length = 0;
    vi.advanceTimersByTime(2001);
    // v2.2: through the settled frame (no animation names, so the old ones are dropped), then play again from zero
    expect(phases).toEqual(["end", "play"]);
  });
});

// TESTES DA LINHA DO TEMPO DA CENA
// The continuity contract as unit tests of the clock: step order, loop reset, human take and give-back, idle give-back,
// pause when disconnected and the static final frame of reduced motion.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  HUMAN_IDLE,
  LOOP_HOLD,
  SceneTimeline,
  sceneView,
  stepDurations,
  type SceneStep,
} from "./timeline";

const STEPS: SceneStep[] = [
  { id: "a", hold: 500 },
  { id: "b", hold: 500 },
  { id: "c" },
];

// Runs a connected timeline and records every id it shows
const run = (steps = STEPS) => {
  const t = new SceneTimeline(steps);
  const seen: string[] = [];
  const stop = t.connect(() => seen.push(t.getSnapshot().id));
  return { t, seen, stop };
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("step durations", () => {
  it("reads hold, then the next at, then the defaults (the last step holds the loop hold)", () => {
    expect(
      stepDurations([
        { id: "a", at: 0 },
        { id: "b", at: 700, hold: 300 },
        { id: "c", at: 1200 },
      ]),
    ).toEqual([700, 300, LOOP_HOLD]);
  });
});

describe("autoplay", () => {
  it("walks the steps in order and loops back to the first after the last one's hold", () => {
    const { t, seen } = run();
    expect(t.getSnapshot()).toMatchObject({ id: "a", mode: "auto", cycle: 0 });
    vi.advanceTimersByTime(500);
    vi.advanceTimersByTime(500);
    expect(t.getSnapshot()).toMatchObject({ id: "c", last: true });
    vi.advanceTimersByTime(LOOP_HOLD - 1);
    expect(t.getSnapshot().id).toBe("c");
    vi.advanceTimersByTime(1);
    expect(t.getSnapshot()).toMatchObject({ id: "a", cycle: 1, mode: "auto" });
    vi.advanceTimersByTime(1000);
    expect(seen).toEqual(["b", "c", "a", "b", "c"]);
  });

  it("runs no timer while disconnected (off-screen) and resumes where it stopped", () => {
    const { t, stop } = run();
    vi.advanceTimersByTime(500);
    stop();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(10_000);
    expect(t.getSnapshot().id).toBe("b");
    t.connect(() => {});
    vi.advanceTimersByTime(500);
    expect(t.getSnapshot().id).toBe("c");
  });
});

describe("human take", () => {
  it("jumps to the taken step, plays to the end, holds about 1 s, resets and resumes autoplay", () => {
    const { t } = run();
    t.take("b");
    expect(t.getSnapshot()).toMatchObject({ id: "b", mode: "human" });
    vi.advanceTimersByTime(500);
    expect(t.getSnapshot()).toMatchObject({ id: "c", mode: "human" });
    vi.advanceTimersByTime(LOOP_HOLD);
    expect(t.getSnapshot()).toMatchObject({ id: "a", mode: "auto", cycle: 1 });
    vi.advanceTimersByTime(500);
    expect(t.getSnapshot().id).toBe("b");
  });

  it("a gate waits for the human, and 8 s idle gives the scene back", () => {
    const { t } = run([
      { id: "a", hold: 300 },
      { id: "ask", gate: true, hold: 300 },
      { id: "end" },
    ]);
    t.take("ask");
    vi.advanceTimersByTime(HUMAN_IDLE - 1);
    expect(t.getSnapshot()).toMatchObject({ id: "ask", mode: "human" });
    vi.advanceTimersByTime(1);
    expect(t.getSnapshot()).toMatchObject({ id: "a", mode: "auto", cycle: 1 });
  });

  it("each new gesture re-arms the idle timer", () => {
    const { t } = run([
      { id: "a", hold: 300 },
      { id: "ask", gate: true },
      { id: "end" },
    ]);
    t.take("ask");
    vi.advanceTimersByTime(HUMAN_IDLE - 100);
    t.take("ask");
    vi.advanceTimersByTime(HUMAN_IDLE - 100);
    expect(t.getSnapshot()).toMatchObject({ id: "ask", mode: "human" });
  });
});

describe("reduced motion", () => {
  it("shows the last step, static: no clock runs", () => {
    const t = new SceneTimeline(STEPS);
    expect(sceneView(t, true)).toMatchObject({ id: "c", last: true });
    expect(vi.getTimerCount()).toBe(0);
    expect(sceneView(t, false).id).toBe("a");
  });
});

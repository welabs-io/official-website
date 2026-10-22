// LINHA DO TEMPO DA CENA
// The continuity contract of the site (.claude/skills/welabs-site-motion), owned here and nowhere else. A scene is a
// declarative list of steps; this clock walks them: it autoplays while connected, loops (the last step holds about a
// second, then the first step comes back), hands the wheel to a human on `take()` and takes it back once the human
// sequence is over or the human went idle for 8 s. Disconnecting (off-screen, reduced motion) clears every timer, so a
// scene out of view runs nothing. Framework-free on purpose: React reads it through useSyncExternalStore (Scene.tsx)
// and vitest drives it with fake timers (timeline.test.ts).

export type SceneStep = {
  // Stable name of the step; the scene renders from it
  id: string;
  // Start of the step, in ms from the start of the loop (the next step's `at` closes this one)
  at?: number;
  // How long the step stays on screen, in ms (wins over `at`)
  hold?: number;
  // Under a human take the clock stops here and waits for the next gesture (or the 8 s idle)
  gate?: boolean;
};

export type SceneMode = "auto" | "human";

export type SceneSnapshot = {
  index: number;
  id: string;
  mode: SceneMode;
  // Increments on every reset to the first step, so a scene can key what must replay from scratch
  cycle: number;
  last: boolean;
};

// Default length of a step with neither `hold` nor a next `at`
export const STEP_HOLD = 900;
// The hold of the last step before the reset (contract: about 1 s)
export const LOOP_HOLD = 1000;
// A human who stops driving gives the scene back after this long
export const HUMAN_IDLE = 8000;

// The time each step stays on screen, from `hold`, then the next `at`, then the defaults
export function stepDurations(steps: readonly SceneStep[]): number[] {
  return steps.map((step, i) => {
    if (step.hold !== undefined) return step.hold;
    const next = steps[i + 1];
    if (next?.at !== undefined && step.at !== undefined)
      return Math.max(0, next.at - step.at);
    return i === steps.length - 1 ? LOOP_HOLD : STEP_HOLD;
  });
}

// What a scene shows: the settled last step under reduced motion (static, no clock), the live step otherwise
export const sceneView = (timeline: SceneTimeline, reduced: boolean) =>
  reduced ? timeline.getFinalSnapshot() : timeline.getSnapshot();

export class SceneTimeline {
  readonly steps: readonly SceneStep[];
  private readonly durations: number[];
  private index = 0;
  private mode: SceneMode = "auto";
  private cycle = 0;
  private snapshot: SceneSnapshot;
  private readonly finalSnapshot: SceneSnapshot;
  private readonly listeners = new Set<() => void>();
  private stepTimer: ReturnType<typeof setTimeout> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(steps: readonly SceneStep[]) {
    if (steps.length === 0) throw new Error("A scene needs at least one step");
    this.steps = steps;
    this.durations = stepDurations(steps);
    this.snapshot = this.read();
    const lastIndex = steps.length - 1;
    this.finalSnapshot = {
      index: lastIndex,
      id: steps[lastIndex].id,
      mode: "auto",
      cycle: 0,
      last: true,
    };
  }

  // Index of a step by id (-1 when unknown)
  indexOf = (id: string) => this.steps.findIndex((s) => s.id === id);

  getSnapshot = (): SceneSnapshot => this.snapshot;

  // The settled frame: what the server draws and what reduced motion keeps
  getFinalSnapshot = (): SceneSnapshot => this.finalSnapshot;

  get connected() {
    return this.listeners.size > 0;
  }

  // Starts the clock for a listener; the returned function stops it (no timer survives the last disconnect)
  connect = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) {
      this.schedule();
      if (this.mode === "human") this.armIdle();
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.clearTimers();
    };
  };

  // A human event: autoplay pauses, the scene jumps to `id` (default: the first step) and plays from there
  take = (id?: string) => {
    const at = id === undefined ? 0 : this.indexOf(id);
    this.mode = "human";
    this.index = at < 0 ? 0 : at;
    this.commit();
    if (this.connected) {
      this.schedule();
      this.armIdle();
    }
  };

  // Back to the first step under autoplay (the lab's replay)
  restart = () => {
    this.reset();
    if (this.connected) this.schedule();
  };

  private read(): SceneSnapshot {
    return {
      index: this.index,
      id: this.steps[this.index].id,
      mode: this.mode,
      cycle: this.cycle,
      last: this.index === this.steps.length - 1,
    };
  }

  private commit() {
    this.snapshot = this.read();
    for (const listener of this.listeners) listener();
  }

  private reset() {
    this.index = 0;
    this.mode = "auto";
    this.cycle += 1;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = null;
    this.commit();
  }

  private schedule() {
    if (this.stepTimer) clearTimeout(this.stepTimer);
    this.stepTimer = null;
    const step = this.steps[this.index];
    // A gate under a human take waits for the next gesture; the idle timer is the way out
    if (this.mode === "human" && step.gate) return;
    this.stepTimer = setTimeout(this.advance, this.durations[this.index]);
  }

  private advance = () => {
    this.stepTimer = null;
    if (this.index < this.steps.length - 1) {
      this.index += 1;
      this.commit();
    } else {
      // The last step held its time: loop (autoplay) or give the scene back (human sequence complete)
      this.reset();
    }
    if (this.connected) this.schedule();
  };

  private armIdle() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.idleTimer = null;
      if (this.mode !== "human") return;
      this.reset();
      if (this.connected) this.schedule();
    }, HUMAN_IDLE);
  }

  private clearTimers() {
    if (this.stepTimer) clearTimeout(this.stepTimer);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.stepTimer = null;
    this.idleTimer = null;
  }
}

// CONTROLADOR DE MOTION DA PÁGINA /new
// One controller owns every live motion of the one-page preview. A slot is a stage that can mount a player,
// play, pause and unmount it. Rules: a slot is eligible only while at least `visibleRatio` of it is on screen;
// at most `maxLive` eligible slots are mounted at once (the most visible first); a slot that leaves the screen is
// paused and then unmounted; while the page is paused (user choice, or reduced motion until the user opts in)
// or hidden nothing is mounted at all and every stage shows its poster.

export type MotionSlot = {
  id: string;
  element: Element;
  mount: () => void;
  unmount: () => void;
  play: () => void;
  pause: () => void;
};

type ObserverEntry = {
  target: Element;
  intersectionRatio: number;
  isIntersecting: boolean;
};
export type ObserverLike = {
  observe(el: Element): void;
  unobserve(el: Element): void;
  disconnect(): void;
};
export type ObserverFactory = (
  callback: (entries: ObserverEntry[]) => void,
  thresholds: number[],
) => ObserverLike;

export type ControllerOptions = {
  maxLive?: number;
  // Minimum share of the stage on screen for it to run (the khal.ai pattern uses 0.1)
  visibleRatio?: number;
  // Reduced motion starts the page paused: posters only, until the user presses resume
  reducedMotion?: boolean;
  observerFactory?: ObserverFactory;
};

type SlotState = {
  slot: MotionSlot;
  ratio: number;
  order: number;
  mounted: boolean;
  playing: boolean;
};

const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

export class MotionController {
  readonly maxLive: number;
  readonly visibleRatio: number;
  private states = new Map<string, SlotState>();
  private observer: ObserverLike;
  private counter = 0;
  private paused: boolean;
  private hidden = false;
  private listeners = new Set<() => void>();

  constructor(options: ControllerOptions = {}) {
    this.maxLive = options.maxLive ?? 2;
    this.visibleRatio = options.visibleRatio ?? 0.1;
    this.paused = options.reducedMotion ?? false;
    const factory: ObserverFactory =
      options.observerFactory ??
      ((callback, thresholds) =>
        new IntersectionObserver((entries) => callback(entries), {
          threshold: thresholds,
        }));
    this.observer = factory((entries) => this.observe(entries), THRESHOLDS);
  }

  // Slots currently mounted, in registration order
  get liveIds(): string[] {
    return [...this.states.values()]
      .filter((s) => s.mounted)
      .sort((a, b) => a.order - b.order)
      .map((s) => s.slot.id);
  }
  get isPaused() {
    return this.paused;
  }
  isLive(id: string) {
    return this.states.get(id)?.mounted ?? false;
  }

  // Subscribe to state changes (live set or paused flag); returns the unsubscribe function
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  register(slot: MotionSlot) {
    const state: SlotState = {
      slot,
      ratio: 0,
      order: this.counter++,
      mounted: false,
      playing: false,
    };
    this.states.set(slot.id, state);
    this.observer.observe(slot.element);
    return () => {
      this.observer.unobserve(slot.element);
      this.release(state);
      this.states.delete(slot.id);
      this.reconcile();
    };
  }

  setPaused(paused: boolean) {
    if (this.paused === paused) return;
    this.paused = paused;
    this.reconcile();
    this.emit();
  }

  // The tab is hidden: nothing runs, nothing stays mounted
  setPageHidden(hidden: boolean) {
    if (this.hidden === hidden) return;
    this.hidden = hidden;
    this.reconcile();
  }

  destroy() {
    this.observer.disconnect();
    for (const state of this.states.values()) this.release(state);
    this.states.clear();
    this.listeners.clear();
  }

  private observe(entries: ObserverEntry[]) {
    for (const entry of entries) {
      for (const state of this.states.values()) {
        if (state.slot.element === entry.target)
          state.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
      }
    }
    this.reconcile();
  }

  // Pause, then unmount: a stage never keeps a player when it is off screen
  private release(state: SlotState) {
    if (state.playing) {
      state.slot.pause();
      state.playing = false;
    }
    if (state.mounted) {
      state.slot.unmount();
      state.mounted = false;
    }
  }

  private reconcile() {
    const before = this.liveIds.join("|");
    const allowed = new Set<string>();
    if (!this.paused && !this.hidden) {
      [...this.states.values()]
        .filter((s) => s.ratio >= this.visibleRatio)
        // Most visible first; registration order breaks ties
        .sort((a, b) => b.ratio - a.ratio || a.order - b.order)
        .slice(0, this.maxLive)
        .forEach((s) => allowed.add(s.slot.id));
    }
    // Release first so the live count never exceeds the limit mid-update
    for (const state of this.states.values())
      if (!allowed.has(state.slot.id)) this.release(state);
    for (const state of this.states.values()) {
      if (!allowed.has(state.slot.id)) continue;
      if (!state.mounted) {
        state.slot.mount();
        state.mounted = true;
      }
      if (!state.playing) {
        state.slot.play();
        state.playing = true;
      }
    }
    if (before !== this.liveIds.join("|")) this.emit();
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}

// REPRODUÇÃO ENCADEADA DO CARROSSEL
// Plays the segments of every slide back to back with no gap. The next segment already has its player mounted, ready
// and paused on its first frame; a little before the current one ends (the lead) it is started, so it is running when
// the ring brings it to the centre, and the two overlap with a crossfade. Players: the current one, the next one
// (paused, preloaded) and, for about a second, the one that is leaving. In tiles mode (the carousels) nothing else is
// kept: the neighbours are cover images.
import { createPlayer, hideLoader, piece, type PlayerElement } from "./player";
import type { PushTransition, Slide } from "@/lib/motion-slides";

// Duration of the position swap of the ring (keep equal to the CSS transition in ring.module.css)
export const SWAP_SECONDS = 1;
// Crossfade between two segments of the same slide (opening tail into film)
export const BLEND_SECONDS = 0.4;
const FADE_MS = 400;
const TICK_MS = 40;
// Head start of the incoming clip over its push, in seconds (the start latency of a parked player is 20 to 110 ms)
const PUSH_PRE = 0.12;
// Reveal of a preloaded player waits for the seek to its first frame to settle
const SETTLE_MS = 140;
// Covers take over when a composition cannot prepare or its timeline stops advancing.
export const READY_TIMEOUT_MS = 8000;
// A held segment freezes this many real seconds before its range end, so a slow tick can never run into the loop
export const HOLD_EDGE = 0.1;

export type FlatSegment = {
  slide: number;
  id: string;
  range: readonly [number, number];
  // Playback speed; the segment lasts (end - start) / rate on screen
  rate: number;
  // Real seconds before the end of this segment at which the next one is started
  lead: number;
  // Push into the next segment (workbench montage); the lead equals its duration
  transition?: PushTransition;
  // Real seconds the last frame of the range stays still before the push starts (workbench montage; 0 = none)
  hold: number;
};

// SEGMENTOS EM SEQUÊNCIA
// Flat list of every segment of every slide; the lead is the swap time when the next segment belongs to another slide
// and the blend time when it belongs to the same one (never more than 80% of the segment).
export function flatten(
  slides: readonly Slide[],
  swap = SWAP_SECONDS,
  blend = BLEND_SECONDS,
): FlatSegment[] {
  const flat = slides.flatMap((slide, si) =>
    slide.segments.map((segment) => ({
      slide: si,
      id: segment.id,
      range: segment.range,
      rate: segment.rate ?? 1,
      lead: 0,
      transition: segment.transition,
      hold: segment.holdAfter ?? 0,
    })),
  );
  return flat.map((segment, i) => {
    const next = flat[(i + 1) % flat.length];
    // A push transition sets its own lead (the overlap is exactly the push)
    const wanted =
      segment.transition?.duration ??
      (next.slide === segment.slide ? blend : swap);
    const length = (segment.range[1] - segment.range[0]) / segment.rate;
    return { ...segment, lead: Math.min(wanted, length * 0.8) };
  });
}

type Entry = {
  index: number;
  el: PlayerElement;
  wrap: HTMLElement;
  ready: boolean;
  // Parked on its first frame and painted: the only state in which a handoff may bring it in
  settled: boolean;
  started: boolean;
  createdAt: number;
  advancedAt: number;
  lastTime: number;
  waiting?: boolean;
  // performance.now() at which the segment froze on its last frame (hold phase), when it did
  heldAt?: number;
  // The segment has already been the current one: it is finished and must never be started again
  played?: boolean;
};

export type SwapInfo = {
  from: number;
  to: number;
  // The next player was ready before the handoff (no wait)
  prepared: boolean;
  at: number;
  // Segment indexes and real seconds of the swap (the ring rotation in tiles mode)
  fromIndex: number;
  toIndex: number;
  duration: number;
};

export class Playback {
  private entries = new Map<number, Entry>();
  private cursor: number;
  private timer = 0;
  private timeouts = new Set<number>();
  private dead = false;
  private ahead: number;
  private suspendedAt: number | undefined;
  private failed = false;

  constructor(
    private options: {
      flat: readonly FlatSegment[];
      // Layer container of each slide (the tile frame), by slide index
      layers: () => (HTMLElement | null)[];
      start: number;
      onSlide: (slide: number) => void;
      onSwap?: (info: SwapInfo) => void;
      onUnavailable?: (reason: "ready" | "stalled") => void;
      // How many segments ahead keep a ready player (1 by default)
      ahead?: number;
      // Every slide shares one frame (the workbench): a preloaded player stays hidden until its handoff
      single?: boolean;
      // Circular workbench carousel: `layers()` is indexed by segment (one tile per cut); every mounted player is
      // visible in its tile, the leaving cut stays frozen as the previous tile, and the swap is the page rotating the
      // ring on `onSwap` (no push)
      tiles?: boolean;
      // With `tiles`: one tile per slide (the products carousel) instead of one per segment. `layers()` is indexed by
      // slide; the segments of a slide play in the same tile and blend into each other, and a preloaded player of
      // another slide stays hidden (the tile shows its poster) until the rotation brings it in.
      tileBySlide?: boolean;
    },
  ) {
    this.cursor = options.start;
    this.ahead = options.ahead ?? 1;
  }

  private get flat() {
    return this.options.flat;
  }
  private after(index: number) {
    return (index + 1) % this.flat.length;
  }

  start() {
    this.create(this.cursor, true);
    this.preload();
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  // SUSPENSÃO SEM REINICIAR O FILME
  // Keep the active composition and its time when the viewport or tab becomes inactive.
  pause() {
    if (this.dead || this.suspendedAt !== undefined) return;
    this.suspendedAt = performance.now();
    for (const entry of this.entries.values()) {
      if (entry.started) entry.el.pause();
    }
  }

  resume() {
    if (this.dead || this.suspendedAt === undefined) return;
    const elapsed = performance.now() - this.suspendedAt;
    for (const entry of this.entries.values()) {
      entry.createdAt += elapsed;
      entry.advancedAt += elapsed;
      if (entry.heldAt !== undefined) entry.heldAt += elapsed;
    }
    this.suspendedAt = undefined;
    const current = this.entries.get(this.cursor);
    if (
      current?.ready &&
      current.started &&
      current.heldAt === undefined &&
      !current.waiting
    )
      current.el.play();
  }

  // PRÉ-CARGA
  // The next `ahead` segments get their players mounted, ready and parked on the first frame. Very short segments need
  // more than one ahead: the one after the next must already be ready when the next one starts.
  private preload() {
    let index = this.cursor;
    for (let i = 0; i < Math.min(this.ahead, this.flat.length - 1); i++) {
      index = this.after(index);
      this.create(index, false);
    }
  }

  // Tiles mode: keep only the current segment and the ones parked ahead; every other player goes. The previous
  // neighbour is not kept frozen: its tile shows the cover of its last frame (an image, no player).
  private trim() {
    const keep = new Set([this.cursor]);
    let index = this.cursor;
    for (let i = 0; i < this.ahead; i++) {
      index = this.after(index);
      keep.add(index);
    }
    // A finished segment is dropped even when it is also the next one (a ring of two tiles): the next is always a
    // fresh player parked on its first frame, never the old one that already ran to its last frame
    for (const entry of [...this.entries.values()])
      if (!keep.has(entry.index) || entry.played) this.drop(entry);
    this.preload();
  }

  destroy() {
    this.dead = true;
    window.clearInterval(this.timer);
    this.clear();
  }

  private drop(entry: Entry) {
    this.remove(entry);
    this.entries.delete(entry.index);
    // A two-cut shared frame needs a fresh successor after the leaving instance has been removed.
    if (!this.dead) this.preload();
  }

  private clear() {
    for (const id of this.timeouts) window.clearTimeout(id);
    this.timeouts.clear();
    for (const entry of this.entries.values()) this.remove(entry);
    this.entries.clear();
  }

  private later(fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      this.timeouts.delete(id);
      if (!this.dead) fn();
    }, ms);
    this.timeouts.add(id);
  }

  private remove(entry: Entry) {
    try {
      entry.el.pause();
    } catch {
      /* player not ready yet */
    }
    entry.wrap.remove();
  }

  // PLAYER DE UM SEGMENTO
  // The wrapper fades in; a preloaded player is created without autoplay, parked on the first frame of its range and
  // shown only when it belongs to another slide (its tile is a neighbour) or is the current one.
  private create(index: number, autoplay: boolean) {
    if (this.entries.has(index)) return;
    const segment = this.flat[index];
    const layers = this.options.layers();
    const host =
      this.options.tiles && !this.options.tileBySlide
        ? layers[index]
        : layers[segment.slide];
    if (!host) return;
    const wrap = document.createElement("div");
    wrap.style.cssText = `position:absolute;inset:0;opacity:0;transition:opacity ${FADE_MS}ms ease`;
    const el = createPlayer(
      piece(segment.id),
      segment.range,
      autoplay,
      segment.rate,
    );
    wrap.appendChild(el);
    host.appendChild(wrap);
    hideLoader(el);
    const entry: Entry = {
      index,
      el,
      wrap,
      ready: false,
      settled: false,
      started: autoplay,
      createdAt: performance.now(),
      advancedAt: performance.now(),
      lastTime: segment.range[0],
    };
    this.entries.set(index, entry);
    el.addEventListener("ready", () => {
      if (this.dead) return;
      hideLoader(el);
      entry.ready = true;
      entry.advancedAt = performance.now();
      // The playback-rate attribute set before the composition is ready is not applied by the player: set it again now
      // (the attribute change reaches the runtime, which scales the timeline)
      if (segment.rate !== 1) el.playbackRate = segment.rate;
      if (!autoplay) {
        el.seek(segment.range[0]);
        el.pause();
      }
      if (this.suspendedAt !== undefined) el.pause();
      this.later(
        () => {
          entry.settled = true;
          this.reveal(entry);
        },
        autoplay ? 0 : SETTLE_MS,
      );
    });
  }

  private reveal(entry: Entry) {
    const current = this.flat[this.cursor];
    if (
      (this.options.tiles && !this.options.tileBySlide) ||
      entry.index === this.cursor ||
      (!this.options.single && this.flat[entry.index].slide !== current.slide)
    )
      entry.wrap.style.opacity = "1";
  }

  // PASSAGEM PARA O PRÓXIMO SEGMENTO
  private tick() {
    if (this.dead || this.failed || this.suspendedAt !== undefined) return;
    const now = performance.now();
    for (const entry of this.entries.values()) {
      if (!entry.ready && now - entry.createdAt >= READY_TIMEOUT_MS) {
        this.failed = true;
        this.options.onUnavailable?.("ready");
        return;
      }
    }
    const current = this.entries.get(this.cursor);
    if (!current || !current.ready || !current.started) return;
    const segment = this.flat[this.cursor];
    const t = current.el.currentTime;
    if (Math.abs(t - current.lastTime) > 0.001) {
      current.lastTime = t;
      current.advancedAt = now;
    } else if (
      current.heldAt === undefined &&
      !current.waiting &&
      now - current.advancedAt >= READY_TIMEOUT_MS
    ) {
      this.failed = true;
      this.options.onUnavailable?.("stalled");
      return;
    }
    // The range is in piece time: a real lead of `lead` s is lead * rate seconds of the piece
    // A pushed cut starts its successor PUSH_PRE s early: the new player needs a moment before its timeline moves, and
    // the push only begins after that moment, so the incoming clip is already moving when it slides in
    const pre = this.options.single && segment.transition ? PUSH_PRE : 0;
    // A segment with a hold plays to its range end, freezes there for `hold` s and only then starts the next one
    if (this.options.single && segment.hold > 0 && this.flat.length > 1) {
      if (current.heldAt === undefined) {
        if (t < segment.range[1] - HOLD_EDGE * segment.rate) return;
        current.el.pause();
        current.heldAt = performance.now();
      }
      if ((performance.now() - current.heldAt) / 1000 < segment.hold - pre)
        return;
      const following = this.entries.get(this.after(this.cursor));
      // Keep holding the last frame until the next one is ready
      if (!following || !following.settled || following.played) return;
      this.handoff(current, following, segment.lead + pre);
      return;
    }
    if (t < segment.range[1] - (segment.lead + pre) * segment.rate) return;
    if (this.flat.length === 1) return;
    const next = this.entries.get(this.after(this.cursor));
    if (!next || !next.settled || next.played) {
      // Never let the range end run into a loop: hold the last frame until the next one is ready
      if (t >= segment.range[1] - 0.2 * segment.rate) {
        current.waiting = true;
        current.el.pause();
      }
      return;
    }
    this.handoff(current, next, (segment.range[1] - t) / segment.rate);
  }

  // EMPURRÃO ENTRE CORTES
  // The incoming layer slides in from the right (push-left) or from below (push-up) while the leaving one slides out
  // the opposite way, so two captions never sit on the same spot. Both layers use the same ease and duration.
  private push(leaving: HTMLElement, entering: HTMLElement, t: PushTransition) {
    const from =
      t.type === "push-left" ? "translate(100%,0)" : "translate(0,100%)";
    const to =
      t.type === "push-left" ? "translate(-100%,0)" : "translate(0,-100%)";
    const ease = "cubic-bezier(0.455,0.03,0.515,0.955)";
    entering.style.transition = "none";
    entering.style.transform = from;
    entering.style.opacity = "1";
    // Commit the start position before the transition is armed
    entering.getBoundingClientRect();
    const moving = `transform ${t.duration}s ${ease}`;
    entering.style.transition = moving;
    leaving.style.transition = moving;
    entering.style.transform = "translate(0,0)";
    leaving.style.transform = to;
  }

  private handoff(current: Entry, next: Entry, remaining: number) {
    const from = this.flat[current.index];
    const to = this.flat[next.index];
    this.cursor = next.index;
    current.played = true;
    next.started = true;
    next.advancedAt = performance.now();
    next.el.play();
    const pushed = this.options.single ? from.transition : undefined;
    const bring = () => {
      // Tiles: the page rotates the ring from onSwap, nothing to animate here
      if (this.options.tiles && !this.options.tileBySlide) {
        /* rotation is driven by the page */
      } else if (this.options.tileBySlide && to.slide !== from.slide) {
        // The incoming slide has its own tile: show its player at once, the page rotates the ring
        next.wrap.style.transitionDuration = "0ms";
        next.wrap.style.opacity = "1";
      } else if (pushed && !this.options.tiles) {
        this.push(current.wrap, next.wrap, pushed);
      } else {
        // The fade-in lasts as long as the lead, so the overlap and the crossfade end together
        next.wrap.style.transitionDuration = `${Math.round(from.lead * 1000)}ms`;
        next.wrap.style.opacity = "1";
      }
      if (to.slide !== from.slide) this.options.onSlide(to.slide);
      this.options.onSwap?.({
        from: from.slide,
        to: to.slide,
        prepared: true,
        at: performance.now(),
        fromIndex: current.index,
        toIndex: next.index,
        duration: from.lead,
      });
    };
    if (pushed) this.later(bring, PUSH_PRE * 1000);
    else bring();
    if (this.options.tiles) {
      // The leaving cut stays frozen as the previous tile; players outside the new neighbourhood go once the rotation
      // has finished
      this.later(
        () => {
          current.el.pause();
          this.trim();
        },
        (from.lead + PUSH_PRE) * 1000 + 120,
      );
      this.preload();
      return;
    }
    // The leaving player keeps running under the new one until its range closes, then fades and goes away
    const stay = Math.max(remaining, 0.1) * 1000;
    this.later(() => {
      // Pause on the last frame so a range end can never loop while the layer fades
      current.el.pause();
      if (this.options.single) {
        // One shared frame: the new layer is already opaque on top, so the old one just goes away (no dip in between)
        this.later(() => this.drop(current), 120);
        return;
      }
      current.wrap.style.opacity = "0";
      this.later(() => this.drop(current), FADE_MS + 60);
    }, stay);
    // Mount the next one right away so it has the whole segment to get ready
    this.preload();
  }
}

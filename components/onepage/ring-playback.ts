// REPRODUÇÃO ENCADEADA DO CARROSSEL
// Plays the segments of every slide back to back with no gap. The next segment already has its player mounted, ready
// and paused on its first frame; a little before the current one ends (the lead) it is started, so it is running when
// the ring brings it to the centre, and the two overlap with a crossfade. Players: the current one, the next one
// (paused, preloaded) and, for about a second, the one that is leaving.
import { createPlayer, piece, type PlayerElement } from "./player";
import type { Slide } from "@/lib/motion-slides";

// Duration of the position swap of the ring (keep equal to the CSS transition in ring.module.css)
export const SWAP_SECONDS = 1;
// Crossfade between two segments of the same slide (opening tail into film)
export const BLEND_SECONDS = 0.4;
const FADE_MS = 400;
const TICK_MS = 40;
// Reveal of a preloaded player waits for the seek to its first frame to settle
const SETTLE_MS = 140;

export type FlatSegment = {
  slide: number;
  id: string;
  range: readonly [number, number];
  // Playback speed; the segment lasts (end - start) / rate on screen
  rate: number;
  // Real seconds before the end of this segment at which the next one is started
  lead: number;
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
    })),
  );
  return flat.map((segment, i) => {
    const next = flat[(i + 1) % flat.length];
    const wanted = next.slide === segment.slide ? blend : swap;
    const length = (segment.range[1] - segment.range[0]) / segment.rate;
    return { ...segment, lead: Math.min(wanted, length * 0.8) };
  });
}

export const firstSegmentOf = (flat: readonly FlatSegment[], slide: number) =>
  Math.max(
    0,
    flat.findIndex((segment) => segment.slide === slide),
  );

type Entry = {
  index: number;
  el: PlayerElement;
  wrap: HTMLElement;
  ready: boolean;
  started: boolean;
};

export type SwapInfo = {
  from: number;
  to: number;
  // The next player was ready before the handoff (no wait)
  prepared: boolean;
  at: number;
};

export class Playback {
  private entries = new Map<number, Entry>();
  private cursor: number;
  private timer = 0;
  private timeouts = new Set<number>();
  private dead = false;
  private ahead: number;

  constructor(
    private options: {
      flat: readonly FlatSegment[];
      // Layer container of each slide (the tile frame), by slide index
      layers: () => (HTMLElement | null)[];
      start: number;
      onSlide: (slide: number) => void;
      onSwap?: (info: SwapInfo) => void;
      // How many segments ahead keep a ready player (1 by default)
      ahead?: number;
      // Every slide shares one frame (the workbench): a preloaded player stays hidden until its handoff
      single?: boolean;
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

  // Manual switch: start over at the first segment of another slide
  jump(slide: number) {
    this.clear();
    this.cursor = firstSegmentOf(this.flat, slide);
    this.options.onSlide(slide);
    this.create(this.cursor, true);
    this.preload();
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

  destroy() {
    this.dead = true;
    window.clearInterval(this.timer);
    this.clear();
  }

  private drop(entry: Entry) {
    this.remove(entry);
    this.entries.delete(entry.index);
  }

  // Element of the segment that is playing now (the workbench measures its start)
  get currentElement(): PlayerElement | null {
    return this.entries.get(this.cursor)?.el ?? null;
  }

  // Players alive right now (for the page measurements)
  get alive() {
    return this.entries.size;
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
    const host = this.options.layers()[segment.slide];
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
    const entry: Entry = { index, el, wrap, ready: false, started: autoplay };
    this.entries.set(index, entry);
    el.addEventListener("ready", () => {
      entry.ready = true;
      // The playback-rate attribute set before the composition is ready is not applied by the player: set it again now
      // (the attribute change reaches the runtime, which scales the timeline)
      if (segment.rate !== 1) el.playbackRate = segment.rate;
      if (!autoplay) {
        el.seek(segment.range[0]);
        el.pause();
      }
      this.later(() => this.reveal(entry), autoplay ? 0 : SETTLE_MS);
    });
  }

  private reveal(entry: Entry) {
    const current = this.flat[this.cursor];
    if (
      entry.index === this.cursor ||
      (!this.options.single && this.flat[entry.index].slide !== current.slide)
    )
      entry.wrap.style.opacity = "1";
  }

  // PASSAGEM PARA O PRÓXIMO SEGMENTO
  private tick() {
    const current = this.entries.get(this.cursor);
    if (!current || !current.ready || !current.started) return;
    const segment = this.flat[this.cursor];
    const t = current.el.currentTime;
    // The range is in piece time: a real lead of `lead` s is lead * rate seconds of the piece
    if (t < segment.range[1] - segment.lead * segment.rate) return;
    if (this.flat.length === 1) return;
    const next = this.entries.get(this.after(this.cursor));
    if (!next || !next.ready) {
      // Never let the range end run into a loop: hold the last frame until the next one is ready
      if (t >= segment.range[1] - 0.2 * segment.rate) current.el.pause();
      return;
    }
    this.handoff(current, next, (segment.range[1] - t) / segment.rate);
  }

  private handoff(current: Entry, next: Entry, remaining: number) {
    const from = this.flat[current.index];
    const to = this.flat[next.index];
    this.cursor = next.index;
    next.started = true;
    next.el.play();
    // The fade-in lasts as long as the lead, so the overlap and the crossfade end together
    next.wrap.style.transitionDuration = `${Math.round(from.lead * 1000)}ms`;
    next.wrap.style.opacity = "1";
    if (to.slide !== from.slide) this.options.onSlide(to.slide);
    this.options.onSwap?.({
      from: from.slide,
      to: to.slide,
      prepared: true,
      at: performance.now(),
    });
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

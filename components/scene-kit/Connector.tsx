"use client";
// CONECTOR ENTRE PEÇAS DE UMA CENA
// A trace drawn over a scene from one element to another (a channel row to the history entry it became): an SVG laid
// over its positioned parent, measured from the layout, never from a guess. v4 (brief-v4, artboard 7 of the canvas,
// 2026-10-23): always curved, never straight, with a small open arrowhead (5 x 8 px), in one of three states:
//  - rest (default): the grey at 40 %, 1.75 px, the link exists and nothing happens on it;
//  - active: ink, 2 px, a stretch already run or a link in focus;
//  - live: amber, 2.25 px, with a 12 px bead riding it, what happens now (one per frame, inside the amber budget).
// It draws itself on (stroke from 0 to the full length on the enter curve, ~1.2 s), its arrowhead lands once the line
// has arrived, all in CSS (components/scene-kit/connector.module.css), so the kit's off-screen pause stops them like any
// other animation and reduced motion shows the line already drawn, with its head. It measures in a ref callback that
// re-runs when its inputs change (React 19 ref cleanup, no effect) and again on every resize or end of an animation or
// transition inside the parent (an entry landing moves the target), from offsetTop/offsetLeft, so the transform of an
// entry still arriving never bends the trace.
// The routes, each drawn only while the two pieces sit as the route expects (otherwise nothing, as on a phone that
// stacks what a desktop puts side by side), so the trace always passes outside the pieces. Every route is a chain of
// cubic curves (no straight segment): the corners of a lane are rounded whole, and two ends on one line bow a little.
//  - curve (default): an S across the gap of two side-by-side pieces, either way, handles at ~45 % of the distance;
//  - elbow: out of the source, through a lane in the gap (its middle, or midway between the `lane` piece's edge and the
//    target), into the target, either way;
//  - drop: down from a piece to the one under it, on the centre of their overlap, bowing to one side;
//  - up: from the top of `from` up to the bottom of `to`, on the centre line of `to`, bowing to one side;
//  - around: from the left edge of `from` out into a lane `clearance` px away, up above `to`, along to its centre and
//    down onto its top (a citation on the right pointing back at the piece it cites).
import { useCallback, useState } from "react";
import c from "./connector.module.css";

type Point = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
export type ConnectorRoute = "curve" | "elbow" | "drop" | "up" | "around";
export type ConnectorState = "rest" | "active" | "live";
type Trace = { d: string; start: Point; head: string };

// Length and half width of the open arrowhead, in px of the layout (5 x 8 px, brief-v4)
export const CONNECTOR_HEAD = { length: 5, half: 4 } as const;
// Share of the distance the handles of a curve reach (artboard 7: ~45 %), the least of them, and the bow of a trace
// whose two ends sit on one line (so it is never straight)
const HANDLE = 0.45;
const MIN_HANDLE = 24;
const BOW = { share: 0.18, min: 10, max: 28 };

// Position of an element in the box of `root`, from the layout only (transforms ignored)
function offsetIn(el: HTMLElement, root: HTMLElement): Box | null {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
    if (node && !root.contains(node) && node !== root) return null;
  }
  return node === root ? { x, y, w: el.offsetWidth, h: el.offsetHeight } : null;
}

// The first match of the selector that is laid out (a pane hidden at this width has no offsetParent)
const visible = (root: HTMLElement, selector: string) =>
  [...root.querySelectorAll<HTMLElement>(selector)].find((el) => el.offsetParent !== null) ?? null;

const round = (n: number) => Math.round(n * 100) / 100;
const pt = (p: Point) => `${round(p.x)} ${round(p.y)}`;
const mid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// The open chevron of the arrowhead: its tip on the end of the trace, pointing along the tangent that arrives there
// (from the last control point to the tip)
function headAt(tip: Point, from: Point) {
  const dx = tip.x - from.x;
  const dy = tip.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const dir = { x: dx / len, y: dy / len };
  const back = { x: tip.x - dir.x * CONNECTOR_HEAD.length, y: tip.y - dir.y * CONNECTOR_HEAD.length };
  const side = { x: -dir.y * CONNECTOR_HEAD.half, y: dir.x * CONNECTOR_HEAD.half };
  return `M ${pt({ x: back.x + side.x, y: back.y + side.y })} L ${pt(tip)} L ${pt({ x: back.x - side.x, y: back.y - side.y })}`;
}

// One cubic from `start` to `tip` with the two control points given
function cubic(start: Point, c1: Point, c2: Point, tip: Point): Trace {
  return { d: `M ${pt(start)} C ${pt(c1)}, ${pt(c2)}, ${pt(tip)}`, start, head: headAt(tip, c2) };
}

// A lane (a polyline of corners) drawn whole in curves: each corner is a cubic with both handles on it, joined at the
// middles of the legs, so the trace keeps the lane's way round the pieces without one straight stretch
function smoothLane(points: Point[]): Trace {
  const [start, ...rest] = points;
  const tip = rest[rest.length - 1];
  const corners = rest.slice(0, -1);
  let d = `M ${pt(start)}`;
  corners.forEach((corner, i) => {
    const to = i === corners.length - 1 ? tip : mid(corner, corners[i + 1]);
    d += ` C ${pt(corner)}, ${pt(corner)}, ${pt(to)}`;
  });
  return { d, start, head: headAt(tip, corners[corners.length - 1]) };
}

// A vertical run (drop, up) bowed to the right, its handles at ~45 % of the height
function bowedVertical(start: Point, tip: Point): Trace {
  const h = tip.y - start.y;
  const bow = clamp(Math.abs(h) * BOW.share, BOW.min, BOW.max);
  return cubic(start, { x: start.x + bow, y: start.y + h * HANDLE }, { x: tip.x + bow, y: tip.y - h * HANDLE }, tip);
}

type Plan = { route: ConnectorRoute; inset: number; gap: number; lane: Box | null; clearance: number };

// The trace of a route between two boxes, or null when the pieces do not sit as the route expects
function plan(a: Box, b: Box, { route, inset, gap, lane, clearance }: Plan): Trace | null {
  if (route === "drop") {
    const left = Math.max(a.x, b.x);
    const right = Math.min(a.x + a.w, b.x + b.w);
    if (right <= left || b.y <= a.y + a.h) return null;
    const x = (left + right) / 2;
    return bowedVertical({ x, y: a.y + a.h - inset }, { x, y: b.y - gap });
  }
  if (route === "up") {
    const x = b.x + b.w / 2;
    // `from` under `to`, and the centre line of `to` crosses `from`
    if (a.y < b.y + b.h || x < a.x || x > a.x + a.w) return null;
    return bowedVertical({ x, y: a.y - gap }, { x, y: b.y + b.h + gap });
  }
  if (route === "around") {
    // `to` wholly left of `from` and above it
    if (b.x + b.w > a.x || b.y > a.y) return null;
    const start = { x: a.x - gap, y: a.y + a.h / 2 };
    const laneX = a.x - clearance;
    const top = b.y - clearance;
    const x = b.x + b.w / 2;
    return smoothLane([start, { x: laneX, y: start.y }, { x: laneX, y: top }, { x, y: top }, { x, y: b.y - gap }]);
  }
  // Curve and elbow: side by side, either way (on a phone the source sits above the target and a trace would cross)
  const rightward = a.x + a.w <= b.x;
  const leftward = b.x + b.w <= a.x;
  if (!rightward && !leftward) return null;
  // +1 runs to the right, -1 to the left
  const dir = rightward ? 1 : -1;
  const start = { x: rightward ? a.x + a.w - inset : a.x + inset, y: a.y + a.h / 2 };
  const tip = { x: rightward ? b.x - gap : b.x + b.w + gap, y: b.y + b.h / 2 };
  const span = Math.abs(tip.x - start.x);
  // Two ends on one line (within a pixel of layout rounding): a shallow arc over the gap, never a straight trace
  if (Math.abs(tip.y - start.y) < 1) {
    const bow = clamp(span * BOW.share, BOW.min, BOW.max);
    const handle = dir * span * HANDLE;
    return cubic(start, { x: start.x + handle, y: start.y - bow }, { x: tip.x - handle, y: tip.y - bow }, tip);
  }
  if (route === "elbow") {
    // The lane: midway between the lane piece's edge facing the target (the source's container) and the target, or
    // the middle of the gap
    const edge = lane ? (rightward ? lane.x + lane.w : lane.x) : start.x;
    const x = (edge + tip.x) / 2;
    return smoothLane([start, { x, y: start.y }, { x, y: tip.y }, tip]);
  }
  // Horizontal tangents at both ends, the handles at ~45 % of the distance
  const dx = dir * Math.max(MIN_HANDLE, span * HANDLE);
  return cubic(start, { x: start.x + dx, y: start.y }, { x: tip.x - dx, y: tip.y }, tip);
}

export function Connector({
  from,
  to,
  route = "curve",
  inset = 8,
  gap = 6,
  lane,
  clearance = 16,
  state = "rest",
}: {
  // Selectors inside the positioned parent; the trace runs only while both are laid out as the route expects
  from: string;
  to: string;
  route?: ConnectorRoute;
  // How far inside `from` the trace starts (curve, elbow, drop), and how far from the pieces it ends
  inset?: number;
  gap?: number;
  // For an elbow: the piece whose edge bounds the gutter the trace runs along (the source's container)
  lane?: string;
  // For `around`: how far outside the pieces the trace runs (beside `from` and above `to`)
  clearance?: number;
  // rest: the link exists, nothing on it; active: run already or in focus; live: happening now (amber, one per frame)
  state?: ConnectorState;
}) {
  const [trace, setTrace] = useState<Trace | null>(null);

  const ref = useCallback(
    (svg: SVGSVGElement | null) => {
      const root = svg?.parentElement;
      if (!svg || !root) return undefined;
      const measure = () => {
        const a = visible(root, from);
        const b = visible(root, to);
        const pa = a && offsetIn(a, root);
        const pb = b && offsetIn(b, root);
        const l = lane ? visible(root, lane) : null;
        const next = pa && pb ? plan(pa, pb, { route, inset, gap, lane: l && offsetIn(l, root), clearance }) : null;
        setTrace((prev) => (prev?.d === next?.d && prev?.head === next?.head ? prev : next));
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(root);
      root.addEventListener("animationend", measure);
      root.addEventListener("transitionend", measure);
      return () => {
        observer.disconnect();
        root.removeEventListener("animationend", measure);
        root.removeEventListener("transitionend", measure);
      };
    },
    [from, to, route, inset, gap, lane, clearance],
  );

  return (
    <svg ref={ref} className={c.layer} data-trace-state={state} aria-hidden="true">
      {trace ? (
        // Keyed by the target: a new hand-off draws again, a re-measure of the same one only moves it
        <g key={to}>
          <path d={trace.d} pathLength={1} className={c.path} data-trace="" />
          <path d={trace.head} className={c.head} />
          {state === "live" ? <circle r={6} className={c.bead} style={{ offsetPath: `path("${trace.d}")` }} /> : null}
        </g>
      ) : null}
    </svg>
  );
}

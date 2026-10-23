"use client";
// CONECTOR ENTRE PEÇAS DE UMA CENA
// A trace drawn over a scene from one element to another (a channel row to the history entry it became): an SVG laid
// over its positioned parent, measured from the layout, never from a guess. Since the carousels (brief-v3-carousel,
// 2026-10-22) it is one solid ink line at --rule-trace (3 px) that ends in an arrowhead and stays drawn (no fading);
// `tone="quiet"` draws it in the indicator grey, for the way to a step still to come. It draws itself on (stroke from
// 0 to the full length), its arrowhead lands once the line has arrived and a light bead rides it once, all in CSS
// (components/scene-kit/connector.module.css), so the kit's off-screen pause stops them like any other animation and
// reduced motion shows the line already drawn, with its head. Never amber: amber is an area, never a line (Welabs UI
// v3). It measures in a ref callback that re-runs when its inputs change (React 19 ref cleanup, no effect) and again
// on every resize or end of an animation or transition inside the parent (an entry landing moves the target), from
// offsetTop/offsetLeft, so the transform of an entry still arriving never bends the trace.
// The routes, each drawn only while the two pieces sit as the route expects (otherwise nothing, as on a phone that
// stacks what a desktop puts side by side), so the trace always passes outside the pieces:
//  - curve (default): an S across the gap of two side-by-side pieces, either way (source on the left or on the right);
//    two ends on one line (within a pixel) draw a straight trace;
//  - elbow: out of the source, along a lane through the gap (its middle, or midway between the `lane` piece's edge
//    and the target), into the target, either way;
//  - drop: straight down from a piece to the one under it, on the centre of their overlap;
//  - up: from the top of `from` straight up to the bottom of `to`, on the centre line of `to`;
//  - around: from the left edge of `from` out into a lane `clearance` px away, up above `to`, along to its centre and
//    down onto its top (a citation on the right pointing back at the piece it cites).
import { useCallback, useState } from "react";
import c from "./connector.module.css";

type Point = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
export type ConnectorRoute = "curve" | "elbow" | "drop" | "up" | "around";
type Trace = { d: string; start: Point; head: string };

// Length and half width of the arrowhead, in px of the layout (sized for the 3 px trace)
const HEAD = { length: 7, half: 6 };

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

// The open chevron of the arrowhead: its tip on the end of the trace, pointing along `dir` (a unit axis vector)
function headAt(end: Point, dir: Point) {
  const back = { x: end.x - dir.x * HEAD.length, y: end.y - dir.y * HEAD.length };
  const side = { x: -dir.y * HEAD.half, y: dir.x * HEAD.half };
  return `M ${back.x + side.x} ${back.y + side.y} L ${end.x} ${end.y} L ${back.x - side.x} ${back.y - side.y}`;
}

type Plan = { route: ConnectorRoute; inset: number; gap: number; lane: Box | null; clearance: number };

// The trace of a route between two boxes, or null when the pieces do not sit as the route expects
function plan(a: Box, b: Box, { route, inset, gap, lane, clearance }: Plan): Trace | null {
  if (route === "drop") {
    const left = Math.max(a.x, b.x);
    const right = Math.min(a.x + a.w, b.x + b.w);
    if (right <= left || b.y <= a.y + a.h) return null;
    const x = (left + right) / 2;
    const start = { x, y: a.y + a.h - inset };
    const tip = { x, y: b.y - gap };
    return { d: `M ${start.x} ${start.y} V ${tip.y}`, start, head: headAt(tip, { x: 0, y: 1 }) };
  }
  if (route === "up") {
    const x = b.x + b.w / 2;
    // `from` under `to`, and the centre line of `to` crosses `from`
    if (a.y < b.y + b.h || x < a.x || x > a.x + a.w) return null;
    const start = { x, y: a.y - gap };
    const tip = { x, y: b.y + b.h + gap };
    return { d: `M ${start.x} ${start.y} V ${tip.y}`, start, head: headAt(tip, { x: 0, y: -1 }) };
  }
  if (route === "around") {
    // `to` wholly left of `from` and above it
    if (b.x + b.w > a.x || b.y > a.y) return null;
    const start = { x: a.x - gap, y: a.y + a.h / 2 };
    const laneX = a.x - clearance;
    const top = b.y - clearance;
    const x = b.x + b.w / 2;
    const tip = { x, y: b.y - gap };
    return {
      d: `M ${start.x} ${start.y} H ${laneX} V ${top} H ${x} V ${tip.y}`,
      start,
      head: headAt(tip, { x: 0, y: 1 }),
    };
  }
  // Curve and elbow: side by side, either way (on a phone the source sits above the target and a trace would cross)
  const rightward = a.x + a.w <= b.x;
  const leftward = b.x + b.w <= a.x;
  if (!rightward && !leftward) return null;
  // +1 runs to the right, -1 to the left
  const dir = rightward ? 1 : -1;
  const start = { x: rightward ? a.x + a.w - inset : a.x + inset, y: a.y + a.h / 2 };
  const end = { x: rightward ? b.x - gap : b.x + b.w + gap, y: b.y + b.h / 2 };
  // Two ends on one line (within a pixel of layout rounding) draw a straight trace on the source's line
  const level = Math.abs(end.y - start.y) < 1;
  const tip = level ? { x: end.x, y: start.y } : end;
  const head = headAt(tip, { x: dir, y: 0 });
  if (level) return { d: `M ${start.x} ${start.y} H ${tip.x}`, start, head };
  if (route === "elbow") {
    // The lane: midway between the lane piece's edge facing the target (the source's container) and the target, or
    // the middle of the gap
    const edge = lane ? (rightward ? lane.x + lane.w : lane.x) : start.x;
    const x = Math.round((edge + tip.x) / 2);
    return { d: `M ${start.x} ${start.y} H ${x} V ${tip.y} H ${tip.x}`, start, head };
  }
  // Horizontal tangents at both ends
  const dx = dir * Math.max(24, Math.abs(tip.x - start.x) * 0.9);
  return { d: `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${tip.x - dx} ${tip.y}, ${tip.x} ${tip.y}`, start, head };
}

export function Connector({
  from,
  to,
  route = "curve",
  inset = 8,
  gap = 6,
  lane,
  clearance = 16,
  tone = "ink",
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
  // ink: a hand-off that happened; quiet: the way to a step still to come
  tone?: "ink" | "quiet";
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
    <svg ref={ref} className={c.layer} data-tone={tone} aria-hidden="true">
      {trace ? (
        // Keyed by the target: a new hand-off draws again, a re-measure of the same one only moves it
        <g key={to}>
          <circle cx={trace.start.x} cy={trace.start.y} r={3} className={c.anchor} />
          <path d={trace.d} pathLength={1} className={c.path} />
          <path d={trace.head} className={c.head} />
          <circle r={3} className={c.dot} style={{ offsetPath: `path("${trace.d}")` }} />
        </g>
      ) : null}
    </svg>
  );
}

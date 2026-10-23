"use client";
// CONECTOR ENTRE PEÇAS DE UMA CENA
// A trace drawn over a scene from one element to another (a channel row to the history entry it became): an SVG laid
// over its positioned parent, measured from the layout, never from a guess. It draws itself on (stroke from 0 to the
// full length), a small ink dot travels along it and an arrowhead lands at its end, all in CSS
// (components/scene-kit/connector.module.css), so the kit's off-screen pause and reduced motion stop them like any
// other animation. A solid ink line (v3 carousel brief, 2026-10-22: solid, 2 to 3.5 px, with an arrow, routed outside
// the pieces); never amber: amber is an area, never a line. It measures in a ref callback that re-runs when its inputs
// change (React 19 ref cleanup, no effect) and again on every resize or end of an animation inside the parent (an
// entry landing moves the target), from offsetTop/offsetLeft, so the transform of an entry still arriving never bends
// the trace.
// Three routes: `curve` (the default, an S across the gap of two side-by-side pieces), `elbow` (out of the source,
// down or up a lane in the gutter between the two, into the target: the trace never crosses a piece) and `drop`
// (straight down from a piece to the one under it, on the centre of their overlap).
import { useCallback, useState } from "react";
import c from "./connector.module.css";

type Point = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
export type ConnectorRoute = "curve" | "elbow" | "drop";

// Half the width (and the depth) of the arrowhead, in px of the layout
const HEAD = 6;

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

// From the right edge of `from` to the left edge of `to`, with horizontal tangents (an S across the gap)
function curve(a: Point, b: Point) {
  const dx = Math.max(24, (b.x - a.x) * 0.9);
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

// The arrowhead at `tip`, pointing right or down
const head = (tip: Point, down: boolean) =>
  down
    ? `M ${tip.x - HEAD} ${tip.y - HEAD} L ${tip.x} ${tip.y} L ${tip.x + HEAD} ${tip.y - HEAD}`
    : `M ${tip.x - HEAD} ${tip.y - HEAD} L ${tip.x} ${tip.y} L ${tip.x - HEAD} ${tip.y + HEAD}`;

type Trace = { d: string; start: Point; head: string };

// The path of a route between two boxes, or null when the pieces are not laid out for it (a phone stacks what a
// desktop puts side by side, and a trace would then cross the pieces)
function route(kind: ConnectorRoute, a: Box, b: Box, inset: number, gap: number, lane: Box | null): Trace | null {
  if (kind === "drop") {
    const left = Math.max(a.x, b.x);
    const right = Math.min(a.x + a.w, b.x + b.w);
    if (right <= left || b.y <= a.y + a.h) return null;
    const x = (left + right) / 2;
    const start = { x, y: a.y + a.h - inset };
    const tip = { x, y: b.y - gap };
    return { d: `M ${start.x} ${start.y} V ${tip.y}`, start, head: head(tip, true) };
  }
  if (a.x + a.w > b.x) return null;
  const start = { x: a.x + a.w - inset, y: a.y + a.h / 2 };
  const tip = { x: b.x - gap, y: b.y + b.h / 2 };
  if (kind === "curve") return { d: curve(start, tip), start, head: head(tip, false) };
  // The lane: midway between the right edge of the lane piece (the source's container) and the target
  const from = lane ? lane.x + lane.w : start.x;
  const x = Math.round((from + tip.x) / 2);
  return { d: `M ${start.x} ${start.y} H ${x} V ${tip.y} H ${tip.x}`, start, head: head(tip, false) };
}

export function Connector({
  from,
  to,
  inset = 8,
  gap = 6,
  route: kind = "curve",
  lane,
}: {
  // Selectors inside the positioned parent; the trace runs only while both are laid out for its route
  from: string;
  to: string;
  // How far inside `from` the trace starts, and how far before `to` it ends
  inset?: number;
  gap?: number;
  route?: ConnectorRoute;
  // For an elbow: the piece whose right edge bounds the gutter the trace runs down (the source's container)
  lane?: string;
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
        const next = pa && pb ? route(kind, pa, pb, inset, gap, l && offsetIn(l, root)) : null;
        setTrace((prev) => (prev?.d === next?.d && prev?.head === next?.head ? prev : next));
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(root);
      root.addEventListener("animationend", measure);
      return () => {
        observer.disconnect();
        root.removeEventListener("animationend", measure);
      };
    },
    [from, to, inset, gap, kind, lane],
  );

  return (
    <svg ref={ref} className={c.layer} aria-hidden="true">
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

"use client";
// CONECTOR ENTRE PEÇAS DE UMA CENA
// A trace drawn over a scene from one element to another (a channel row to the history entry it became): an SVG laid
// over its positioned parent, measured from the layout, never from a guess. It draws itself on (stroke from 0 to the
// full length), ends in an arrowhead that lands once the line has arrived, and a small ink dot travels along it, all in
// CSS (components/scene-kit/connector.module.css), so the kit's off-screen pause and reduced motion stop them like any
// other animation. A solid ink line (carousels v3, 2026-10-22: solid, 2.5 px, with an arrow), never amber: amber is
// an area, never a thin line (Welabs UI v3). It runs either way across the gap (from the right edge of a source on the
// left, or from the left edge of a source on the right), as an S curve or, with `route="elbow"`, as a right-angled
// path through the middle of the gap, so it always passes outside the pieces. It measures in a ref callback that
// re-runs when `from` or `to` change (React 19 ref cleanup, no effect) and again on every resize or end of an
// animation or transition inside the parent (an entry landing moves the target), from offsetTop/offsetLeft, so the
// transform of an entry still arriving never bends the trace.
import { useCallback, useState } from "react";
import c from "./connector.module.css";

type Point = { x: number; y: number };
type Route = "curve" | "elbow";
type Trace = { d: string; start: Point; arrow: string };

// Position of an element in the box of `root`, from the layout only (transforms ignored)
function offsetIn(el: HTMLElement, root: HTMLElement) {
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

// Half the size of the arrowhead, in px of the scene (its two strokes meet at the end of the trace)
const ARROW = 6;

// From `a` to `b` with horizontal tangents: an S across the gap, or a right angle through the middle of the gap
function trace(a: Point, to: Point, route: Route): Trace {
  // Two ends on one line (within a pixel of layout rounding) draw a straight trace on the source's line
  const level = Math.abs(to.y - a.y) < 1;
  const b = level ? { x: to.x, y: a.y } : to;
  // +1 runs to the right, -1 to the left
  const dir = b.x >= a.x ? 1 : -1;
  const arrow = `M ${b.x - dir * ARROW} ${b.y - ARROW} L ${b.x} ${b.y} L ${b.x - dir * ARROW} ${b.y + ARROW}`;
  if (level) return { d: `M ${a.x} ${a.y} H ${b.x}`, start: a, arrow };
  if (route === "elbow") {
    const lane = (a.x + b.x) / 2;
    return { d: `M ${a.x} ${a.y} H ${lane} V ${b.y} H ${b.x}`, start: a, arrow };
  }
  const dx = dir * Math.max(24, Math.abs(b.x - a.x) * 0.9);
  return { d: `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`, start: a, arrow };
}

export function Connector({
  from,
  to,
  inset = 8,
  gap = 6,
  route = "curve",
}: {
  // Selectors inside the positioned parent; the trace runs only while both are laid out and side by side
  from: string;
  to: string;
  // How far inside `from` the trace starts, and how far before `to` it ends
  inset?: number;
  gap?: number;
  route?: Route;
}) {
  const [t, setT] = useState<Trace | null>(null);

  const ref = useCallback(
    (svg: SVGSVGElement | null) => {
      const root = svg?.parentElement;
      if (!svg || !root) return undefined;
      const measure = () => {
        const a = visible(root, from);
        const b = visible(root, to);
        const pa = a && offsetIn(a, root);
        const pb = b && offsetIn(b, root);
        // Only side by side (either way): on a phone the source sits above the target and a trace would cross them
        const rightward = pa && pb && pa.x + pa.w <= pb.x;
        const leftward = pa && pb && pb.x + pb.w <= pa.x;
        if (!pa || !pb || (!rightward && !leftward)) {
          setT(null);
          return;
        }
        const start = rightward
          ? { x: pa.x + pa.w - inset, y: pa.y + pa.h / 2 }
          : { x: pa.x + inset, y: pa.y + pa.h / 2 };
        const end = rightward ? { x: pb.x - gap, y: pb.y + pb.h / 2 } : { x: pb.x + pb.w + gap, y: pb.y + pb.h / 2 };
        const next = trace(start, end, route);
        setT((prev) => (prev && prev.d === next.d ? prev : next));
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
    [from, to, inset, gap, route],
  );

  return (
    <svg ref={ref} className={c.layer} aria-hidden="true">
      {t ? (
        // Keyed by the target: a new hand-off draws again, a re-measure of the same one only moves it
        <g key={to}>
          <circle cx={t.start.x} cy={t.start.y} r={3} className={c.anchor} />
          <path d={t.d} pathLength={1} className={c.path} />
          <path d={t.arrow} className={c.arrow} />
          <circle r={3} className={c.dot} style={{ offsetPath: `path("${t.d}")` }} />
        </g>
      ) : null}
    </svg>
  );
}

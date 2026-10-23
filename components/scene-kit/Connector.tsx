"use client";
// CONECTOR ENTRE PEÇAS DE UMA CENA
// A trace drawn over a scene from one element to another (a channel row to the history entry it became): an SVG laid
// over its positioned parent, measured from the layout, never from a guess. It draws itself on (stroke from 0 to the
// full length) and a small ink dot travels along it, both in CSS (components/scene-kit/connector.module.css), so the
// kit's off-screen pause and reduced motion stop them like any other animation. Since the carousels (brief-v3-carousel)
// the trace is solid and stays: the ink at 2.5 px with an arrowhead at its end (`tone="quiet"`: the indicator grey, for
// the way to a step still to come). Never amber: amber is an area, never a line (Welabs UI v3). It measures in a ref callback that re-runs when `from` or `to` change (React 19 ref
// cleanup, no effect) and again on every resize or end of an animation inside the parent (an entry landing moves the
// target), from offsetTop/offsetLeft, so the transform of an entry still arriving never bends the trace.
import { useCallback, useState } from "react";
import c from "./connector.module.css";

type Point = { x: number; y: number };

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

// From the right edge of `from` to the left edge of `to`, with horizontal tangents (an S across the gap)
function trace(a: Point, b: Point) {
  const dx = Math.max(24, (b.x - a.x) * 0.9);
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

// The arrowhead at the end of a trace: the trace lands with a horizontal tangent, so the head is a chevron pointing
// right whose tip is the end point (brief-v3-carousel: solid, 2 to 3.5 px, with an arrow)
const HEAD = 7;
const arrowHead = (b: Point) => `M ${b.x - HEAD} ${b.y - HEAD} L ${b.x} ${b.y} L ${b.x - HEAD} ${b.y + HEAD}`;

export function Connector({
  from,
  to,
  inset = 8,
  gap = 6,
  tone = "ink",
}: {
  // Selectors inside the positioned parent; the trace runs only while both are laid out and side by side
  from: string;
  to: string;
  // How far inside `from` the trace starts, and how far before `to` it ends
  inset?: number;
  gap?: number;
  // ink: a hand-off that happened; quiet: the way to a step still to come
  tone?: "ink" | "quiet";
}) {
  const [d, setD] = useState<string | null>(null);
  const [head, setHead] = useState<string | null>(null);
  // Where the trace leaves its source: an anchor dot ties the line to the row
  const [start, setStart] = useState<Point | null>(null);

  const ref = useCallback(
    (svg: SVGSVGElement | null) => {
      const root = svg?.parentElement;
      if (!svg || !root) return undefined;
      const measure = () => {
        const a = visible(root, from);
        const b = visible(root, to);
        const pa = a && offsetIn(a, root);
        const pb = b && offsetIn(b, root);
        // Only side by side: on a phone the source sits above the history and a trace would cross the entries
        if (!pa || !pb || pa.x + pa.w > pb.x) {
          setD(null);
          return;
        }
        const start = { x: pa.x + pa.w - inset, y: pa.y + pa.h / 2 };
        const end = { x: pb.x - gap, y: pb.y + pb.h / 2 };
        setD(trace(start, end));
        setHead(arrowHead(end));
        setStart((prev) => (prev && prev.x === start.x && prev.y === start.y ? prev : start));
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
    [from, to, inset, gap],
  );

  return (
    <svg ref={ref} className={c.layer} data-tone={tone} aria-hidden="true">
      {d ? (
        // Keyed by the target: a new hand-off draws again, a re-measure of the same one only moves it
        <g key={to}>
          {start ? <circle cx={start.x} cy={start.y} r={3} className={c.anchor} /> : null}
          <path d={d} pathLength={1} className={c.path} />
          {head ? <path d={head} className={c.head} /> : null}
          <circle r={3} className={c.dot} style={{ offsetPath: `path("${d}")` }} />
        </g>
      ) : null}
    </svg>
  );
}

"use client";
// CONECTOR ENTRE PEÇAS DE UMA CENA
// A trace drawn over a scene from one element to another (a channel row to the history entry it became): an SVG laid
// over its positioned parent, measured from the layout, never from a guess. It is a solid ink line with an arrowhead at
// its end (brief-v3-carousel, 2026-10-22: solid, 2 to 3.5 px, with an arrow, around the pieces and never across them).
// It draws itself on (stroke from 0 to the full length), a small ink dot travels along it and the arrowhead lands when
// the line arrives, all in CSS (components/scene-kit/connector.module.css), so the kit's off-screen pause stops them
// like any other animation and reduced motion shows the line already drawn. Never amber: amber is an area, never a thin
// line (Welabs UI v3). It measures in a ref callback that re-runs when `from` or `to` change (React 19 ref cleanup, no
// effect) and again on every resize or end of an animation inside the parent (an entry landing moves the target), from
// offsetTop/offsetLeft, so the transform of an entry still arriving never bends the trace.
// Three routes, each drawn only when the two pieces sit as the route expects (otherwise nothing, as on a phone):
//  - across (default): from the right edge of `from` to the left edge of `to`, an S across the gap between them;
//  - up: from the top of `from` straight up to the bottom of `to`, on the centre line of `to` (a piece under a track
//    pointing at its mark);
//  - around: from the left edge of `from` out into a lane, up above `to`, along to the centre of `to` and down onto
//    its top (a citation on the right pointing back at the piece it cites, outside every piece in between).
import { useCallback, useState } from "react";
import c from "./connector.module.css";

type Point = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
type Route = "across" | "up" | "around";

// Length and half width of the arrowhead, in px (the 2.5 px trace of the approved frames)
const ARROW = { length: 7, half: 6 };

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

// The trace of a route between two boxes, its start and the direction it arrives in (null when the pieces do not sit
// as the route expects)
function plan(route: Route, a: Box, b: Box, inset: number, gap: number, lane: number) {
  if (route === "up") {
    const x = b.x + b.w / 2;
    // `from` under `to`, and the centre line of `to` crosses `from`
    if (a.y < b.y + b.h || x < a.x || x > a.x + a.w) return null;
    const start = { x, y: a.y - gap };
    const end = { x, y: b.y + b.h + gap };
    return { d: `M ${start.x} ${start.y} V ${end.y}`, start, end, dir: { x: 0, y: -1 } };
  }
  if (route === "around") {
    // `to` wholly left of `from` and above it
    if (b.x + b.w > a.x || b.y > a.y) return null;
    const start = { x: a.x - gap, y: a.y + a.h / 2 };
    const laneX = a.x - lane;
    const top = b.y - lane;
    const x = b.x + b.w / 2;
    const end = { x, y: b.y - gap };
    return {
      d: `M ${start.x} ${start.y} H ${laneX} V ${top} H ${x} V ${end.y}`,
      start,
      end,
      dir: { x: 0, y: 1 },
    };
  }
  // Across: only side by side (on a phone the source sits above the history and a trace would cross the entries)
  if (a.x + a.w > b.x) return null;
  const start = { x: a.x + a.w - inset, y: a.y + a.h / 2 };
  const end = { x: b.x - gap, y: b.y + b.h / 2 };
  // Horizontal tangents at both ends
  const dx = Math.max(24, (end.x - start.x) * 0.9);
  return {
    d: `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`,
    start,
    end,
    dir: { x: 1, y: 0 },
  };
}

// The open chevron of the arrowhead, its tip on the end of the trace
function arrowAt(end: Point, dir: Point) {
  const back = { x: end.x - dir.x * ARROW.length, y: end.y - dir.y * ARROW.length };
  const side = { x: -dir.y * ARROW.half, y: dir.x * ARROW.half };
  return `M ${back.x + side.x} ${back.y + side.y} L ${end.x} ${end.y} L ${back.x - side.x} ${back.y - side.y}`;
}

export function Connector({
  from,
  to,
  route = "across",
  inset = 8,
  gap = 6,
  lane = 16,
}: {
  // Selectors inside the positioned parent; the trace runs only while both are laid out as the route expects
  from: string;
  to: string;
  route?: Route;
  // How far inside `from` the trace starts (across), and how far from the pieces it starts and ends
  inset?: number;
  gap?: number;
  // How far outside the pieces the `around` route runs (its lane beside `from` and above `to`)
  lane?: number;
}) {
  const [shape, setShape] = useState<{ d: string; arrow: string; start: Point } | null>(null);

  const ref = useCallback(
    (svg: SVGSVGElement | null) => {
      const root = svg?.parentElement;
      if (!svg || !root) return undefined;
      const measure = () => {
        const a = visible(root, from);
        const b = visible(root, to);
        const pa = a && offsetIn(a, root);
        const pb = b && offsetIn(b, root);
        const p = pa && pb ? plan(route, pa, pb, inset, gap, lane) : null;
        if (!p) {
          setShape(null);
          return;
        }
        const arrow = arrowAt(p.end, p.dir);
        setShape((prev) => (prev && prev.d === p.d ? prev : { d: p.d, arrow, start: p.start }));
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
    [from, to, route, inset, gap, lane],
  );

  return (
    <svg ref={ref} className={c.layer} aria-hidden="true">
      {shape ? (
        // Keyed by the target: a new hand-off draws again, a re-measure of the same one only moves it
        <g key={to}>
          <circle cx={shape.start.x} cy={shape.start.y} r={3} className={c.anchor} />
          <path d={shape.d} pathLength={1} className={c.path} />
          <path d={shape.arrow} className={c.arrow} />
          <circle r={3} className={c.dot} style={{ offsetPath: `path("${shape.d}")` }} />
        </g>
      ) : null}
    </svg>
  );
}

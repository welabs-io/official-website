"use client";

// CONEXÕES DA ARQUITETURA
// Measure real node bounds so the same relationships survive each responsive composition.
import styles from "./home.module.css";

const edges = [
  { source: "tuner", target: "relloo" },
  { source: "magneto", target: "domus" },
  { source: "knowly", target: "relloo" },
  { source: "domus", target: "relloo" },
];

function attachPaths(svg: SVGSVGElement | null) {
  const root = svg?.parentElement;
  if (!svg || !root) return;
  const update = () => {
    const bounds = root.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
    for (const { source, target } of edges) {
      const from = root.querySelector(`[data-architecture-node="${source}"]`);
      const to = root.querySelector(`[data-architecture-node="${target}"]`);
      if (!from || !to) continue;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const forward = a.x + a.width / 2 < b.x + b.width / 2;
      const x1 = (forward ? a.right : a.left) - bounds.left;
      const x2 = (forward ? b.left : b.right) - bounds.left;
      const y1 = a.top + a.height / 2 - bounds.top;
      const y2 = b.top + b.height / 2 - bounds.top;
      const bend = Math.max(30, Math.min(110, Math.abs(x2 - x1) * 0.6));
      const direction = forward ? 1 : -1;
      const path = `M${x1} ${y1} C${x1 + bend * direction} ${y1} ${x2 - bend * direction} ${y2} ${x2} ${y2}`;
      svg.querySelectorAll(`[data-route="${source}"]`).forEach((element) => {
        element.setAttribute("d", path);
      });
    }
  };
  const observer = new ResizeObserver(update);
  observer.observe(root);
  root
    .querySelectorAll("[data-architecture-node]")
    .forEach((node) => observer.observe(node));
  update();
  return () => observer.disconnect();
}

export function ArchitecturePaths() {
  return (
    <svg ref={attachPaths} className={styles.heroRoutes} aria-hidden="true">
      {edges.map(({ source }, index) => (
        <g key={source}>
          <path
            className={source === "domus" ? styles.routeCore : styles.route}
            data-route={source}
          />
          {source !== "domus" && (
            <path
              className={styles.routePulse}
              pathLength={100}
              data-route={source}
              style={{ animationDelay: `${-2.2 * index}s` }}
            />
          )}
        </g>
      ))}
    </svg>
  );
}

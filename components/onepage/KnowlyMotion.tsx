// MOVIMENTO DO KNOWLY: A REDE QUE VIRA GLOBO
// Logic of the opening: scattered sources are linked, then the nodes travel to the surface of a globe whose lines are
// drawn afterwards. Pure SVG + CSS.
import styles from "./knowly.module.css";

const C = { x: 240, y: 180, r: 96 };
// Resolved position (on the globe) and scattered start of each node, same index
const TARGETS = [
  [240, 84],
  [308, 112],
  [336, 180],
  [308, 248],
  [240, 276],
  [172, 248],
  [144, 180],
  [172, 112],
  [240, 180],
];
const START = [
  [240, 36],
  [380, 70],
  [430, 190],
  [370, 300],
  [250, 330],
  [110, 300],
  [50, 200],
  [90, 80],
  [300, 130],
];
// Links of the loose network, by node index
const LINKS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [8, 1],
  [8, 5],
  [8, 7],
];
const GLOBE_PATHS = [
  // Meridians and equator
  `M${C.x} ${C.y - C.r}V${C.y + C.r}`,
  `M${C.x - C.r} ${C.y}H${C.x + C.r}`,
  `M${C.x} ${C.y - C.r}A48 ${C.r} 0 0 1 ${C.x} ${C.y + C.r}A48 ${C.r} 0 0 1 ${C.x} ${C.y - C.r}`,
  // Parallels
  `M${C.x - 83} ${C.y - 48}H${C.x + 83}`,
  `M${C.x - 83} ${C.y + 48}H${C.x + 83}`,
];

export function KnowlyMotion() {
  return (
    <svg viewBox="0 0 480 360" aria-hidden="true">
      <circle
        className={styles.globe}
        pathLength={1}
        cx={C.x}
        cy={C.y}
        r={C.r}
      />
      {GLOBE_PATHS.map((d) => (
        <path key={d} className={styles.globe} pathLength={1} d={d} />
      ))}
      {LINKS.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          className={styles.link}
          x1={START[a][0]}
          y1={START[a][1]}
          x2={START[b][0]}
          y2={START[b][1]}
        />
      ))}
      {TARGETS.map(([x, y], i) => (
        <circle
          key={i}
          className={`${styles.node} ${i === 8 ? styles.hot : ""}`}
          cx={x}
          cy={y}
          r={i === 8 ? 10 : 7}
          style={
            {
              "--dx": `${START[i][0] - x}px`,
              "--dy": `${START[i][1] - y}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}

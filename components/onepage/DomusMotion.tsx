// MOVIMENTO DO DOMUS: A PLANTA QUE VIRA CASA
// Logic of the opening: the rooms of the business arrive and lock as a floor plan, then the house closes around it.
// Pure SVG + CSS; the stage (MotionStage) decides when it runs.
import styles from "./domus.module.css";

const ROOMS = Array.from({ length: 9 }, (_, n) => {
  const col = n % 3;
  const row = Math.floor(n / 3);
  return {
    n,
    x: 100 + col * 96,
    y: 126 + row * 68,
    // Where the room starts: pushed outward from the centre of the plan, slightly rotated
    dx: (col - 1) * 170,
    dy: (row - 1) * 130,
    r: (n % 2 ? 1 : -1) * (6 + (n % 3) * 3),
  };
});
const DOORS = [
  { x: 190, y: 149, w: 4, h: 14 },
  { x: 286, y: 217, w: 4, h: 14 },
  { x: 233, y: 256, w: 14, h: 4 },
  { x: 142, y: 256, w: 14, h: 4 },
];

export function DomusMotion() {
  return (
    <svg viewBox="0 0 480 360" aria-hidden="true">
      {ROOMS.map((r) => (
        <rect
          key={r.n}
          className={styles.room}
          x={r.x}
          y={r.y}
          width={88}
          height={60}
          rx={4}
          style={
            {
              "--n": r.n,
              "--dx": `${r.dx}px`,
              "--dy": `${r.dy}px`,
              "--r": `${r.r}deg`,
              transformOrigin: `${r.x + 44}px ${r.y + 30}px`,
            } as React.CSSProperties
          }
        />
      ))}
      {DOORS.map((d, i) => (
        <rect
          key={i}
          className={styles.door}
          x={d.x}
          y={d.y}
          width={d.w}
          height={d.h}
        />
      ))}
      <path
        className={styles.house}
        pathLength={1}
        d="M84 332V112L240 26L396 112V332Z"
      />
    </svg>
  );
}

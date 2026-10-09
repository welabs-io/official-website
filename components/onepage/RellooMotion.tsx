// MOVIMENTO DO RELLOO: CONVERSAS QUE VIRAM OS DOIS "O"
// Logic of the opening: message chips dock into the cards of two contact groups, then two rings close around the groups
// and slide together into the overlapping pair (white over amber) of the Relloo sign.
import styles from "./relloo.module.css";

const CARDS = [
  { x: 90, y: 136 },
  { x: 270, y: 136 },
];
// Chips dock into the lower part of their card; they start off to the side and above
const CHIPS = [
  { x: 98, y: 190, dx: -240, dy: -70, amber: true },
  { x: 152, y: 190, dx: -240, dy: 40, amber: false },
  { x: 278, y: 190, dx: 240, dy: -70, amber: false },
  { x: 332, y: 190, dx: 240, dy: 40, amber: true },
];

export function RellooMotion() {
  return (
    <svg viewBox="0 0 480 360" aria-hidden="true">
      {/* Rings first (behind the cards): amber below, white on top */}
      <circle
        className={`${styles.ring} ${styles.ringAmber}`}
        cx={295}
        cy={180}
        r={60}
      />
      <circle
        className={`${styles.ring} ${styles.ringWhite}`}
        cx={185}
        cy={180}
        r={60}
      />
      {CARDS.map((c) => (
        <g
          key={c.x}
          className={styles.card}
          style={{ transformOrigin: `${c.x + 60}px ${c.y + 44}px` }}
        >
          <rect x={c.x} y={c.y} width={120} height={88} rx={8} />
          <circle
            className={styles.avatar}
            cx={c.x + 24}
            cy={c.y + 24}
            r={11}
          />
          <rect
            className={styles.text}
            x={c.x + 44}
            y={c.y + 17}
            width={60}
            height={6}
            rx={3}
          />
          <rect
            className={styles.text}
            x={c.x + 44}
            y={c.y + 29}
            width={36}
            height={6}
            rx={3}
          />
        </g>
      ))}
      {CHIPS.map((c, n) => (
        <rect
          key={n}
          className={`${styles.chip} ${c.amber ? styles.chipAmber : styles.chipInk}`}
          x={c.x}
          y={c.y}
          width={48}
          height={24}
          rx={12}
          style={
            {
              "--n": n,
              "--dx": `${c.dx}px`,
              "--dy": `${c.dy}px`,
              transformOrigin: `${c.x + 24}px ${c.y + 12}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}

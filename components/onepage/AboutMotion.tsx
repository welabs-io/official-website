// MOVIMENTO DA WELABS: CINCO PRODUTOS EM ÓRBITA
// One dot per product on a ring around an amber core, turning slowly. Pure SVG + CSS.
import styles from "./about.module.css";

const DOTS = Array.from({ length: 5 }, (_, i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180);
  return {
    i,
    x: 240 + 110 * Math.cos(angle),
    y: 180 + 110 * Math.sin(angle),
  };
});

export function AboutMotion() {
  return (
    <svg viewBox="0 0 480 360" aria-hidden="true">
      <circle className={styles.orbit} cx={240} cy={180} r={110} />
      <circle className={styles.core} cx={240} cy={180} r={16} />
      <g className={styles.spin}>
        {DOTS.map((d) => (
          <circle
            key={d.i}
            className={d.i === 0 ? styles.hot : styles.dot}
            cx={d.x}
            cy={d.y}
            r={10}
          />
        ))}
      </g>
    </svg>
  );
}

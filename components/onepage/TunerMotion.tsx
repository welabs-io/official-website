// MOVIMENTO DO TUNER: ONDAS QUE ENTRAM EM SINTONIA
// Logic of the opening: several waves, out of phase and amplitude, tune into one. The sine has a period of 80 units, so
// a shift of one period at the end of the cycle is invisible and the tuned wave keeps flowing.
import styles from "./tuner.module.css";

const A = 62;
// Sine drawn with quadratic segments of half a period (40 units); T repeats the mirrored control point
const SINE =
  `M-80 180Q-60 ${180 - 2 * A} -40 180` +
  Array.from({ length: 15 }, (_, i) => ` T${40 * i} 180`).join("");

const WAVES = [
  { tx: 17, sy: 0.35, tuned: false },
  { tx: -33, sy: 1.5, tuned: false },
  { tx: 50, sy: -0.8, tuned: false },
  { tx: 8, sy: 0.6, tuned: true },
];

export function TunerMotion() {
  return (
    <svg
      viewBox="0 0 480 360"
      aria-hidden="true"
      style={{
        overflow: "hidden",
        // Soft edges: the waves run off the stage on both sides
        maskImage:
          "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)",
      }}
    >
      {WAVES.map((w, i) => (
        <path
          key={i}
          className={`${styles.wave} ${w.tuned ? styles.tuned : ""}`}
          d={SINE}
          style={{ "--tx": `${w.tx}px`, "--sy": w.sy } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}

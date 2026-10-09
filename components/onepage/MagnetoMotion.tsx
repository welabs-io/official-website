// MOVIMENTO DO MAGNETO: ÍMÃS EM C E FLUXO
// Logic of the opening: two magnets in C attract along dashed field lines and snap (amber flash); the pair then rises
// and a row of connected blocks, the workflow, runs under it.
import styles from "./magneto.module.css";

const FIELD_Y = [150, 165, 180, 195, 210];
const BLOCKS = [96, 200, 304];

export function MagnetoMotion() {
  return (
    <svg viewBox="0 0 480 360" aria-hidden="true">
      <g className={styles.pair}>
        {FIELD_Y.map((y) => (
          <line
            key={y}
            className={styles.field}
            x1={232}
            x2={248}
            y1={y}
            y2={y}
          />
        ))}
        <g className={styles.left}>
          <path
            className={styles.magnet}
            d="M232 130H202A50 50 0 0 0 202 230H232"
          />
          <rect
            className={styles.pole}
            x={222}
            y={119}
            width={10}
            height={22}
          />
          <rect
            className={styles.pole}
            x={222}
            y={219}
            width={10}
            height={22}
          />
        </g>
        <g className={styles.right}>
          <path
            className={styles.magnet}
            d="M248 130H278A50 50 0 0 1 278 230H248"
          />
          <rect
            className={styles.pole}
            x={248}
            y={119}
            width={10}
            height={22}
          />
          <rect
            className={styles.pole}
            x={248}
            y={219}
            width={10}
            height={22}
          />
        </g>
        <circle className={styles.flash} cx={240} cy={180} r={40} />
      </g>
      <g className={styles.flow}>
        {BLOCKS.map((x) => (
          <g key={x}>
            <rect
              className={styles.block}
              x={x}
              y={244}
              width={80}
              height={44}
              rx={6}
            />
            <rect
              className={styles.bar}
              x={x + 12}
              y={260}
              width={40}
              height={6}
              rx={3}
            />
            <rect
              className={styles.bar}
              x={x + 12}
              y={272}
              width={24}
              height={6}
              rx={3}
            />
          </g>
        ))}
        <path className={styles.link} pathLength={1} d="M176 266H200" />
        <path className={styles.link} pathLength={1} d="M280 266H304" />
        <circle className={styles.dot} cx={136} cy={266} r={5} />
      </g>
    </svg>
  );
}

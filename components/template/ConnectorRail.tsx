// TRECHO DO FIO NO FUNDO DA SEÇÃO
// The stretch of the page thread between the content of a section and its bottom edge, where the pulse of the section
// goes down to the dock of the next one. Two variants, server markup only, hidden from assistive technology:
//  - "drop": one stretch on the axis; the pulse restarts when `data-pulse` flips between "a" and "b" (two identical
//    keyframes with different names), which scene-run does on every swap of the stage of the section;
//  - "converge": three stretches at 1/6, 1/2 and 5/6 of the content width (the columns of the vertical connector block)
//    that run down past the section and end in a dock each on top of the strip of the closing; a loop of its own, with
//    one pulse per stretch, runs while the section is on screen.
// Nothing is drawn under reduced motion.
import styles from "@/components/onepage/shell.module.css";

export function ConnectorRail({
  variant,
  delay = 0,
}: {
  variant: "drop" | "converge";
  // Seconds between the swap and the start of the pulse (the chain waits for its bus to fill)
  delay?: number;
}) {
  if (variant === "converge")
    return (
      <span
        className={`${styles.rail} ${styles.converge}`}
        data-rail="converge"
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={styles.track}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className={styles.clip}>
              <i className={styles.pulse} />
            </span>
            <b className={styles.dock} />
          </span>
        ))}
      </span>
    );
  return (
    <span
      className={styles.rail}
      data-rail="drop"
      data-pulse="idle"
      aria-hidden="true"
      style={{ "--rail-delay": `${delay}s` } as React.CSSProperties}
    >
      <i className={styles.pulse} />
    </span>
  );
}

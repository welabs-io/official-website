// TRECHO DO FIO NO FUNDO DA SEÇÃO
// The stretch of the page thread between the content of a section and its bottom edge, where the pulse of the section
// goes down to the dock of the next one. Server markup only: the pulse is restarted by flipping `data-pulse`
// ("a" and "b" run two identical keyframes with different names), which ring-run does on every swap of the ring of the
// section. Hidden from assistive technology; nothing is drawn under reduced motion.
import styles from "@/components/onepage/shell.module.css";

export function ConnectorRail({
  variant,
  delay = 0,
}: {
  variant: "drop" | "converge";
  // Seconds between the swap and the start of the pulse (the chain waits for its bus to fill)
  delay?: number;
}) {
  return (
    <span
      className={styles.rail}
      data-rail={variant}
      data-pulse="idle"
      aria-hidden="true"
      style={{ "--rail-delay": `${delay}s` } as React.CSSProperties}
    >
      <i className={styles.pulse} />
    </span>
  );
}

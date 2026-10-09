// HUB NÚCLEO E TRILHOS VIVO
// Domus and Relloo fitted as the core; Magneto, Tuner and Knowly as rails that cross it. A 10 s cycle lights one
// node per 2 s in weight order and a pulse runs along each rail on its turn. Pure CSS: the page sets
// data-motion="paused" (user choice or reduced motion) on the root and every animation is removed, leaving a static frame.
import styles from "./onepage.module.css";

const LOGO = (name: string) =>
  `/brands/welabs/products/${name}-dark-endorsed.svg`;

const CORE = [
  { name: "Domus", file: "domus", verb: "define" },
  { name: "Relloo", file: "relloo", verb: "atende" },
];
const RAILS = [
  {
    name: "Magneto",
    file: "magneto",
    verb: "workflow",
    wire: "regra → ← recibo",
  },
  { name: "Tuner", file: "tuner", verb: "entrega", wire: "avisos e conversas" },
  {
    name: "Knowly",
    file: "knowly",
    verb: "explica",
    wire: "dados e quem pode ver",
  },
];

export function HubLive() {
  return (
    <div
      className={styles.hub}
      role="img"
      aria-label="Domus e Relloo no núcleo. Magneto, Tuner e Knowly como trilhos que cruzam o núcleo."
    >
      <div className={styles.hubRails}>
        {RAILS.map((r, n) => (
          <div
            key={r.file}
            className={styles.rail}
            style={{ "--i": n + 2 } as React.CSSProperties}
          >
            <span className={styles.railHead}>
              <img src={LOGO(r.file)} alt="" width={1005} height={550} />
              <span>{r.verb}</span>
            </span>
            <span className={styles.railLine}>
              <i className={`${styles.pulse} ${styles.anim}`} />
            </span>
            <span className={styles.railWire}>{r.wire}</span>
          </div>
        ))}
      </div>
      <div className={styles.hubCore}>
        {CORE.map((c, n) => (
          <div
            key={c.file}
            className={`${styles.coreNode} ${styles.anim}`}
            style={{ "--i": n } as React.CSSProperties}
          >
            <span className={styles.coreVerb}>
              {c.name} {c.verb}
            </span>
            <img src={LOGO(c.file)} alt="" width={1005} height={550} />
          </div>
        ))}
        <span className={styles.seam}>contatos e pedidos</span>
      </div>
    </div>
  );
}

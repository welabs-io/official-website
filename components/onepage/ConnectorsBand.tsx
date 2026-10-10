// SEÇÃO 3: CONECTORES
// The relation of the products on a graphite band: core (Domus, Relloo), rails (Magneto, Tuner, Knowly) and the pulses
// that travel along them. No visible text; the logos lead to the product pages.
import { Connectors } from "./Connectors";
import styles from "./home.module.css";
import shell from "./shell.module.css";

export function ConnectorsBand() {
  return (
    <section
      id="connectors"
      className={`${shell.band} ${shell.dark} ${styles.connectors}`}
      data-live
      data-on="false"
    >
      <h2 className={styles.srOnly}>Produtos ligados entre si</h2>
      <div className={shell.wrap}>
        <Connectors tone="dark" />
      </div>
    </section>
  );
}

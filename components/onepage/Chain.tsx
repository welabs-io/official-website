// SEÇÃO 1: CADEIA
// The chain carousel: cuts of the product films in a circular carousel with a 1 s hold before each rotation and the row
// of product logos that lights up with the active cut. No title text and no slogan; the section sits right under the
// fixed header. The cover of the first cut is the largest image of the first paint, so it loads eagerly.
import { RingStage } from "@/components/ring/RingStage";
import styles from "./home.module.css";
import shell from "./shell.module.css";

export function Chain() {
  return (
    <section
      id="chain"
      className={`${shell.band} ${shell.dark} ${styles.chain}`}
      data-live
      data-on="false"
    >
      <h2 className={styles.srOnly}>Cadeia</h2>
      <div className={shell.wrap}>
        <RingStage
          id="chain-ring"
          kind="chain"
          logos="lit"
          eager
          label="Cortes dos filmes dos produtos"
        />
      </div>
    </section>
  );
}

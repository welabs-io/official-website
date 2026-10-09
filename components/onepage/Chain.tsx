// SEÇÃO 1: CADEIA
// The chain carousel of the workbench (components/lab/ChainSequence), inline: cuts of the product films in a circular
// carousel with a 1 s hold before each rotation and the row of product logos that lights up with the active cut. No
// title text and no slogan; the section sits right under the fixed header.
import { ChainSequence } from "@/components/lab/ChainSequence";
import styles from "./home.module.css";
import shell from "./shell.module.css";

export function Chain() {
  return (
    <section
      id="chain"
      className={`${shell.band} ${shell.dark} ${styles.chain}`}
    >
      <h2 className={styles.srOnly}>Cadeia</h2>
      <div className={shell.wrap}>
        <ChainSequence inline />
      </div>
    </section>
  );
}

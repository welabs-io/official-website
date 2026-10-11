// SEÇÃO 1: CADEIA
// One living demonstration explains the shared operation; its architecture remains visible below the film.
// The contextual heading stays readable independently of the scaled motion and reduced-motion preference.
import { RingStage } from "@/components/ring/RingStage";
import { Connectors } from "./Connectors";
import styles from "./home.module.css";
import shell from "./shell.module.css";

export function Chain() {
  return (
    <section
      id="chain"
      aria-labelledby="chain-heading"
      className={`${shell.band} ${shell.dark} ${styles.chain}`}
      data-live
      data-on="false"
    >
      <div className={shell.wrap}>
        <div className={styles.chainGrid}>
          <div className={styles.chainIntro}>
            <h1 id="chain-heading" className={styles.heroTitle}>
              Gestão, atendimento
              <br />e automação.
            </h1>
            <p className={styles.heroDescription}>
              Domus e Relloo no núcleo. Workflows, canais e conhecimento em toda
              a operação.
            </p>
            <a href="#products" className={styles.explore}>
              Explorar produtos
            </a>
          </div>
          <RingStage
            id="chain-ring"
            kind="chain"
            presentation="single"
            caption={false}
            navigation={false}
            eager
            label="Funcionamento conjunto dos produtos"
          />
        </div>
        <div className={styles.architecture}>
          <Connectors tone="dark" compact />
        </div>
      </div>
    </section>
  );
}

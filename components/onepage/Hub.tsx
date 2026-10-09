// SEÇÃO 1: HUB VIVO
// Domus and Relloo fitted as the core; Magneto, Tuner and Knowly as rails that cross it. The pulses are the only
// movement; the rail of Tuner sits on the page centre and continues into the next section as the amber connector.
import { HERO_LINE, productLogo } from "@/lib/products";
import { Connector } from "./Connector";
import { MotionStage } from "./MotionStage";
import shell from "./shell.module.css";
import styles from "./hub.module.css";

const RAILS = [
  { slug: "magneto", name: "Magneto" },
  { slug: "tuner", name: "Tuner" },
  { slug: "knowly", name: "Knowly" },
] as const;
const CORE = [
  { slug: "domus", name: "Domus" },
  { slug: "relloo", name: "Relloo" },
] as const;

export function Hub() {
  return (
    <section id="top" className={`${shell.band} ${shell.dark} ${styles.hero}`}>
      <div className={shell.wrap}>
        <h1 className={styles.heroTitle}>{HERO_LINE}</h1>
        <div
          id="products"
          role="img"
          aria-label="Domus e Relloo no núcleo, Magneto, Tuner e Knowly nos trilhos"
        >
          <MotionStage id="hub" className={styles.hub}>
            <div className={styles.rails}>
              {RAILS.map((r, n) => (
                <div
                  key={r.slug}
                  className={styles.rail}
                  style={{ "--i": n } as React.CSSProperties}
                >
                  <span className={styles.track}>
                    <i className={styles.pulse} />
                  </span>
                  <img
                    className={styles.railLogo}
                    src={productLogo(r.slug, "dark")}
                    alt=""
                    width={1005}
                    height={550}
                  />
                </div>
              ))}
            </div>
            <div className={styles.core}>
              <img
                className={styles.coreLogo}
                src={productLogo(CORE[0].slug, "dark")}
                alt=""
                width={1005}
                height={550}
              />
              <span className={styles.seam} />
              <img
                className={styles.coreLogo}
                src={productLogo(CORE[1].slug, "dark")}
                alt=""
                width={1005}
                height={550}
              />
            </div>
          </MotionStage>
        </div>
      </div>
      <Connector />
    </section>
  );
}

// SEÇÃO 1: TOPO E CADEIA
// Short title, one supporting line and the call to action, tight against a circular ring with the chain montage: clips
// of the product films at 2.5x in the order that tells how it all works (no opening), swapping places as each one ends.
import { MONTAGE_SLIDES, MONTAGE_SWAP } from "@/lib/motion-slides";
import { CTA_LABEL, HERO_LINE, HERO_TITLE } from "@/lib/products";
import { CONTACT_HREF } from "./contact";
import { Ring } from "./Ring";
import styles from "./home.module.css";
import shell from "./shell.module.css";

export function Hero() {
  return (
    <section
      id="chain"
      className={`${shell.band} ${shell.dark} ${styles.hero}`}
    >
      <div className={`${shell.wrap} ${styles.heroText}`}>
        <h1 className={shell.title}>{HERO_TITLE}</h1>
        <p className={shell.line}>{HERO_LINE}</p>
        <a href={CONTACT_HREF} className={`${shell.cta} ${shell.ctaBig}`}>
          {CTA_LABEL}
        </a>
      </div>
      <div className={`${shell.wrap} ${styles.heroRing}`}>
        <Ring
          id="chain"
          label="Como os produtos trabalham juntos"
          slides={MONTAGE_SLIDES}
          swap={MONTAGE_SWAP}
          ahead={2}
          eager
        />
      </div>
    </section>
  );
}

// SEÇÃO 5: PLATAFORMAS E FECHAMENTO
// A black-and-white band with the platforms and tools we work with, then the closing button. The footer comes after it
// (PageFrame).
import { PLATFORM_LOGOS, PLATFORMS_LABEL } from "@/lib/partners";
import { CTA_LABEL } from "@/lib/products";
import { Carousel } from "./Carousel";
import { CONTACT_HREF } from "./contact";
import styles from "./home.module.css";
import shell from "./shell.module.css";

export function Closing() {
  return (
    <section
      id="platforms"
      className={`${shell.band} ${shell.dark} ${styles.closing}`}
    >
      <div className={shell.wrap}>
        <Carousel
          label={PLATFORMS_LABEL}
          logos={PLATFORM_LOGOS}
          kind="platforms"
          tone="dark"
          seconds={60}
        />
      </div>
      <div id="contact" className={styles.contact}>
        <a href={CONTACT_HREF} className={`${shell.cta} ${shell.ctaBig}`}>
          {CTA_LABEL}
        </a>
      </div>
    </section>
  );
}

// SEÇÃO 3: FECHAMENTO
// Who we serve and the platforms we work with, together on one graphite band, in the same black-and-white theme: two
// looping strips, one under the other with no extra space between them, then the closing button. The footer comes
// after it (PageFrame).
import {
  CLIENT_LOGOS,
  CLIENTS_LABEL,
  PLATFORM_LOGOS,
  PLATFORMS_LABEL,
} from "@/lib/partners";
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
      <div className={`${shell.wrap} ${styles.strips}`}>
        <Carousel
          label={CLIENTS_LABEL}
          logos={CLIENT_LOGOS}
          kind="clients"
          seconds={40}
        />
        <Carousel
          label={PLATFORMS_LABEL}
          logos={PLATFORM_LOGOS}
          kind="platforms"
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

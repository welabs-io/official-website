// FECHAMENTO
// Two strips of black-and-white logos, each under a short title (who already operates with us, where we run), then the
// closing button. The section around it (id, graphite band) comes from Section; the footer comes after it (PageFrame).
import { Carousel } from "@/components/onepage/Carousel";
import { CONTACT_HREF } from "@/components/onepage/contact";
import styles from "@/components/onepage/home.module.css";
import shell from "@/components/onepage/shell.module.css";
import { CLOSING, HOME_SECTIONS } from "@/lib/content";
import { CLIENT_LOGOS, PLATFORM_LOGOS } from "@/lib/partners";
import { CTA_LABEL } from "@/lib/products";
import content from "./content.module.css";
import { SectionHead } from "./SectionHead";

export function Closing() {
  return (
    <>
      <div className={`${shell.wrap} ${styles.strips}`}>
        <div
          role="group"
          aria-labelledby="strip-clients"
          className={styles.strip}
        >
          <h2 id="strip-clients" className={content.stripTitle}>
            {CLOSING.clients}
          </h2>
          <Carousel
            label="Marcas de quem opera com a Welabs"
            logos={CLIENT_LOGOS}
            kind="all"
            seconds={45}
          />
        </div>
        <div
          role="group"
          aria-labelledby="strip-platforms"
          className={styles.strip}
        >
          <h2 id="strip-platforms" className={content.stripTitle}>
            {CLOSING.platforms}
          </h2>
          <Carousel
            label="Plataformas de infraestrutura e desenvolvimento"
            logos={PLATFORM_LOGOS}
            kind="all"
            seconds={55}
          />
        </div>
      </div>
      {/* Contact: the title, the line the operator chose and the button; no address is published yet, so the button is
          the only way in */}
      <div id="contact" className={`${styles.contact} ${styles.thread}`}>
        <div className={styles.contactBox}>
          <SectionHead
            title={HOME_SECTIONS.contact.title}
            lead={HOME_SECTIONS.contact.lead}
          />
          <a href={CONTACT_HREF} className={`${shell.cta} ${shell.ctaBig}`}>
            {CTA_LABEL}
          </a>
        </div>
      </div>
    </>
  );
}

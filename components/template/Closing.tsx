// FECHAMENTO
// One strip of black-and-white platform logos under a short title (where we run), then the closing button. Client logos
// were removed on 2026-10-20: the operator decided the Welabs site shows no client brand that would need consent. The
// section around it (id, graphite band) comes from Section; the footer comes after it (PageFrame).
import { Carousel } from "@/components/onepage/Carousel";
import { CONTACT_HREF } from "@/components/onepage/contact";
import styles from "@/components/onepage/home.module.css";
import shell from "@/components/onepage/shell.module.css";
import { CLOSING, HOME_SECTIONS } from "@/lib/content";
import { PLATFORM_LOGOS } from "@/lib/partners";
import { CTA_LABEL } from "@/lib/products";
import content from "./content.module.css";
import { SectionHead } from "./SectionHead";

export function Closing() {
  return (
    <>
      <div className={`${shell.wrap} ${styles.strips}`}>
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

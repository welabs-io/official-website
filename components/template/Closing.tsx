// FECHAMENTO
// Logos of the companies we work with and of the infrastructure and development platforms, together in ONE continuous
// strip, all in the same black-and-white theme (no labels), then the closing button. The section around it (id,
// graphite band) comes from Section; the footer comes after it (PageFrame).
import { Carousel } from "@/components/onepage/Carousel";
import { CONTACT_HREF } from "@/components/onepage/contact";
import styles from "@/components/onepage/home.module.css";
import shell from "@/components/onepage/shell.module.css";
import { CLIENT_LOGOS, PLATFORM_LOGOS } from "@/lib/partners";
import { CTA_LABEL } from "@/lib/products";

// Both lists interleaved, so the strip alternates between the two kinds of mark
const LOGOS = Array.from(
  { length: Math.max(CLIENT_LOGOS.length, PLATFORM_LOGOS.length) },
  (_, i) => [CLIENT_LOGOS[i], PLATFORM_LOGOS[i]],
)
  .flat()
  .filter((logo) => logo !== undefined);

export function Closing() {
  return (
    <>
      <div className={`${shell.wrap} ${styles.strips}`}>
        <Carousel
          label="Marcas e plataformas"
          logos={LOGOS}
          kind="all"
          seconds={70}
        />
      </div>
      <div id="contact" className={`${styles.contact} ${styles.thread}`}>
        <a href={CONTACT_HREF} className={`${shell.cta} ${shell.ctaBig}`}>
          {CTA_LABEL}
        </a>
      </div>
    </>
  );
}

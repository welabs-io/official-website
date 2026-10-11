// FECHAMENTO E CONTATO REAL
// The destination is published by the company; product context is carried into the email draft, never sent automatically.
import { productBySlug, type ProductSlug } from "@/lib/products";
import { CONTACT_EMAIL } from "@/components/onepage/contact";
import { EmailCopy } from "./EmailCopy";
import styles from "./site.module.css";

export function ContactSection({ product }: { product?: ProductSlug }) {
  const subject = product
    ? `Conhecer ${productBySlug(product)!.name} by Welabs`
    : "Conversar sobre a minha operação";
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  return (
    <section
      id="contact"
      className={styles.contact}
      aria-labelledby="contact-heading"
    >
      <div className={`${styles.wrap} ${styles.contactGrid}`}>
        <div>
          <h2 id="contact-heading">
            Qual é o próximo passo
            <br />
            da sua operação?
          </h2>
          <p>
            Conte onde o trabalho precisa fluir melhor.
            <br />A conversa começa pela sua realidade.
          </p>
          <a href={href} className={styles.primaryDark}>
            Conversar com a Welabs
          </a>
        </div>
        <div className={styles.contactAddress}>
          <span>Fale diretamente com a Welabs</span>
          <a href={href}>{CONTACT_EMAIL}</a>
          <EmailCopy />
        </div>
      </div>
    </section>
  );
}

// PÁGINA NÃO ENCONTRADA
// Unknown routes retain company navigation and a direct path back to the product overview.
import Link from "next/link";
import { SiteFrame } from "@/components/site/SiteFrame";
import styles from "@/components/site/site.module.css";

export default function NotFound() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.notFound}`}>
        <h1>Não encontramos essa página.</h1>
        <p>Os produtos e a operação da Welabs estão no início do site.</p>
        <Link href="/" className={styles.primary} prefetch={false}>
          Ir para o início
        </Link>
      </section>
    </SiteFrame>
  );
}

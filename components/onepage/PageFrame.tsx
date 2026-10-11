// MOLDURA DA PÁGINA
// The fixed header separates the shared demonstration from product exploration with plain anchor navigation.
// The approved contact destination is shared with every product page.
import Link from "next/link";
import { CTA_LABEL, WELABS_LOGO } from "@/lib/products";
import { CONTACT_HREF } from "./contact";
import { LiveObserver } from "./LiveObserver";
import styles from "./shell.module.css";

function Header({ home }: { home: boolean }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link
          href={home ? "#top" : "/"}
          prefetch={false}
          className={styles.brand}
          aria-label="Welabs, início"
        >
          <img src={WELABS_LOGO.dark} alt="Welabs" height={42} />
        </Link>
        <nav className={styles.navigation} aria-label="Navegação principal">
          <a href={home ? "#chain" : "/#chain"}>Como funciona</a>
          <a href={home ? "#products" : "/#products"}>Produtos</a>
        </nav>
        <a href={CONTACT_HREF} className={styles.cta}>
          {CTA_LABEL}
        </a>
      </div>
    </header>
  );
}

// RODAPÉ
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.wrap} ${styles.footerGrid}`}>
        <img src={WELABS_LOGO.dark} alt="Welabs" height={28} />
        <p>© 2026 Welabs</p>
      </div>
    </footer>
  );
}

export function PageFrame({
  home = false,
  children,
}: {
  home?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div id="top" className={styles.page}>
      <Header home={home} />
      {children}
      <Footer />
      <LiveObserver />
    </div>
  );
}

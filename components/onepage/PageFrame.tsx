// MOLDURA DA PÁGINA
// Fixed header (logo and the single call to action) and the footer. The call to action always points to the contact
// section of the home; the contact destination is still to be decided by the operator.
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
          className={styles.brand}
          aria-label="Welabs, início"
        >
          <img src={WELABS_LOGO.dark} alt="Welabs" height={42} />
        </Link>
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

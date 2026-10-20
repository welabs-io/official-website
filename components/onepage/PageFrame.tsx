// MOLDURA DA PÁGINA
// Fixed header (logo that leads to the home, the menu and the call to action) and the footer. The call to action always
// points to the contact section of the home; the contact destination is still to be decided by the operator.
import Link from "next/link";
import { FOOTER_NAV_LABEL, NAV } from "@/lib/content";
import { CTA_LABEL, PRODUCTS, WELABS_LOGO, productLogo } from "@/lib/products";
import { CONTACT_HREF } from "./contact";
import { LiveObserver } from "./LiveObserver";
import { SiteNav } from "./SiteNav";
import styles from "./shell.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* The logo leads to the home on every page, the home itself included */}
        <Link
          href="/"
          prefetch={false}
          className={styles.brand}
          aria-label="Welabs, início"
        >
          <img src={WELABS_LOGO.light} alt="Welabs" height={42} />
        </Link>
        <SiteNav
          NAV={NAV}
          products={PRODUCTS.map(({ slug, name, line }) => ({
            slug,
            name,
            line,
            logo: productLogo(slug, "light", "row"),
          }))}
          cta={CTA_LABEL}
          contactHref={CONTACT_HREF}
        />
        <a href={CONTACT_HREF} className={`${styles.cta} ${styles.headerCta}`}>
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
        <nav aria-label={FOOTER_NAV_LABEL}>
          <ul className={styles.footerLinks}>
            {PRODUCTS.map(({ slug, name }) => (
              <li key={slug}>
                <Link href={`/products/${slug}`} prefetch={false}>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p>© 2026 Welabs</p>
      </div>
    </footer>
  );
}

export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div id="top" className={styles.page}>
      <Header />
      {children}
      <Footer />
      <LiveObserver />
    </div>
  );
}

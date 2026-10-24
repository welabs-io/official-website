// MOLDURA DA PÁGINA
// Fixed header (logo that leads to the home, the menu and the call to action) and the footer. The call to action always
// points to the contact section of the home; the contact destination is still to be decided by the operator.
import Link from "next/link";
import { FOOTER_NAV_LABEL, NAV } from "@/lib/content";
import { CTA_LABEL, PRODUCTS, WELABS_LOGO, productLogo } from "@/lib/products";
import { CONTACT_HREF } from "./contact";
import { LiveObserver } from "./LiveObserver";
import { ProductEntry } from "./ProductEntry";
import { SiteNav } from "./SiteNav";
import styles from "./shell.module.css";

// The five entries of the navigation, with the logo file for the band they sit on (light header, graphite footer)
const productEntries = (tone: "light" | "dark") =>
  PRODUCTS.map(({ slug, name, line }) => ({
    slug,
    name,
    line,
    logo: productLogo(slug, tone, "row"),
  }));

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
          products={productEntries("light")}
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
// The products are the entries of the header's menu (ProductEntry: the official logo), in the dark logo files of the
// graphite band and without their line (the word budget of each page counts the frame); the bare names they replaced
// showed no brand (operator, 2026-10-24)
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.wrap} ${styles.footerGrid}`}>
        <img src={WELABS_LOGO.dark} alt="Welabs" height={28} />
        <nav aria-label={FOOTER_NAV_LABEL}>
          <ul className={styles.footerLinks}>
            {productEntries("dark").map((product) => (
              <li key={product.slug}>
                <ProductEntry product={product} line={false} />
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

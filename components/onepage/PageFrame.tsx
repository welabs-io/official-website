// MOLDURA DA PÁGINA
// Fixed header (logo that leads to the home, the menu, the language selector and the call to action) and the footer.
// The call to action always points to the contact section of the home; the contact destination is still to be decided
// by the operator. Every address and text is in the locale of the page (`i18n`).
import Link from "next/link";
import { href, type I18n } from "@/lib/i18n/i18n";
import { PRODUCTS, WELABS_LOGO, productLogo } from "@/lib/products";
import { CONTACT_PATH } from "./contact";
import { LiveObserver } from "./LiveObserver";
import { LocaleMenu } from "./LocaleMenu";
import { ProductEntry } from "./ProductEntry";
import { SiteNav } from "./SiteNav";
import styles from "./shell.module.css";

// The five entries of the navigation, with the logo file for the band they sit on (light header, graphite footer) and
// the line in the locale of the page
const productEntries = (i18n: I18n, tone: "light" | "dark") =>
  PRODUCTS.map(({ slug, name }) => ({
    slug,
    name,
    line: i18n.m.products[slug].line,
    logo: productLogo(slug, tone, "row"),
  }));

function Header({ i18n }: { i18n: I18n }) {
  const { m } = i18n;
  const contactHref = href(i18n, CONTACT_PATH);
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* The logo leads to the home on every page, the home itself included */}
        <Link
          href={href(i18n, "/")}
          prefetch={false}
          className={styles.brand}
          aria-label={m.common.homeLabel}
        >
          <img src={WELABS_LOGO.light} alt="Welabs" height={42} />
        </Link>
        <SiteNav
          products={productEntries(i18n, "light")}
          contactHref={contactHref}
        />
        <LocaleMenu />
        <a href={contactHref} className={`${styles.cta} ${styles.headerCta}`}>
          {m.common.cta}
        </a>
      </div>
    </header>
  );
}

// RODAPÉ
// The products are the entries of the header's menu (ProductEntry: the official logo), in the dark logo files of the
// graphite band and without their line (the word budget of each page counts the frame); the bare names they replaced
// showed no brand (operator, 2026-10-24)
function Footer({ i18n }: { i18n: I18n }) {
  const { m } = i18n;
  return (
    <footer className={styles.footer}>
      <div className={`${styles.wrap} ${styles.footerGrid}`}>
        <img src={WELABS_LOGO.dark} alt="Welabs" height={28} />
        <nav aria-label={m.common.footerNavLabel}>
          <ul className={styles.footerLinks}>
            {productEntries(i18n, "dark").map((product) => (
              <li key={product.slug}>
                <ProductEntry product={product} line={false} />
              </li>
            ))}
          </ul>
        </nav>
        <p>{m.common.copyright}</p>
      </div>
    </footer>
  );
}

export function PageFrame({
  i18n,
  children,
}: {
  i18n: I18n;
  children: React.ReactNode;
}) {
  return (
    <div id="top" className={styles.page}>
      <Header i18n={i18n} />
      {children}
      <Footer i18n={i18n} />
      <LiveObserver />
    </div>
  );
}

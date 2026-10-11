// MOLDURA DO SITE COMPLETO
// Navigation, contact and product routes share one editorial frame across the home and detail pages.
import Link from "next/link";
import { PRODUCTS, WELABS_LOGO } from "@/lib/products";
import { CONTACT_HREF, CONTACT_EMAIL } from "@/components/onepage/contact";
import { LiveObserver } from "@/components/onepage/LiveObserver";
import { MobileMenu } from "./MobileMenu";
import styles from "./site.module.css";

export function SiteFrame({
  home = false,
  children,
}: {
  home?: boolean;
  children: React.ReactNode;
}) {
  const anchor = (id: string) => `${home ? "" : "/"}#${id}`;
  return (
    <div className={styles.site} id="top">
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href={home ? "#top" : "/"}
            className={styles.brand}
            prefetch={false}
            aria-label="Welabs, início"
          >
            <img src={WELABS_LOGO.light} alt="Welabs" width={147} height={60} />
          </Link>
          <nav className={styles.navigation} aria-label="Navegação principal">
            <a href={anchor("products")}>Produtos</a>
            <a href={anchor("journey")}>Como funciona</a>
            <a href={anchor("platforms")}>Experiência</a>
          </nav>
          <a
            className={styles.headerCta}
            href={anchor("contact")}
            aria-label="Conversar com a Welabs"
          >
            <span className={styles.desktopLabel}>Conversar com a Welabs</span>
            <span className={styles.mobileLabel}>Conversar</span>
          </a>
          <MobileMenu home={home} />
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <img
                src={WELABS_LOGO.dark}
                alt="Welabs"
                width={147}
                height={60}
              />
              <p>
                Produtos próprios.
                <br />
                Trabalho em conjunto.
              </p>
              <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a>
            </div>
            <nav aria-label="Produtos no rodapé" className={styles.footerLinks}>
              <h2>Produtos</h2>
              {PRODUCTS.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  prefetch={false}
                >
                  {product.name}
                </Link>
              ))}
            </nav>
            <nav aria-label="Site no rodapé" className={styles.footerLinks}>
              <h2>Welabs</h2>
              <a href={anchor("journey")}>Como funciona</a>
              <a href={anchor("platforms")}>Marcas e tecnologia</a>
              <a href={anchor("contact")}>Contato</a>
            </nav>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2026 Welabs</p>
            <a href="#top">Voltar ao início</a>
          </div>
        </div>
      </footer>
      <LiveObserver />
    </div>
  );
}

"use client";
// MENU DO CABEÇALHO
// The navigation of every page: Produtos (a link to the products of the home with the five products in a list under it)
// and the Domus. On a desktop the list opens on hover and on keyboard focus (no state); on a phone the whole
// menu is a panel under the header, opened by a button. The panel closes on any link, on Escape and when the page
// changes, so it never stays open over a page the visitor already reached.
// The texts and the products come as props from the server (PageFrame), so no list of the site ships in this client
// module.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NAV as NavLabels } from "@/lib/content/home";
import styles from "./shell.module.css";

export function SiteNav({
  NAV,
  products,
  cta,
  contactHref,
}: {
  NAV: typeof NavLabels;
  products: readonly {
    slug: string;
    name: string;
    line: string;
    logo: string;
  }[];
  cta: string;
  contactHref: string;
}) {
  // Null outside the App Router (the tests render the page on its own)
  const pathname = usePathname() ?? "";
  // The panel is open for one path only: a change of page closes it without an effect
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const close = () => setOpenAt(null);
  return (
    <div
      className={styles.navWrap}
      onKeyDown={(event) => event.key === "Escape" && close()}
    >
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label={open ? NAV.close : NAV.open}
        onClick={() => setOpenAt(open ? null : pathname)}
      >
        <span className={styles.burger} aria-hidden="true" />
      </button>
      <nav
        id="site-nav"
        className={styles.nav}
        data-open={open ? "true" : "false"}
        aria-label={NAV.label}
      >
        <ul className={styles.navList}>
          <li className={styles.hasMenu}>
            <Link
              href="/#products"
              prefetch={false}
              className={styles.navLink}
              // v2.2 (audit M10): on the Domus page only "Domus" is the current entry, never both
              aria-current={
                pathname.startsWith("/products/") &&
                pathname !== "/products/domus"
                  ? "true"
                  : undefined
              }
              onClick={close}
            >
              {NAV.products}
            </Link>
            <ul className={styles.menu}>
              {products.map(({ slug, name, line, logo }) => (
                <li key={slug}>
                  <Link
                    href={`/products/${slug}`}
                    prefetch={false}
                    className={styles.menuLink}
                    aria-current={
                      pathname === `/products/${slug}` ? "page" : undefined
                    }
                    onClick={close}
                  >
                    {/* v2.1: the product is named by its logo, as in the selector at the top of a product */}
                    <img src={logo} alt={name} width={1005} height={550} />
                    <span>{line}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          {/* The Domus has an entry of its own: it is the centre the other products work on (v2) */}
          <li>
            <Link
              href="/products/domus"
              prefetch={false}
              className={styles.navLink}
              aria-current={pathname === "/products/domus" ? "page" : undefined}
              onClick={close}
            >
              {NAV.domus}
            </Link>
          </li>
        </ul>
        {/* On a very narrow phone the call to action of the header moves into the panel */}
        <a href={contactHref} className={`${styles.cta} ${styles.navCta}`}>
          {cta}
        </a>
      </nav>
    </div>
  );
}

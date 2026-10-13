"use client";
// MENU DO CABEÇALHO
// The navigation of every page: Produtos (a link to the products of the home with the five products in a list under it),
// Como funciona and Contato. On a desktop the list opens on hover and on keyboard focus (no state); on a phone the whole
// menu is a panel under the header, opened by a button. The panel closes on any link, on Escape and when the page
// changes, so it never stays open over a page the visitor already reached.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/lib/content";
import { CTA_LABEL, PRODUCTS } from "@/lib/products";
import { CONTACT_HREF } from "./contact";
import styles from "./shell.module.css";

export function SiteNav() {
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
              aria-current={
                pathname.startsWith("/products/") ? "true" : undefined
              }
              onClick={close}
            >
              {NAV.products}
            </Link>
            <ul className={styles.menu}>
              {PRODUCTS.map(({ slug, name, line }) => (
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
                    <b>{name}</b>
                    <span>{line}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <Link
              href="/#how"
              prefetch={false}
              className={styles.navLink}
              onClick={close}
            >
              {NAV.how}
            </Link>
          </li>
          <li>
            <Link
              href={CONTACT_HREF}
              prefetch={false}
              className={styles.navLink}
              onClick={close}
            >
              {NAV.contact}
            </Link>
          </li>
        </ul>
        {/* On a very narrow phone the call to action of the header moves into the panel */}
        <a href={CONTACT_HREF} className={`${styles.cta} ${styles.navCta}`}>
          {CTA_LABEL}
        </a>
      </nav>
    </div>
  );
}

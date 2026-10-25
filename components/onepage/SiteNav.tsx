"use client";
// MENU DO CABEÇALHO
// The navigation of every page: Produtos (a link to the products of the home with the five products in a list under it)
// and the Domus. On a desktop the list opens on hover and on keyboard focus (no state); on a phone the whole
// menu is a panel under the header, opened by a button. The panel closes on any link, on Escape and when the page
// changes, so it never stays open over a page the visitor already reached.
// The products come as props from the server (PageFrame), so no list of the site ships in this client module; the labels
// and the addresses come from the locale of the page (lib/i18n/provider.tsx), and the current page is read without the
// locale prefix (/en/products/domus is the Domus page like /products/domus).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { IconButton } from "@/components/lib/ui";
import { stripLocale } from "@/lib/i18n/config";
import { useHref, useMessages } from "@/lib/i18n/provider";
import { ProductEntry, type ProductEntryData } from "./ProductEntry";
import styles from "./shell.module.css";

export function SiteNav({
  products,
  contactHref,
}: {
  products: readonly ProductEntryData[];
  contactHref: string;
}) {
  const { nav, common } = useMessages();
  const href = useHref();
  // Null outside the App Router (the tests render the page on its own)
  const pathname = usePathname() ?? "";
  // The page without its locale prefix, to tell which entry is the current one
  const page = stripLocale(pathname);
  // The panel is open for one path only: a change of page closes it without an effect
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const close = () => setOpenAt(null);
  return (
    <div
      className={styles.navWrap}
      onKeyDown={(event) => event.key === "Escape" && close()}
    >
      {/* The site's IconButton (the secondary soft control of app/lib.css), Menu or X by state; the sheet only shows
          it on a phone. It was the lib's outline Button with a burger drawn by CSS. */}
      <IconButton
        icon={open ? <X /> : <Menu />}
        label={open ? nav.close : nav.open}
        data-theme="welabs"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpenAt(open ? null : pathname)}
      />
      <nav
        id="site-nav"
        className={styles.nav}
        data-open={open ? "true" : "false"}
        aria-label={nav.label}
      >
        <ul className={styles.navList}>
          <li className={styles.hasMenu}>
            <Link
              href={href("/#products")}
              prefetch={false}
              className={styles.navLink}
              // v2.2 (audit M10): on the Domus page only "Domus" is the current entry, never both
              aria-current={
                page.startsWith("/products/") && page !== "/products/domus"
                  ? "true"
                  : undefined
              }
              onClick={close}
            >
              {nav.products}
            </Link>
            <ul className={styles.menu}>
              {/* v2.1: the product is named by its logo, as in the selector at the top of a product; the entry is shared
                  with the footer (ProductEntry) */}
              {products.map((product) => (
                <li key={product.slug}>
                  <ProductEntry
                    product={product}
                    current={page === `/products/${product.slug}`}
                    onClick={close}
                  />
                </li>
              ))}
            </ul>
          </li>
          {/* The Domus has an entry of its own: it is the centre the other products work on (v2) */}
          <li>
            <Link
              href={href("/products/domus")}
              prefetch={false}
              className={styles.navLink}
              aria-current={page === "/products/domus" ? "page" : undefined}
              onClick={close}
            >
              {nav.domus}
            </Link>
          </li>
        </ul>
        {/* On a very narrow phone the call to action of the header moves into the panel */}
        <a href={contactHref} className={`${styles.cta} ${styles.navCta}`}>
          {common.cta}
        </a>
      </nav>
    </div>
  );
}

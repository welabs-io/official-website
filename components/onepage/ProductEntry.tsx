"use client";
// ENTRADA DE PRODUTO DA NAVEGAÇÃO
// One product the way the menu of the header names it (v2.1): its official logo (public/brands/welabs/products, never
// redrawn) and its line, the whole entry a link to the product page. The menu of the header (SiteNav) and the footer
// (PageFrame) render this same entry, so the two never drift apart; the tone of the logo file follows the band it sits
// on (the light file on the header's surface, the dark one on the graphite footer). The footer shows the logo alone
// (`line={false}`): the words of the frame count in the word budget of every page (components/template/site.test.tsx).
// i18n: the address is in the locale of the page (client piece, so the footer in a server page gets it from the provider).
import Link from "next/link";
import { useHref } from "@/lib/i18n/provider";
import styles from "./shell.module.css";

export type ProductEntryData = {
  slug: string;
  name: string;
  line: string;
  // The logo file for the band of the entry (productLogo of lib/products.ts)
  logo: string;
};

export function ProductEntry({
  product,
  current,
  line = true,
  onClick,
}: {
  product: ProductEntryData;
  // The entry of the page on screen (the menu of the header knows the path; the footer does not mark one)
  current?: boolean;
  // The line beside the logo (the header's menu); the logo alone otherwise
  line?: boolean;
  onClick?: () => void;
}) {
  const href = useHref();
  return (
    <Link
      href={href(`/products/${product.slug}`)}
      prefetch={false}
      className={styles.menuLink}
      aria-current={current ? "page" : undefined}
      data-product-entry={product.slug}
      onClick={onClick}
    >
      <img src={product.logo} alt={product.name} width={1005} height={550} />
      {line ? <span>{product.line}</span> : null}
    </Link>
  );
}

// CABEÇALHO DE PRODUTO
// Large logo (the identity highlight, so it carries the seal per endorsePolicy) and one factual line. The logo links
// to the product page except on that page itself.
import Link from "next/link";
import {
  LOGO_PAD,
  productAlt,
  productBySlug,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import styles from "./shell.module.css";

export function ProductBlock({
  slug,
  tone,
  link = true,
  heading = "h2",
  className,
  short,
}: {
  slug: ProductSlug;
  tone: "dark" | "light";
  link?: boolean;
  heading?: "h1" | "h2";
  className?: string;
  // The sentence of the opening of a product page, in place of the short line of the cards
  short?: string;
}) {
  const product = productBySlug(slug)!;
  const Heading = heading;
  const logo = (
    <img
      className={styles.logo}
      src={productLogo(slug, tone, "hero", 64)}
      alt={productAlt(slug, "hero")}
      width={1005}
      height={550}
      style={{ "--pad": LOGO_PAD[slug] } as React.CSSProperties}
    />
  );
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <Heading style={{ margin: 0, fontSize: "inherit", lineHeight: 0 }}>
        {link ? (
          <Link
            className={styles.logoLink}
            href={`/products/${slug}`}
            aria-label={productAlt(slug, "hero")}
          >
            {logo}
          </Link>
        ) : (
          logo
        )}
      </Heading>
      <p className={short ? styles.short : styles.line}>
        {short ?? product.line}
      </p>
    </div>
  );
}

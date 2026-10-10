// CABEÇALHO DE PRODUTO
// Logo with the "by welabs" seal and one factual line. The logo links to the product page except on that page itself.
import Link from "next/link";
import {
  LOGO_PAD,
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
}: {
  slug: ProductSlug;
  tone: "dark" | "light";
  link?: boolean;
  heading?: "h1" | "h2";
  className?: string;
}) {
  const product = productBySlug(slug)!;
  const Heading = heading;
  const logo = (
    <img
      className={styles.logo}
      src={productLogo(slug, tone)}
      alt={`${product.name} by Welabs`}
      width={1005}
      height={550}
      style={{ "--pad": LOGO_PAD[slug] } as React.CSSProperties}
    />
  );
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <Heading style={{ margin: 0, fontSize: "inherit", lineHeight: 0 }}>
        {link ? (
          <Link
            className={styles.logoLink}
            href={`/products/${slug}`}
            aria-label={`${product.name} by Welabs`}
          >
            {logo}
          </Link>
        ) : (
          logo
        )}
      </Heading>
      <p className={styles.line}>{product.line}</p>
    </div>
  );
}

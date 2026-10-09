// BLOCO DE PRODUTO
// Logo with the "by welabs" seal and one factual line on one side, the product's motion on the other. The logo links to
// the product page except on that page itself.
import Link from "next/link";
import { productBySlug, productLogo, type ProductSlug } from "@/lib/products";
import styles from "./shell.module.css";

export function ProductBlock({
  slug,
  tone,
  flip = false,
  link = true,
  heading = "h2",
  children,
}: {
  slug: ProductSlug;
  tone: "dark" | "light";
  flip?: boolean;
  link?: boolean;
  heading?: "h1" | "h2";
  children: React.ReactNode;
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
    />
  );
  return (
    <div className={`${styles.block} ${flip ? styles.flip : ""}`}>
      <div className={styles.blockText}>
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
      {children}
    </div>
  );
}

"use client";
// SEÇÃO 2: PRODUTOS
// The five products in a circular ring, in weight order (Domus, Relloo, Magneto, Tuner, Knowly). Each one enters with
// the last seconds of its opening, the part that forms the logo, which flows straight into a clip of its film. Under
// the active frame: the logo with the seal (a link to the product page) and one factual line.
import Link from "next/link";
import { PRODUCT_SLIDES, type Slide } from "@/lib/motion-slides";
import {
  LOGO_PAD,
  productBySlug,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import { Ring } from "./Ring";
import styles from "./home.module.css";
import shell from "./shell.module.css";

function Caption({ slide }: { slide: Slide }) {
  const product = productBySlug(slide.slug as ProductSlug)!;
  return (
    <>
      <Link
        href={`/products/${product.slug}`}
        className={styles.captionLogo}
        aria-label={`${product.name} by Welabs`}
      >
        <img
          src={productLogo(product.slug, "light")}
          alt={`${product.name} by Welabs`}
          width={1005}
          height={550}
          style={{ "--pad": LOGO_PAD[product.slug] } as React.CSSProperties}
        />
      </Link>
      <p className={shell.line}>{product.line}</p>
    </>
  );
}

export function Products() {
  return (
    <section
      id="products"
      className={`${shell.band} ${shell.light} ${styles.products}`}
    >
      <h2 className={styles.srOnly}>Produtos</h2>
      <div className={shell.wrap}>
        <Ring
          id="products"
          label="Produtos da Welabs"
          slides={PRODUCT_SLIDES}
          caption={(slide) => <Caption slide={slide} />}
        />
      </div>
    </section>
  );
}

// CORPO DA PÁGINA DE PRODUTO
// One band with the product block; the motion of each product joins in the product-motion unit.
import { ProductBlock } from "./ProductBlock";
import type { ProductSlug } from "@/lib/products";
import styles from "./shell.module.css";

export function ProductPageBody({ slug }: { slug: ProductSlug }) {
  return (
    <section
      className={`${styles.band} ${styles.dark}`}
      style={{ paddingTop: "calc(64px + clamp(48px, 8vh, 96px))" }}
    >
      <div className={styles.wrap}>
        <ProductBlock slug={slug} tone="dark" link={false} heading="h1">
          {null}
        </ProductBlock>
      </div>
    </section>
  );
}

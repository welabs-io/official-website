// CORPO DA PÁGINA DE PRODUTO
// One dark band: logo with seal and one factual line. The product's motion joins it in a later unit.
import { ProductBlock } from "./ProductBlock";
import type { ProductSlug } from "@/lib/products";
import styles from "./shell.module.css";

export function ProductPageBody({ slug }: { slug: ProductSlug }) {
  return (
    <section
      id="product"
      className={`${styles.band} ${styles.dark}`}
      style={{ paddingTop: "calc(64px + clamp(48px, 8vh, 96px))" }}
    >
      <div className={styles.wrap}>
        <ProductBlock slug={slug} tone="dark" link={false} heading="h1" />
      </div>
    </section>
  );
}

// CORPO DA PÁGINA DE PRODUTO
// One dark band: logo with seal, one factual line and the product's motion in loop (same pieces as the home).
import { MotionStage } from "./MotionStage";
import { ProductBlock } from "./ProductBlock";
import { PRODUCT_MOTION } from "./ProductMotion";
import type { ProductSlug } from "@/lib/products";
import styles from "./shell.module.css";

export function ProductPageBody({ slug }: { slug: ProductSlug }) {
  const Motion = PRODUCT_MOTION[slug];
  return (
    <section
      id="product"
      className={`${styles.band} ${styles.dark}`}
      style={{ paddingTop: "calc(64px + clamp(48px, 8vh, 96px))" }}
    >
      <div className={styles.wrap}>
        <ProductBlock slug={slug} tone="dark" link={false} heading="h1">
          <MotionStage id={`product-${slug}`} className={styles.stage}>
            <Motion />
          </MotionStage>
        </ProductBlock>
      </div>
    </section>
  );
}

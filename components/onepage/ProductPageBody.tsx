// CORPO DA PÁGINA DE PRODUTO
// Same language as the home, compact: a dark band with the logo and the seal, one factual line and the reel with the
// product's opening and films playing on their own.
import { ProductBlock } from "./ProductBlock";
import { ProductReel } from "./ProductReel";
import type { ProductSlug } from "@/lib/products";
import home from "./home.module.css";
import shell from "./shell.module.css";

export function ProductPageBody({ slug }: { slug: ProductSlug }) {
  return (
    <section
      id="product"
      className={`${shell.band} ${shell.dark} ${home.productPage}`}
    >
      <div className={`${shell.wrap} ${home.productPageGrid}`}>
        <ProductBlock slug={slug} tone="dark" link={false} heading="h1" />
        <ProductReel slug={slug} />
      </div>
    </section>
  );
}

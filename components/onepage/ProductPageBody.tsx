// CORPO DA PÁGINA DE PRODUTO
// Same language as the home, compact: the logo with the seal and one factual line, the opening flowing into the first
// film, and the other films of the product in a circular carousel.
import { RingStage } from "@/components/ring/RingStage";
import { productFilms } from "@/lib/motion-slides";
import type { ProductSlug } from "@/lib/products";
import { ProductBlock } from "./ProductBlock";
import home from "./home.module.css";
import shell from "./shell.module.css";

export function ProductPageBody({ slug }: { slug: ProductSlug }) {
  return (
    <>
      <section
        id="product"
        className={`${shell.band} ${shell.dark} ${home.productPage}`}
      >
        <div className={`${shell.wrap} ${home.productPageGrid}`}>
          <ProductBlock slug={slug} tone="dark" link={false} heading="h1" />
          <RingStage
            id="product-opening"
            kind="hero"
            slug={slug}
            eager
            label="Abertura do produto"
          />
        </div>
      </section>
      {productFilms(slug).length > 0 && (
        <section id="films" className={`${shell.band} ${shell.light}`}>
          <div className={shell.wrap}>
            <RingStage
              id="product-films"
              kind="films"
              slug={slug}
              label="Outros filmes do produto"
            />
          </div>
        </section>
      )}
    </>
  );
}

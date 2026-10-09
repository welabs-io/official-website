// CARROSSEL DA PÁGINA DE PRODUTO
// The same fluid ring as the home: the product's opening in full, flowing into its first film, then each of the other
// films in full, swapping places as each one ends. The opening exists only here and in the product section of the home.
import { productReel } from "@/lib/motion-slides";
import type { ProductSlug } from "@/lib/products";
import { Ring } from "./Ring";

export function ProductReel({ slug }: { slug: ProductSlug }) {
  return (
    <Ring
      id={`product-${slug}`}
      label="Filmes do produto"
      slides={productReel(slug)}
      eager
    />
  );
}

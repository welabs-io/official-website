// SEÇÃO 2: PRODUTOS
// The five products in a circular carousel, in weight order (Domus, Relloo, Magneto, Tuner, Knowly), one product per
// tile. Each one opens with the tail of its brand opening (only the logo forming, no tagline), which blends without a
// gap into the main film of the product; the film holds its settled last frame for 1 s and then the ring rotates to the
// next product. Under the carousel the row of logos: the active product lights up and each logo leads to its page. No
// controls, no progress bar, no pause. The markup is server-rendered; RingDriver downloads and plays it when it is near.
import { RingStage } from "@/components/ring/RingStage";
import home from "./home.module.css";
import shell from "./shell.module.css";

export function Products() {
  return (
    <section
      id="products"
      className={`${shell.band} ${shell.light} ${home.products}`}
    >
      <h2 className={home.srOnly}>Produtos</h2>
      <div className={shell.wrap}>
        <RingStage
          id="products-ring"
          kind="products"
          logos="links"
          tone="light"
          label="Abertura e filme de cada produto"
        />
      </div>
    </section>
  );
}

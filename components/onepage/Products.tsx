// SEÇÃO 2: PRODUTOS
// A single content carousel lets visitors select a product while its functional caption stays outside the motion.
// Product order, complete openings and the detail routes remain shared with the product pages.
import { RingStage } from "@/components/ring/RingStage";
import home from "./home.module.css";
import shell from "./shell.module.css";

export function Products() {
  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className={`${shell.band} ${shell.light} ${home.products}`}
      data-live
      data-on="false"
    >
      <div className={shell.wrap}>
        <div className={home.sectionHeading}>
          <h2 id="products-heading">Cada produto, de perto.</h2>
          <p>Escolha por onde começar.</p>
        </div>
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

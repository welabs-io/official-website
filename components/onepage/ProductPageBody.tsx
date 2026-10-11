// CORPO DA PÁGINA DE PRODUTO
// The detail page shows its complete opening in one window, architecture and navigable related films.
// Its first motion is a demonstration, so it does not inherit the carousel's orbit treatment.
import { RingStage } from "@/components/ring/RingStage";
import { CTA_LABEL, productBySlug, type ProductSlug } from "@/lib/products";
import { CONTACT_HREF } from "./contact";
import { Connectors } from "./Connectors";
import { ProductBlock } from "./ProductBlock";
import home from "./home.module.css";
import shell from "./shell.module.css";

export function ProductPageBody({ slug }: { slug: ProductSlug }) {
  const { name } = productBySlug(slug)!;
  return (
    <>
      <section
        id="product"
        className={`${shell.band} ${shell.dark} ${home.productPage}`}
        data-live
        data-on="false"
      >
        <div className={`${shell.wrap} ${home.productPageGrid}`}>
          <ProductBlock slug={slug} tone="dark" link={false} heading="h1" />
          <RingStage
            id="product-opening"
            kind="hero"
            presentation="single"
            slug={slug}
            eager
            label={`Abertura do ${name}`}
          />
        </div>
      </section>
      <section
        id="connectors"
        className={`${shell.band} ${shell.light} ${home.connectors}`}
        data-live
        data-on="false"
      >
        <h2 className={home.srOnly}>{`${name} no núcleo e nos trilhos`}</h2>
        <div className={shell.wrap}>
          <Connectors lit={slug} tone="light" />
        </div>
      </section>
      <section
        id="films"
        className={`${shell.band} ${shell.dark} ${home.films}`}
        data-live
        data-on="false"
      >
        <h2 className={home.srOnly}>{`Outros filmes do ${name}`}</h2>
        <div className={shell.wrap}>
          <RingStage
            id="product-films"
            kind="films"
            slug={slug}
            label={`Filmes do ${name}`}
          />
        </div>
      </section>
      <section
        id="contact"
        className={`${shell.band} ${shell.light} ${home.productCta}`}
        data-live
        data-on="false"
      >
        <div className={home.contact}>
          <a href={CONTACT_HREF} className={`${shell.cta} ${shell.ctaBig}`}>
            {CTA_LABEL}
          </a>
        </div>
      </section>
    </>
  );
}

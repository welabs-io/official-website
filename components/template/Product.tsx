// SEÇÕES DA PÁGINA DE PRODUTO (V2)
// The page of a product in the v2 content: the selector of the five products and the opening (logo, one sentence, the
// button and a native screen), the one interaction of the product, the stage with the product among the others, the
// details that come with it and the contact with open questions (v2.1: the door to the next product left; the selector
// replaces it). Server markup; the plays are CSS over checkboxes and radios.
import Link from "next/link";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { ProductBlock } from "@/components/onepage/ProductBlock";
import shell from "@/components/onepage/shell.module.css";
import { MiniScene } from "@/components/scenes/MiniScene";
import { CapabilityStage } from "@/components/scenes/SceneStage";
import { NAV, PAGE_HEADINGS, PRODUCT_PAGE } from "@/lib/content";
import {
  CTA_LABEL,
  PRODUCTS,
  productBySlug,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import { ContactBand, DomusHouse } from "./Home";
import { Orbit } from "./Orbit";
import { PLAYS } from "./Plays";
import { SectionHead } from "./SectionHead";
import styles from "./v2.module.css";

// SELETOR DOS CINCO PRODUTOS
// v2.1: the way between products is explicit, at the top of every product, in place of the "Welabs / <name>" trail and
// of the door "Próximo produto" that closed the page. The five logos in their order, the product of the page in ink with
// the 4 px amber bar under it (the active tab of the ERP front), the others quiet until pointed at. Each one is a link:
// the descent (components/onepage/descent-run.ts) opens the brand opening of that product from the logo clicked.
function ProductSwitch({ current }: { current: ProductSlug }) {
  return (
    // v2.2: `data-switch` makes a swap here a brand flash, not the whole opening (descent-run.ts)
    <nav className={styles.switch} aria-label={NAV.switch} data-switch="">
      <ul>
        {PRODUCTS.map(({ slug, name }) => (
          <li key={slug} data-p={slug}>
            <Link
              href={`/products/${slug}`}
              prefetch={false}
              aria-current={slug === current ? "page" : undefined}
              aria-label={name}
            >
              <img
                src={productLogo(slug, "light", "row")}
                alt=""
                width={1005}
                height={550}
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ABERTURA
// The selector of the five products, then the logo as the h1 (the brand opening lands its logo on it), the sentence and
// the button; the Domus opens with one of its screens playing, every other product with the stage of its capability
// scenes and their short names.
export function ProductOpening({ slug }: { slug: ProductSlug }) {
  const page = PRODUCT_PAGE[slug];
  const name = productBySlug(slug)!.name;
  return (
    <div
      className={`${shell.wrap} ${styles.opening}`}
      data-stage={slug === "domus" ? undefined : ""}
    >
      <ProductSwitch current={slug} />
      <div className={styles.openingText}>
        <ProductBlock
          slug={slug}
          tone="light"
          link={false}
          heading="h1"
          short={page.short}
        />
        <a href={CONTACT_HREF} className={`${shell.cta} ${shell.ctaBig}`}>
          {CTA_LABEL}
        </a>
      </div>
      {slug === "domus" ? (
        // v2.1: a real screen of the Domus, playing (the order of Marina comes back to the module Pedidos and she is told),
        // in place of a symbol drawn in CSS with six areas that only flew in
        <div className={styles.domusStage}>
          <MiniScene id="s6" />
        </div>
      ) : (
        <CapabilityStage
          id="product-scenes"
          slug={slug}
          label={PAGE_HEADINGS.scenes(name)}
        />
      )}
    </div>
  );
}

// ÁREAS DO DOMUS
export const DomusAreas = () => (
  <div className={shell.wrap}>
    <DomusHouse
      id="area-add-page"
      title={PAGE_HEADINGS.areas}
      lead={PAGE_HEADINGS.areasLead}
    />
  </div>
);

// A INTERAÇÃO DO PRODUTO
export function ProductPlay({ slug }: { slug: ProductSlug }) {
  const { title, lead } = PRODUCT_PAGE[slug].play;
  const Play = PLAYS[slug];
  return (
    <div className={shell.wrap}>
      <SectionHead title={title} lead={lead} />
      <Play />
    </div>
  );
}

// O PRODUTO ENTRE OS OUTROS
// The Domus page lights the Relloo (a product working on the Domus); every other page lights itself
export function ProductCenter({ slug }: { slug: ProductSlug }) {
  const { title } = PRODUCT_PAGE[slug].center;
  return (
    <div className={shell.wrap}>
      <SectionHead title={title} />
      <Orbit
        label={title}
        lit={slug === "domus" ? "relloo" : slug}
        self={slug}
        small
      />
    </div>
  );
}

// DETALHES QUE JÁ VÊM JUNTO
export function ProductDetails({ slug }: { slug: ProductSlug }) {
  return (
    <div className={shell.wrap}>
      <SectionHead title={PAGE_HEADINGS.details} />
      <ul className={styles.details}>
        {PRODUCT_PAGE[slug].details.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </div>
  );
}

export const ProductContact = ({ slug }: { slug: ProductSlug }) => (
  <ContactBand
    title={PAGE_HEADINGS.contact(productBySlug(slug)!.name)}
    asks={PRODUCT_PAGE[slug].asks}
  />
);

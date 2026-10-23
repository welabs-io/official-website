// SEÇÕES DA PÁGINA DE PRODUTO (V3)
// The page of a product: the selector of the five products and the opening (logo, one sentence, the button and the
// carousel of the product), the stage with the product among the others, the details that come with it and the
// contact with open questions (v2.1: the door to the next product left; the selector replaces it).
// v3 (2026-10-23): the carousel of the kit (components/scene-kit, mounted by SceneSlot) replaces both the capability
// stage of the opening and the interaction of the product (the plays left).
import Link from "next/link";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { ProductBlock } from "@/components/onepage/ProductBlock";
import shell from "@/components/onepage/shell.module.css";
import { SceneSlot } from "@/components/scene-kit/SceneSlot";
import { NAV, PAGE_HEADINGS, PRODUCT_PAGE } from "@/lib/content";
import {
  CTA_LABEL,
  PRODUCTS,
  productBySlug,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import { DifferCards } from "./DifferCards";
import { ContactBand, DomusHouse, type ContactAction } from "./Home";
import { Orbit } from "./Orbit";
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
// the button, and under them the carousel of the product across the whole row (it is drawn at the width of the kit
// window, the one approved at /lab/scenes/<slug>-carousel).
export function ProductOpening({ slug }: { slug: ProductSlug }) {
  const page = PRODUCT_PAGE[slug];
  return (
    <div className={`${shell.wrap} ${styles.opening}`}>
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
      <SceneSlot id={`${slug}-carousel`} className={styles.openingScene} />
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

// POR QUE É DIFERENTE: OS DETALHES EM CARTÕES QUE SE ABREM
// v4 (Cards.dc.html): the details that come with the product live under the three differences of the product, as
// cards that gain width and open their sentence on hover (DifferCards); they were a plain list in three columns
export function ProductDetails({ slug }: { slug: ProductSlug }) {
  const page = PRODUCT_PAGE[slug];
  return (
    <div className={shell.wrap}>
      <SectionHead title={PAGE_HEADINGS.details} variant="strip" />
      <DifferCards differs={page.differs} details={page.details} />
    </div>
  );
}

// The button of a product's contact: to the contact of the home, never to the band it sits in (v3, F1)
const PRODUCT_CONTACT_ACTION: ContactAction = {
  href: CONTACT_HREF,
  label: CTA_LABEL,
  kind: "button",
};

export const ProductContact = ({ slug }: { slug: ProductSlug }) => (
  <ContactBand
    title={PAGE_HEADINGS.contact(productBySlug(slug)!.name)}
    asks={PRODUCT_PAGE[slug].asks}
    action={PRODUCT_CONTACT_ACTION}
  />
);

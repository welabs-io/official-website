// SEÇÕES DA PÁGINA DE PRODUTO (V3)
// The page of a product: the selector of the five products and the opening (logo, one sentence, the button and the
// carousel of the product), the stage with the product among the others, the details that come with it and the
// contact with open questions (v2.1: the door to the next product left; the selector replaces it).
// v3 (2026-10-23): the carousel of the kit (components/scene-kit, mounted by SceneSlot) replaces both the capability
// stage of the opening and the interaction of the product (the plays left).
// i18n: every section receives the locale of the page (`i18n`): its text comes from the dictionary and its links carry
// the locale prefix.
import Link from "next/link";
import { CONTACT_PATH } from "@/components/onepage/contact";
import { ProductBlock } from "@/components/onepage/ProductBlock";
import shell from "@/components/onepage/shell.module.css";
import { SceneSlot } from "@/components/scene-kit/SceneSlot";
import { pageHeadings, productPage } from "@/lib/content";
import { href, type I18n } from "@/lib/i18n/i18n";
import {
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
function ProductSwitch({
  i18n,
  current,
}: {
  i18n: I18n;
  current: ProductSlug;
}) {
  return (
    // v2.2: `data-switch` makes a swap here a brand flash, not the whole opening (descent-run.ts)
    <nav
      className={styles.switch}
      aria-label={i18n.m.nav.switch}
      data-switch=""
    >
      <ul>
        {PRODUCTS.map(({ slug, name }) => (
          <li key={slug} data-p={slug}>
            <Link
              href={href(i18n, `/products/${slug}`)}
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
export function ProductOpening({
  i18n,
  slug,
}: {
  i18n: I18n;
  slug: ProductSlug;
}) {
  const page = productPage(i18n.m, slug);
  return (
    <div className={`${shell.wrap} ${styles.opening}`}>
      <ProductSwitch i18n={i18n} current={slug} />
      <div className={styles.openingText}>
        <ProductBlock
          i18n={i18n}
          slug={slug}
          tone="light"
          link={false}
          heading="h1"
          short={page.short}
        />
        <a
          href={href(i18n, CONTACT_PATH)}
          className={`${shell.cta} ${shell.ctaBig}`}
        >
          {i18n.m.common.cta}
        </a>
      </div>
      <SceneSlot id={`${slug}-carousel`} className={styles.openingScene} />
    </div>
  );
}

// ÁREAS DO DOMUS
export const DomusAreas = ({ i18n }: { i18n: I18n }) => {
  const headings = pageHeadings(i18n.m);
  return (
    <div className={shell.wrap}>
      <DomusHouse
        i18n={i18n}
        id="area-add-page"
        title={headings.areas}
        lead={headings.areasLead}
      />
    </div>
  );
};

// O PRODUTO ENTRE OS OUTROS
// The Domus page lights the Relloo (a product working on the Domus); every other page lights itself
export function ProductCenter({
  i18n,
  slug,
}: {
  i18n: I18n;
  slug: ProductSlug;
}) {
  const { title } = productPage(i18n.m, slug).center;
  return (
    <div className={shell.wrap}>
      <SectionHead title={title} />
      <Orbit
        i18n={i18n}
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
export function ProductDetails({
  i18n,
  slug,
}: {
  i18n: I18n;
  slug: ProductSlug;
}) {
  const page = productPage(i18n.m, slug);
  return (
    <div className={shell.wrap}>
      <SectionHead title={pageHeadings(i18n.m).details} variant="strip" />
      <DifferCards differs={page.differs} details={page.details} />
    </div>
  );
}

export const ProductContact = ({
  i18n,
  slug,
}: {
  i18n: I18n;
  slug: ProductSlug;
}) => {
  // The button of a product's contact: to the contact of the home, never to the band it sits in (v3, F1)
  const action: ContactAction = {
    href: href(i18n, CONTACT_PATH),
    label: i18n.m.common.cta,
    kind: "button",
  };
  return (
    <ContactBand
      i18n={i18n}
      title={pageHeadings(i18n.m).contact(productBySlug(slug)!.name)}
      asks={productPage(i18n.m, slug).asks}
      action={action}
    />
  );
};

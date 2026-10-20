// SEÇÕES DA PÁGINA DE PRODUTO (V2)
// The page of a product in the v2 content: the opening (logo, one sentence, the button and a native drawing), the one
// interaction of the product, the stage with the product among the others, the details that come with it, the contact
// with open questions and the door to the next product. Server markup; the plays are CSS over checkboxes and radios.
import Link from "next/link";
import { CONTACT_HREF } from "@/components/onepage/contact";
import { ProductBlock } from "@/components/onepage/ProductBlock";
import shell from "@/components/onepage/shell.module.css";
import { Glyph, ROOM_GLYPHS, GLYPHS } from "@/components/scenes/icons";
import { CapabilityStage } from "@/components/scenes/SceneStage";
import { NAV, PAGE_HEADINGS, PRODUCT_PAGE } from "@/lib/content";
import { ICON_STROKE } from "@/lib/icon-stroke";
import {
  CTA_LABEL,
  productBySlug,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import { nextProduct } from "@/lib/site-config";
import { ContactBand, DomusHouse } from "./Home";
import { Orbit } from "./Orbit";
import { PLAYS } from "./Plays";
import { SectionHead } from "./SectionHead";
import styles from "./v2.module.css";

// The areas that fit into the Domus symbol at the opening (M8)
const ASSEMBLE = [
  { name: "Vendas", d: GLYPHS.tag },
  { name: "Estoque", d: ROOM_GLYPHS.Estoque },
  { name: "Financeiro", d: ROOM_GLYPHS.Financeiro },
  { name: "Fiscal", d: GLYPHS.doc },
  { name: "Pessoas", d: GLYPHS.user },
  { name: "Projetos", d: GLYPHS.calendar },
];

// ABERTURA
// The logo is the h1 (the descent moves the logo of the card onto it); the Domus opens with its areas fitting into its
// symbol, every other product with the stage of its capability scenes and their short names.
export function ProductOpening({ slug }: { slug: ProductSlug }) {
  const page = PRODUCT_PAGE[slug];
  const name = productBySlug(slug)!.name;
  return (
    <div
      className={`${shell.wrap} ${styles.opening}`}
      data-stage={slug === "domus" ? undefined : ""}
    >
      <div className={styles.openingText}>
        <p className={styles.trail}>
          <Link href="/" prefetch={false}>
            Welabs
          </Link>{" "}
          / {name}
        </p>
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
        <div className={styles.assemble} aria-hidden="true">
          <div className={styles.frame}>
            {ASSEMBLE.map((area, i) => (
              <span
                key={area.name}
                className={styles.area}
                style={{ "--i": i } as React.CSSProperties}
              >
                <Glyph d={area.d} size={22} />
                {area.name}
              </span>
            ))}
          </div>
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
  const { title, stamp } = PRODUCT_PAGE[slug].center;
  return (
    <div className={shell.wrap}>
      <SectionHead title={title} />
      <Orbit
        label={title}
        lit={slug === "domus" ? "relloo" : slug}
        stamp={stamp}
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

// PRÓXIMO PRODUTO
// The end of a product page is a door: one tall band that names the next product with its opening logo and line. The
// whole band is the link, and `data-door` tells components/onepage/Descent.tsx to grow it into the next product. Its
// logo is the same file and the same height as the opening it becomes, so the move is a pure translate and scale.
export function NextProduct({ slug }: { slug: ProductSlug }) {
  const next = productBySlug(nextProduct(slug))!;
  return (
    <Link
      href={`/products/${next.slug}`}
      prefetch={false}
      className={styles.next}
      data-door={next.slug}
    >
      <span className={styles.nextLabel}>{NAV.next}</span>
      {/* The logo names the product, so the name of the link is what it shows */}
      <img
        className={styles.nextLogo}
        data-door-logo
        src={productLogo(next.slug, "light", "hero", 64)}
        alt={next.name}
        width={1005}
        height={550}
        loading="lazy"
        decoding="async"
      />
      <span className={styles.nextLine}>{next.line}</span>
      <svg
        className={styles.nextCue}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14m-6-6 6 6 6-6" />
      </svg>
    </Link>
  );
}

// SEÇÕES DE LEITURA
// The reading sections between the visual ones (chain, product ring, connectors): the order from start to end, what changes
// in the operation, who it is for, integrations and questions on the home; the opening, the other products and the door to
// the next product of a product page (its reading bands, in the tokens of the scenes, are ProductReading.tsx). Server markup, no state, all
// text read from lib/content. Each section has a centred head (title and one line) that covers the thread of the page
// behind it, and cards that do the same.
import Link from "next/link";
import { ProductBlock } from "@/components/onepage/ProductBlock";
import { MiniScene } from "@/components/scenes/MiniScene";
import { CapabilityStage } from "@/components/scenes/SceneStage";
import {
  AUDIENCE,
  BENEFITS,
  HOME_FAQ,
  HOME_SECTIONS,
  INTEGRATIONS,
  JOURNEY,
  NAV,
  PAGE_HEADINGS,
} from "@/lib/content";
import type { Audience, Faq } from "@/lib/content";
import { ICON_STROKE } from "@/lib/icon-stroke";
import { PLATFORM_LOGOS } from "@/lib/partners";
import {
  LOGO_PAD,
  productAlt,
  productBySlug,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import { nextProduct } from "@/lib/site-config";
import { ProductCards } from "./Content";
import { Icon } from "./Icon";
import styles from "./reading.module.css";
import { SectionHead } from "./SectionHead";

// Small logos of the products involved in a step or a profile (decorative next to the sentence, which names them)
function ProductMarks({ slugs }: { slugs: readonly ProductSlug[] }) {
  return (
    <span className={styles.marks}>
      {slugs.map((slug) => (
        <img
          key={slug}
          className={styles.mark}
          src={productLogo(slug, "light", "row")}
          alt={productAlt(slug, "row")}
          width={1005}
          height={550}
          loading="lazy"
          decoding="async"
          style={{ "--pad": LOGO_PAD[slug] } as React.CSSProperties}
        />
      ))}
    </span>
  );
}

// UM PEDIDO, DO COMEÇO AO FIM (HOME)
// The seven steps of the chain as a timeline on the axis of the page: a node per step, the cards alternating left and
// right of it (one column with the node at the left on a phone). The numbers are the order of the list.
export function Journey() {
  return (
    <div className={styles.wrap}>
      <SectionHead
        id="journey-title"
        title={HOME_SECTIONS.journey.title}
        lead={HOME_SECTIONS.journey.lead}
      />
      <ol className={styles.steps} aria-labelledby="journey-title">
        {JOURNEY.map((step) => (
          <li key={step.text} className={styles.step}>
            <div className={styles.stepCard}>
              <ProductMarks slugs={step.products} />
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// O QUE MUDA NA OPERAÇÃO (HOME)
// Six concrete changes, each with the settled frame of the native scene that shows it.
export function Benefits() {
  return (
    <div className={styles.wrap}>
      <SectionHead
        title={HOME_SECTIONS.benefits.title}
        lead={HOME_SECTIONS.benefits.lead}
      />
      <ul className={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <li key={benefit.title} className={styles.benefit}>
            <MiniScene id={benefit.scene} phone />
            <div className={styles.benefitText}>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// PARA QUEM (HOME E PRODUTO)
// Profiles of operation, each with the products that serve it.
export function AudienceGrid({
  items,
  title,
  lead,
  count,
}: {
  items: readonly Audience[];
  title: string;
  lead?: string;
  // Columns on a wide screen (the home has four profiles, a product has three)
  count: 3 | 4;
}) {
  return (
    <div className={styles.wrap}>
      <SectionHead title={title} lead={lead} />
      <ul className={styles.audience} data-count={count}>
        {items.map((item) => (
          <li key={item.title} className={styles.profile}>
            <ProductMarks slugs={item.products} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const HomeAudience = () => (
  <AudienceGrid
    items={AUDIENCE}
    title={HOME_SECTIONS.audience.title}
    lead={HOME_SECTIONS.audience.lead}
    count={4}
  />
);

// INTEGRAÇÕES E INFRAESTRUTURA (HOME)
// Four groups: channels, data, cloud and AI. Chips with an icon where the thing is a capability, marks where the site
// already has the logo (lib/partners.ts).
export function Integrations() {
  const mark = (name: string) =>
    PLATFORM_LOGOS.find((logo) => logo.name === name)!;
  return (
    <div className={styles.wrap}>
      <SectionHead
        title={HOME_SECTIONS.integrations.title}
        lead={HOME_SECTIONS.integrations.lead}
      />
      <ul className={styles.groups}>
        {INTEGRATIONS.map((group) => (
          <li key={group.id} className={styles.group} data-group={group.id}>
            <div className={styles.groupHead}>
              <h3>{group.title}</h3>
              <p>{group.text}</p>
            </div>
            <ul className={styles.chips}>
              {group.chips.map((chip) => (
                <li key={chip.text} className={styles.chip}>
                  <Icon name={chip.icon} size={18} />
                  {chip.text}
                </li>
              ))}
              {group.marks.map((name) => {
                const logo = mark(name);
                return (
                  <li key={name} className={styles.logoChip} title={name}>
                    <img
                      src={logo.src}
                      alt={logo.name}
                      height={Math.round(logo.h * 0.7)}
                      style={{ height: Math.round(logo.h * 0.7) }}
                      loading="lazy"
                      decoding="async"
                    />
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

// PERGUNTAS FREQUENTES (HOME E PRODUTO)
// Native <details>: keyboard and screen reader work with no script; every answer is in the markup.
export function FaqList({
  items,
  title,
}: {
  items: readonly Faq[];
  title: string;
}) {
  return (
    <div className={styles.wrap}>
      <SectionHead title={title} />
      <ul className={styles.faq}>
        {items.map((item) => (
          <li key={item.q}>
            <details className={styles.qa}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const HomeFaq = () => (
  <FaqList items={HOME_FAQ} title={HOME_SECTIONS.faq.title} />
);

// OUTROS PRODUTOS (PRODUTO)
// The way on, at the end of the page: the other four products as cards that lead to their pages.
export function OtherProducts({ slug }: { slug: ProductSlug }) {
  return (
    <div className={styles.wrap}>
      <SectionHead title={PAGE_HEADINGS.others} />
      <ProductCards tone="light" exclude={slug} label={PAGE_HEADINGS.others} />
    </div>
  );
}

// ABERTURA DA PÁGINA DE PRODUTO
// Same column as the opening of the home, centred on the axis of the page: the logo (the h1) with its factual line, and
// the stage that plays three capability scenes of the product, with their names and the sentence about the one on screen
// under it. Native and animated: no video, no still frame. The product is the section that follows the products band of
// the home (the descent, components/onepage/Descent.tsx), so its opening has no way back of its own: the way back is up.
export function ProductHero({ slug }: { slug: ProductSlug }) {
  return (
    <div className={`${styles.wrap} ${styles.hero}`}>
      <div className={styles.heroText}>
        <ProductBlock
          slug={slug}
          tone="light"
          link={false}
          heading="h1"
          className={styles.heroBlock}
        />
      </div>
      <CapabilityStage
        id="product-scenes"
        slug={slug}
        label={`${PAGE_HEADINGS.capabilities} do ${productBySlug(slug)!.name}`}
      />
    </div>
  );
}

// PRÓXIMO PRODUTO
// The end of a product page is a door, not a list: one tall band that names the next product with its opening logo and
// line. The whole band is the link, and `data-door` tells components/onepage/Descent.tsx to grow it into the next
// product instead of jumping. Its logo is the same file and the same width as the opening it becomes, so the move is a
// pure translate and scale.
export function NextProduct({ slug }: { slug: ProductSlug }) {
  const next = productBySlug(nextProduct(slug))!;
  return (
    <Link
      href={`/products/${next.slug}`}
      prefetch={false}
      className={styles.next}
      data-door={next.slug}
      aria-label={`${NAV.next}: ${next.name}`}
    >
      <span className={styles.nextLabel}>{NAV.next}</span>
      <img
        className={styles.nextLogo}
        data-door-logo
        src={productLogo(next.slug, "light", "hero", 64)}
        alt=""
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

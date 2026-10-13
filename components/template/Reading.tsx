// SEÇÕES DE LEITURA
// The reading sections between the visual ones (chain, product ring, connectors): the order from start to end, what changes
// in the operation, who it is for, integrations and questions on the home; the capabilities in groups, the audience and the
// questions of a product on its page. Server markup, no state, all text read from lib/content. Each section has a centred
// head (title and one line) that covers the thread of the page behind it, and cards that do the same.
import Link from "next/link";
import { ProductBlock } from "@/components/onepage/ProductBlock";
import { MiniScene } from "@/components/scenes/MiniScene";
import {
  AUDIENCE,
  BENEFITS,
  HOME_FAQ,
  HOME_SECTIONS,
  INTEGRATIONS,
  JOURNEY,
  NAV,
  PAGE_HEADINGS,
  PRODUCT_CONTENT,
  PRODUCT_DEPTH,
} from "@/lib/content";
import type { Audience, Faq } from "@/lib/content";
import { PLATFORM_LOGOS } from "@/lib/partners";
import {
  LOGO_PAD,
  productAlt,
  productBySlug,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import type { SceneId } from "@/lib/scenes/types";
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

export const ProductAudience = ({ slug }: { slug: ProductSlug }) => (
  <AudienceGrid
    items={PRODUCT_DEPTH[slug].audience}
    title={PAGE_HEADINGS.audience}
    count={3}
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

export const ProductFaq = ({ slug }: { slug: ProductSlug }) => (
  <FaqList items={PRODUCT_DEPTH[slug].faq} title={PAGE_HEADINGS.faq} />
);

// CAPACIDADES EM GRUPOS (PRODUTO)
// The six capabilities of the product (same icon and text as the cards of the home) in groups, each with one sentence.
export function CapabilityGroups({ slug }: { slug: ProductSlug }) {
  const { capabilities } = PRODUCT_CONTENT[slug];
  return (
    <div className={styles.wrap}>
      <SectionHead title={PAGE_HEADINGS.capabilities} />
      <ul className={styles.capGroups}>
        {PRODUCT_DEPTH[slug].groups.map((group) => (
          <li key={group.title} className={styles.capGroup}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map(({ cap, detail }) => {
                const item = capabilities[cap];
                return (
                  <li key={item.text} className={styles.capRow}>
                    <span className={styles.capIcon}>
                      <Icon name={item.icon} size={20} />
                    </span>
                    <span className={styles.capText}>
                      <b>{item.text}</b>
                      <span>{detail}</span>
                    </span>
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
// Trail, logo (the h1), the factual line, three capabilities and, beside them, the native scene of the chain in which the
// product is the protagonist (the first product of the scene in lib/scenes/script.ts), in its settled frame.
export const HERO_SCENE: Record<ProductSlug, SceneId> = {
  domus: "s3",
  relloo: "s2",
  magneto: "s5",
  tuner: "s1",
  knowly: "s4",
};

export function ProductHero({ slug }: { slug: ProductSlug }) {
  return (
    <div className={`${styles.wrap} ${styles.hero}`}>
      <div className={styles.heroText}>
        <Trail slug={slug} />
        <ProductBlock slug={slug} tone="light" link={false} heading="h1" />
        <ul className={styles.heroChips}>
          {PRODUCT_CONTENT[slug].capabilities.slice(0, 3).map((cap) => (
            <li key={cap.text}>
              <Icon name={cap.icon} size={18} />
              {cap.text}
            </li>
          ))}
        </ul>
      </div>
      <MiniScene id={HERO_SCENE[slug]} className={styles.heroScene} />
    </div>
  );
}

// CAMINHO "WELABS / DOMUS"
// "Welabs / Domus": the way back to the home and the name of the page, above the logo.
export function Trail({ slug }: { slug: ProductSlug }) {
  return (
    <nav aria-label={NAV.trail} className={styles.trail}>
      <ol>
        <li>
          <Link href="/" prefetch={false}>
            {NAV.home}
          </Link>
        </li>
        <li aria-current="page">{productBySlug(slug)!.name}</li>
      </ol>
    </nav>
  );
}

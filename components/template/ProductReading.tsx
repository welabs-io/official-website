// SEÇÕES DE LEITURA DA PÁGINA DE PRODUTO
// What the product solves, its capabilities in groups, who it is for and the questions, drawn with the tokens of the
// native scenes (components/scenes/tokens.module.css) so the reading bands look like the screens above them: white
// panels with the panel edge and the first elevation, radii of 6 and 12, one key line of 18 px per panel and every other
// text at 13, 12 or 11 px. Server markup, no state, all text read from lib/content.
import { PAGE_HEADINGS, PRODUCT_CONTENT, PRODUCT_DEPTH } from "@/lib/content";
import {
  LOGO_PAD,
  productAlt,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import { Icon } from "./Icon";
import styles from "./product-reading.module.css";
import { SectionHead } from "./SectionHead";

const Check = () => (
  <span className={styles.check} aria-hidden="true">
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none">
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

// O QUE RESOLVE
// Three panels: the problem as the key line, the answer of the product under a hairline, with a success mark.
export function ProductResolves({ slug }: { slug: ProductSlug }) {
  return (
    <div className={styles.wrap}>
      <SectionHead title={PAGE_HEADINGS.resolves} />
      <ul className={styles.three}>
        {PRODUCT_CONTENT[slug].resolves.map((item) => (
          <li key={item.problem} className={styles.panel}>
            <p className={styles.key}>{item.problem}</p>
            <p className={styles.answer}>
              <Check />
              <span>{item.does}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// CAPACIDADES EM GRUPOS
// The six capabilities of the product in groups, each with its icon in a tonal box and one sentence.
export function ProductCapabilities({ slug }: { slug: ProductSlug }) {
  const { capabilities } = PRODUCT_CONTENT[slug];
  return (
    <div className={styles.wrap}>
      <SectionHead title={PAGE_HEADINGS.capabilities} />
      <ul className={styles.groups}>
        {PRODUCT_DEPTH[slug].groups.map((group) => (
          <li key={group.title} className={styles.panel} data-flush="">
            <div className={styles.groupHead}>
              <h3 className={styles.key}>{group.title}</h3>
              <span className={styles.meta}>
                {group.items.length} capacidades
              </span>
            </div>
            <ul>
              {group.items.map(({ cap, detail }) => {
                const item = capabilities[cap];
                return (
                  <li key={item.text} className={styles.capRow}>
                    <span className={styles.iconBox}>
                      <Icon name={item.icon} size={16} />
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

// PARA QUEM
// Three profiles, each with the products that serve it (the small logos, decorative next to the sentence, which names
// them).
export function ProductAudience({ slug }: { slug: ProductSlug }) {
  return (
    <div className={styles.wrap}>
      <SectionHead title={PAGE_HEADINGS.audience} />
      <ul className={styles.three}>
        {PRODUCT_DEPTH[slug].audience.map((item) => (
          <li key={item.title} className={styles.panel}>
            <span className={styles.marks}>
              {item.products.map((product) => (
                <img
                  key={product}
                  className={styles.mark}
                  src={productLogo(product, "light", "row")}
                  alt={productAlt(product, "row")}
                  width={1005}
                  height={550}
                  loading="lazy"
                  decoding="async"
                  style={{ "--pad": LOGO_PAD[product] } as React.CSSProperties}
                />
              ))}
            </span>
            <h3 className={styles.key}>{item.title}</h3>
            <p className={styles.body}>{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// PERGUNTAS FREQUENTES
// Native <details>: keyboard and screen reader work with no script; every answer is in the markup. The open question
// gets the 3 px amber bar and the pale fill of the item of the moment, as in the scenes.
export function ProductFaq({ slug }: { slug: ProductSlug }) {
  return (
    <div className={styles.wrap}>
      <SectionHead title={PAGE_HEADINGS.faq} />
      <ul className={styles.faq}>
        {PRODUCT_DEPTH[slug].faq.map((item) => (
          <li key={item.q}>
            <details className={styles.qa}>
              <summary>
                <span className={styles.key}>{item.q}</span>
              </summary>
              <p className={styles.body}>{item.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

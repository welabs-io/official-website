// PÁGINA DETALHADA DE PRODUTO
// Functional content remains independent from motion plans; overview and story use separate consumers of one narrative runtime.
import type { CSSProperties } from "react";
import Link from "next/link";
import { ProductMotion } from "@/components/motion/ProductMotion";
import { PRODUCT_DETAILS } from "@/lib/product-details";
import {
  CTA_LABEL,
  LOGO_PAD,
  PRODUCTS,
  productBySlug,
  productLogo,
  type ProductSlug,
} from "@/lib/products";
import { ContactSection } from "./ContactSection";
import styles from "./product-detail.module.css";

export function ProductDetail({ slug }: { slug: ProductSlug }) {
  const product = productBySlug(slug)!;
  const detail = PRODUCT_DETAILS[slug];
  const [primaryCapability, ...otherCapabilities] = detail.capabilities;
  const relatedProducts = PRODUCTS.filter((item) => item.slug !== slug);

  return (
    <>
      <section id="overview" className={styles.hero}>
        <div className={styles.wrap}>
          <nav className={styles.breadcrumb} aria-label="Você está aqui">
            <Link href="/#products">Produtos</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" aria-label={`${product.name} by Welabs`}>
              {product.name}
            </span>
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <img
                className={styles.productLogo}
                src={productLogo(slug, "dark")}
                alt={`${product.name} by Welabs`}
                width={1005}
                height={550}
                style={{ "--logo-pad": LOGO_PAD[slug] } as CSSProperties}
              />
              <p className={styles.factualLine}>{product.line}</p>
              <h1>
                <span className={styles.srOnly}>
                  {product.name} by Welabs.{" "}
                </span>
                {detail.headline}
              </h1>
              <div className={styles.benefits}>
                {detail.benefits.map((benefit) => (
                  <p key={benefit}>{benefit}</p>
                ))}
              </div>
              <div className={styles.actions}>
                <a className={styles.primaryLink} href="#contact">
                  {CTA_LABEL}
                </a>
                <a className={styles.textLink} href="#capabilities">
                  Explorar recursos
                </a>
              </div>
            </div>
            <div className={styles.heroDemonstration}>
              <ProductMotion id="product-opening" slug={slug} mode="overview" />
              <p className={styles.demonstrationNote}>
                Visão geral ilustrativa do produto
              </p>
            </div>
          </div>
        </div>
      </section>

      <nav className={styles.sectionNavigation} aria-label="Nesta página">
        <div className={styles.wrap}>
          <a href="#overview">Visão geral</a>
          <a href="#capabilities">Recursos</a>
          <a href="#films">Demonstrações</a>
          <a href="#related-products">Outros produtos</a>
        </div>
      </nav>

      <section className={styles.overview} aria-labelledby="overview-title">
        <div className={`${styles.wrap} ${styles.overviewGrid}`}>
          <h2 id="overview-title">{detail.overviewTitle}</h2>
          <div>
            <p>{detail.overview}</p>
            <p className={styles.audience}>{detail.audience}</p>
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        className={styles.capabilities}
        aria-labelledby="capabilities-title"
      >
        <div className={styles.wrap}>
          <div className={styles.sectionHeading}>
            <h2 id="capabilities-title">{detail.capabilitiesTitle}</h2>
            <p>{detail.capabilitiesIntro}</p>
          </div>
          <div className={styles.capabilityLayout}>
            <article className={styles.primaryCapability}>
              <h3>{primaryCapability.title}</h3>
              <p>{primaryCapability.description}</p>
              <ul>
                {primaryCapability.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <div className={styles.otherCapabilities}>
              {otherCapabilities.map((capability) => (
                <article className={styles.capability} key={capability.title}>
                  {capability.note && (
                    <p className={styles.capabilityNote}>{capability.note}</p>
                  )}
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                  <ul>
                    {capability.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="films"
        className={styles.films}
        aria-labelledby="films-title"
      >
        <div className={styles.wrap}>
          <div className={styles.sectionHeading}>
            <h2 id="films-title">{detail.demonstrationTitle}</h2>
            <p>{detail.demonstrationDescription}</p>
          </div>
          <div className={styles.filmStage}>
            <ProductMotion id="product-story" slug={slug} mode="story" />
          </div>
          <p className={styles.filmNote}>
            Sequência ilustrativa com dados de demonstração. Escolha um capítulo
            para acompanhar cada etapa.
          </p>
        </div>
      </section>

      <section
        id="related-products"
        className={styles.related}
        aria-labelledby="related-title"
      >
        <div className={`${styles.wrap} ${styles.relatedGrid}`}>
          <div className={styles.relatedCopy}>
            <h2 id="related-title">{detail.relatedTitle}</h2>
            <p>{detail.relatedDescription}</p>
            <Link className={styles.textLink} href="/#journey">
              Conhecer a família Welabs
            </Link>
          </div>
          <ul className={styles.relatedList}>
            {relatedProducts.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/products/${item.slug}`}
                  prefetch={false}
                  aria-label={`Conhecer ${item.name} by Welabs: ${item.line}`}
                >
                  <img
                    src={productLogo(item.slug, "light")}
                    alt={`${item.name} by Welabs`}
                    width={1005}
                    height={550}
                    loading="lazy"
                    decoding="async"
                    style={
                      { "--logo-pad": LOGO_PAD[item.slug] } as CSSProperties
                    }
                  />
                  <span>{item.line}</span>
                  <span className={styles.relatedAction}>Conhecer produto</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ContactSection product={slug} />
    </>
  );
}

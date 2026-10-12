// PÁGINA COMPLETA DE APRESENTAÇÃO
// A single operational story demonstrates the whole chain before individual identities and factual product roles.
import Link from "next/link";
import { RingStage } from "@/components/ring/RingStage";
import { Carousel } from "@/components/onepage/Carousel";
import { CLIENT_LOGOS, PLATFORM_LOGOS } from "@/lib/partners";
import { productLogo, type ProductSlug } from "@/lib/products";
import { SiteFrame } from "./SiteFrame";
import { EcosystemDemo } from "./EcosystemDemo";
import { ECOSYSTEM_ROLES } from "@/lib/ecosystem-motion";
import { ContactSection } from "./ContactSection";
import base from "./site.module.css";
import styles from "./home.module.css";

const summaries: Record<ProductSlug, string> = {
  domus:
    "Finanças, vendas, compras, estoque e pessoas na mesma base de gestão.",
  relloo:
    "Contatos, oportunidades, conversas e campanhas com o mesmo histórico.",
  magneto: "Regras e decisões ganham uma sequência de trabalho visual.",
  tuner: "WhatsApp, voz e chat do site prontos para a operação.",
  knowly: "Respostas com fontes que podem ser consultadas.",
};

export function CompleteHome() {
  return (
    <SiteFrame home>
      <section
        id="chain"
        className={styles.hero}
        aria-labelledby="hero-heading"
      >
        <div className={base.wrap}>
          <div className={styles.operationHeading}>
            <div className={styles.operationCopy}>
              <p className={styles.operationEyebrow}>
                Domus · Relloo · Magneto · Tuner · Knowly
              </p>
              <h1 id="hero-heading">
                Uma solicitação.
                <br />
                Cinco produtos, juntos.
              </h1>
            </div>
            <div className={styles.operationIntroduction}>
              <p>
                Gestão e relacionamento conectados por canais, conhecimento e
                workflows. Do pedido à decisão, o contexto acompanha.
              </p>
              <div className={styles.heroActions}>
                <a href="#operation-demo" className={base.primary}>
                  Ver a operação
                </a>
                <a href="#products" className={base.textLink}>
                  Conhecer os produtos
                </a>
              </div>
            </div>
          </div>
          <div id="operation-demo" className={styles.operationDemo}>
            <EcosystemDemo />
          </div>
        </div>
      </section>
      <section
        id="products"
        className={styles.products}
        aria-labelledby="products-heading"
        data-live
        data-on="false"
      >
        <div className={base.wrap}>
          <div className={`${base.sectionHeading} ${styles.productsHeading}`}>
            <h2 id="products-heading">Conheça cada produto.</h2>
            <p>
              Gestão, relacionamento, workflows, canais e conhecimento. <br />
              Cada marca se forma ao entrar em cena. Escolha um produto e
              conheça seu papel.
            </p>
          </div>
          <RingStage
            id="products-ring"
            kind="products"
            rotate={false}
            summaries={summaries}
            clean
            logos="links"
            tone="light"
            caption
            navigation
            label="Conheça os cinco produtos Welabs"
          />
        </div>
      </section>
      <section
        id="journey"
        className={styles.journey}
        aria-labelledby="journey-heading"
        data-live
        data-on="false"
      >
        <div className={base.wrap}>
          <div className={styles.journeyHeading}>
            <div className={`${base.sectionHeading} ${base.darkHeading}`}>
              <h2 id="journey-heading">
                Cada produto cuida de uma parte.
                <br />O contexto permanece.
              </h2>
              <p>
                Domus e Relloo no núcleo da operação. Workflows, canais e
                conhecimento acompanham o trabalho entre as áreas.
              </p>
            </div>
          </div>
          <div className={styles.roleGrid}>
            {ECOSYSTEM_ROLES.map(({ slug, title, body }, index) => (
              <Link
                key={slug}
                href={`/products/${slug}`}
                prefetch={false}
                className={styles.roleCard}
                data-architecture-node={slug}
              >
                <div className={styles.roleHeader}>
                  <img
                    src={productLogo(slug, "dark")}
                    alt={`${slug[0].toUpperCase()}${slug.slice(1)} by Welabs`}
                    width={120}
                    height={66}
                  />
                  <span>
                    {index < 2 ? "Núcleo da operação" : "Conecta o trabalho"}
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className={styles.roleLink}>
                  Conhecer o produto <span aria-hidden="true">↗</span>
                </span>
              </Link>
            ))}
          </div>
          <div className={styles.journeyFoot}>
            <p>Conheça os produtos que fazem essa jornada acontecer.</p>
            <Link href="/products/domus" prefetch={false}>
              Domus
            </Link>
            <Link href="/products/relloo" prefetch={false}>
              Relloo
            </Link>
            <Link href="/products/magneto" prefetch={false}>
              Magneto
            </Link>
            <Link href="/products/tuner" prefetch={false}>
              Tuner
            </Link>
            <Link href="/products/knowly" prefetch={false}>
              Knowly
            </Link>
          </div>
        </div>
      </section>
      <section
        id="platforms"
        className={styles.partners}
        aria-labelledby="partners-heading"
        data-live
        data-on="false"
      >
        <div className={base.wrap}>
          <div className={styles.partnersHeading}>
            <h2 id="partners-heading">Experiência e tecnologia.</h2>
            <p>
              Marcas do nosso portfólio e plataformas que fazem parte da nossa
              base.
            </p>
          </div>
          <div className={styles.partnerRow}>
            <span>Experiência</span>
            <Carousel
              label="Marcas do portfólio"
              logos={CLIENT_LOGOS}
              kind="all"
              seconds={54}
            />
          </div>
          <div className={styles.partnerRow}>
            <span>Base tecnológica</span>
            <Carousel
              label="Plataformas de infraestrutura e desenvolvimento"
              logos={PLATFORM_LOGOS}
              kind="all"
              seconds={70}
            />
          </div>
        </div>
      </section>
      <ContactSection />
    </SiteFrame>
  );
}

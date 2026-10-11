// PÁGINA COMPLETA DE APRESENTAÇÃO
// The opening shows architecture, the orbit supports exploration and one persistent story proves the product relationship.
import Link from "next/link";
import { RingStage } from "@/components/ring/RingStage";
import { Carousel } from "@/components/onepage/Carousel";
import { CLIENT_LOGOS, PLATFORM_LOGOS } from "@/lib/partners";
import { productLogo, type ProductSlug } from "@/lib/products";
import { SiteFrame } from "./SiteFrame";
import { HeroStage } from "./HeroStage";
import { JourneySignals } from "./JourneySignals";
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
        <div className={`${base.wrap} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <h1 id="hero-heading">
              Sua empresa,
              <br />
              conectada por dentro.
            </h1>
            <p>
              Domus e Relloo no núcleo. Workflows, canais e conhecimento em toda
              a operação.
            </p>
            <div className={styles.heroActions}>
              <a href="#products" className={base.primary}>
                Explorar produtos
              </a>
              <a href="#journey" className={base.textLink}>
                Veja como funciona
              </a>
            </div>
          </div>
          <HeroStage />
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
              Escolha um produto e conheça o que ele faz.
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
                Uma conversa.
                <br />O contexto acompanha.
              </h2>
              <p>
                A pessoa, o pedido e a decisão permanecem juntos,
                <br />
                mesmo quando o trabalho passa de um produto para outro.
              </p>
            </div>
            <div className={styles.contextAnchor}>
              <span>Demonstração da operação</span>
              <strong>Marina</strong>
              <p>Pedido 1234</p>
            </div>
          </div>
          <JourneySignals className={styles.journeyGrid}>
            <div className={styles.journeyWindow}>
              <div className={styles.journeyWindowHeader}>
                <span className={styles.stageDot} />
                <span>A mesma pessoa. O mesmo pedido.</span>
              </div>
              <div className={styles.journeyTask}>
                <div className={styles.journeyRequest}>
                  <span>Marina · Pedido 1234</span>
                  <p>“Dá para mudar a entrega do meu pedido para sábado?”</p>
                </div>
                <div className={styles.journeyResult}>
                  <div data-journey-detail>
                    <h3>Pessoa reconhecida</h3>
                    <p>
                      Pedido, endereço e conversas anteriores no mesmo contexto.
                    </p>
                  </div>
                  <div data-journey-detail hidden>
                    <h3>Política de entregas</h3>
                    <p>A data pode ser alterada antes do envio.</p>
                    <span>
                      Fonte: Política de entregas, seção 3 · demonstração
                    </span>
                  </div>
                  <div data-journey-detail hidden>
                    <h3>Aprovação pela gestora</h3>
                    <p>
                      A regra sai do Domus, passa pelo Magneto e retorna ao
                      pedido.
                    </p>
                  </div>
                </div>
              </div>
              <RingStage
                id="journey-ring"
                kind="chain"
                presentation="single"
                clean
                caption={false}
                navigation={false}
                label="Jornada contínua do pedido de Marina entre os produtos"
              />
            </div>
            <div className={styles.journeySteps}>
              <div data-journey-step data-active="true" aria-current="step">
                <span>Contexto</span>
                <h3>O relacionamento tem história.</h3>
                <p>
                  Relloo encontra a pessoa e o pedido que já fazem parte do
                  Domus.
                </p>
                <div>
                  <img
                    src={productLogo("relloo", "dark")}
                    alt="Relloo by Welabs"
                    width={85}
                    height={46}
                  />
                  <img
                    src={productLogo("domus", "dark")}
                    alt="Domus by Welabs"
                    width={85}
                    height={46}
                  />
                </div>
              </div>
              <div data-journey-step data-active="false">
                <span>Conhecimento</span>
                <h3>A resposta tem uma fonte.</h3>
                <p>
                  Knowly traz a informação que sustenta a conversa, sem perder o
                  contexto.
                </p>
                <div>
                  <img
                    src={productLogo("knowly", "dark")}
                    alt="Knowly by Welabs"
                    width={85}
                    height={46}
                  />
                </div>
              </div>
              <div data-journey-step data-active="false">
                <span>Operação</span>
                <h3>A decisão vira trabalho.</h3>
                <p>
                  O workflow segue a regra da operação e o resultado volta à
                  conversa.
                </p>
                <div>
                  <img
                    src={productLogo("magneto", "dark")}
                    alt="Magneto by Welabs"
                    width={85}
                    height={46}
                  />
                  <img
                    src={productLogo("tuner", "dark")}
                    alt="Tuner by Welabs"
                    width={85}
                    height={46}
                  />
                </div>
              </div>
            </div>
          </JourneySignals>
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

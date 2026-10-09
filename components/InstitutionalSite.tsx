"use client";
import Link from "./LangLink";
import { useT } from "@/components/LangProvider";
// Visible catalog only: hidden products get no card, page or solution entry (lib/catalog.ts)
import catalog, { isHiddenProduct } from "@/lib/catalog";
import styles from "./InstitutionalSite.module.css";
import { CompanyHero } from "./CompanyHero";
import {
  ProductCard,
  PortfolioCollection,
  ProductHub,
  PRODUCT_LOGO,
} from "./PortfolioShowcase";
import visuals from "@/lib/presentation-visuals.json";
import {
  MotionFilm,
  MotionGallery,
  filmFor,
  filmsForPage,
  overviewFilms,
  reelFilms,
} from "./MotionFilm";
import motionProducts from "@/lib/motion-products.json";
import { publicSlug } from "@/lib/public-slugs";
import { imagineHref } from "@/lib/sister-site";
import { PRODUCT_HIGHLIGHTS } from "@/lib/product-highlights";
import { ByWelabs } from "./ByWelabs";
type Item = (typeof catalog)[number];
type Locale = "pt-BR" | "en";
const localeFor = (lang: string): Locale => (lang === "en" ? "en" : "pt-BR");
// Products whose own logo replaces the page title; the monitoring ecosystem keeps its name in text.
const productLogo = PRODUCT_LOGO;
const productHref = (id: string) => `/produtos/${publicSlug(id)}`;
// O DESAFIO DE CADA PRODUTO
// One sentence per product: it opens the product page and feeds the solutions list.
const ownChallenge: Record<string, [string, string]> = {
  // Domus defines the business and gives rise to the systems (operator decision, 2026-10-08)
  erp: [
    "Definir a empresa inteira num lugar só e fazer dele nascer os sistemas que cada equipe usa.",
    "Define the whole company in one place and let the systems every team uses grow from it.",
  ],
  flow: [
    // Magneto is named by its function, workflow (operator, 2026-10-08)
    "Dar clareza ao workflow: cada tarefa e cada etapa acompanhadas.",
    "Bring clarity to the workflow: every task and every stage followed.",
  ],
  wekb: [
    "Encontrar informações com contexto e referência à fonte.",
    "Find information with context and a reference to the source.",
  ],
  "welabs-crm": [
    "Organizar o contexto das oportunidades e manter a continuidade do relacionamento comercial.",
    "Organize opportunity context and maintain continuity in commercial relationships.",
  ],
  malupe: [
    "Reunir eventos e registros para dar contexto ao acompanhamento da operação de segurança.",
    "Bring events and records together to give context to security operations follow-up.",
  ],
};
// COLEÇÃO DE PRODUTOS
// The company switch keeps both portfolios one click apart: Imagine opens its own site
// (NEXT_PUBLIC_IMAGINE_URL) and is hidden while that site is not configured.
export function PortfolioIndex() {
  const { lang } = useT();
  const en = lang === "en";
  const imaginePortfolio = imagineHref("/portfolio", lang);
  return (
    <div className={styles.site}>
      <section className={`${styles.hero} ${styles.collectionHero}`}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>WELABS</span>
          <h1>
            {en ? "Our products." : "Nossos produtos."}
            <br />
            <span>
              {en ? "Each context matters." : "Cada contexto importa."}
            </span>
          </h1>
          <div className={styles.indexIntro}>
            <p>
              {en
                ? "Management, relationships, automation and knowledge in our own product ecosystem."
                : "Gestão, relacionamento, automação e conhecimento em nosso ecossistema de produtos próprios."}
            </p>
            <nav
              className={styles.brandLinks}
              aria-label={en ? "Company portfolios" : "Portfólios das empresas"}
            >
              {imaginePortfolio && <a href={imaginePortfolio}>Imagine ↗</a>}
              <Link aria-current="page" href="/produtos">
                Welabs ↗
              </Link>
            </nav>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <PortfolioCollection />
        </div>
      </section>
    </div>
  );
}
// PÁGINA DE PRODUTO
// The product is told through its films (approved reel, or overview plus journey); the legacy
// presentation packs were never shown for Welabs products and left with the split of 2026-10-07.
// The catalog carries no maturity data: every product is shown as existing. Optional highlight
// blocks (lib/product-highlights.ts) follow the challenge.
export function ProductPage({ item }: { item: Item }) {
  const { lang } = useT();
  const en = lang === "en",
    locale = localeFor(lang),
    d = item.locales[locale];
  const visual = (
    visuals as Record<string, (typeof visuals)[keyof typeof visuals]>
  )[item.id];
  const problem = ownChallenge[item.id]?.[en ? 1 : 0] || d.summary;
  const highlights = PRODUCT_HIGHLIGHTS[item.id];
  // An approved reel replaces overview + journey with one ordered gallery; otherwise the business
  // overview opens the page and the journey film follows as "see it working".
  const reel = reelFilms(item.id);
  const overviews = reel.length ? reel : overviewFilms(item.id);
  const journey = reel.length ? undefined : filmFor(item.id, "journey");
  const overviewLabel = reel.length
    ? en
      ? "IN MOTION"
      : "EM MOVIMENTO"
    : en
      ? "PRODUCT OVERVIEW"
      : "VISÃO DO PRODUTO";
  return (
    <div className={styles.site}>
      <section className={`${styles.hero} ${styles.productHero}`}>
        <div className={styles.container}>
          <div className={styles.productCrumb}>
            <Link className={styles.small} href="/produtos">
              ← {en ? "Welabs products" : "Produtos Welabs"}
            </Link>
          </div>
          <div className={styles.productIntro}>
            <div>
              <span className={styles.eyebrow}>
                {/* The screenshot "product experience" was retired: the films present the product */}
                {item.publisher} / {en ? "PRODUCT" : "PRODUTO"}
              </span>
              {productLogo.has(item.id) && visual.logo ? (
                <h1 className={styles.logoTitle}>
                  {/* Welabs product logos carry their own plate and clear zone: no extra plate, sized by height */}
                  <span className={`${styles.heroLogo} ${styles.ownPlateLogo}`}>
                    <img
                      src={visual.logo}
                      alt={d.title}
                      width="360"
                      height="120"
                    />
                  </span>
                </h1>
              ) : (
                <h1 className={styles.compactTitle}>{d.title}</h1>
              )}
              <p className={styles.productSummary}>{d.summary}</p>
            </div>
            <aside className={styles.productIdentity}>
              <span className={styles.small}>
                {en ? "WHO IT SERVES" : "PARA QUEM"}
              </span>
              <p>{d.audience}</p>
            </aside>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <nav
            className={styles.subnav}
            aria-label={en ? "On this page" : "Nesta página"}
          >
            {overviews.length > 0 && (
              <a href="#visao">
                {reel.length
                  ? en
                    ? "In motion"
                    : "Em movimento"
                  : en
                    ? "Overview"
                    : "Visão do produto"}
              </a>
            )}
            {journey && (
              <a href="#funcionando">
                {en ? "See it working" : "Veja funcionando"}
              </a>
            )}
            <a href="#relacionados">{en ? "Related" : "Relacionados"}</a>
          </nav>
          {/* Threads: the challenge flows into the films */}
          <div className={styles.storyIntro} data-reveal="" data-thread="story">
            <span className={styles.eyebrow}>
              {en ? "THE CHALLENGE" : "O DESAFIO"}
            </span>
            <p>{problem}</p>
            {highlights && (
              <div className={styles.highlights}>
                {highlights.map((g) => (
                  // article keeps these headings out of the motion layer's spine
                  <article key={g.label[0]} className={styles.highlightGroup}>
                    <h2 className={styles.small}>{g.label[en ? 1 : 0]}</h2>
                    <h3>{g.lead[en ? 1 : 0]}</h3>
                    {g.tags && (
                      <ul className={styles.highlightTags}>
                        {g.tags.map((t) => (
                          <li key={t[0]}>{t[en ? 1 : 0]}</li>
                        ))}
                      </ul>
                    )}
                    {g.points && (
                      <ol className={styles.highlightPoints}>
                        {g.points.map((pt) => (
                          <li key={pt.title[0]}>
                            <strong>{pt.title[en ? 1 : 0]}</strong>
                            <span>{pt.text[en ? 1 : 0]}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
          <div
            id="visao"
            className={styles.anchor}
            data-thread-to="story"
            data-thread="films"
          >
            {overviews.length === 1 && (
              <MotionFilm
                key={overviews[0].id}
                item={overviews[0]}
                label={overviewLabel}
              />
            )}
            {overviews.length > 1 && (
              <MotionGallery
                key={item.id}
                items={overviews}
                label={overviewLabel}
              />
            )}
          </div>
          {journey && (
            <div id="funcionando" className={styles.anchor}>
              <MotionFilm
                key={journey.id}
                item={journey}
                label={en ? "SEE IT WORKING" : "VEJA FUNCIONANDO"}
              />
            </div>
          )}
          <section
            id="relacionados"
            className={`${styles.related} ${styles.anchor}`}
          >
            <span className={styles.eyebrow}>
              {en ? "CONTINUE EXPLORING" : "CONTINUE PELA COLEÇÃO"}
            </span>
            <h2 className={styles.relatedTitle}>
              {en ? "Other product contexts." : "Outros contextos de produto."}
            </h2>
            {/* The whole ecosystem as core and rails; the current product is highlighted in place */}
            <ProductHub currentId={item.id} />
          </section>
        </div>
      </section>
      <div className={`${styles.container} ${styles.closing}`}>
        <Link className={styles.textLink} href="/produtos">
          {en
            ? "Explore the Welabs ecosystem"
            : "Explorar o ecossistema Welabs"}{" "}
          ↗
        </Link>
      </div>
    </div>
  );
}
export function CompanyAbout() {
  const { lang } = useT();
  const en = lang === "en";
  return (
    <div className={styles.site}>
      <section className={`${styles.hero} ${styles.editorialHero}`}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>WELABS</span>
          <h1>
            {en ? "We are Welabs." : "Somos a Welabs."}
            <br />
            <span>{en ? "We build products." : "Criamos produtos."}</span>
          </h1>
          <p className={styles.deck}>
            {en
              ? "Our company builds its own products to connect management, relationships, automation and knowledge."
              : "Nossa empresa desenvolve produtos próprios para conectar gestão, relacionamento, automação e conhecimento."}
          </p>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.context} data-reveal-stagger="" data-reveal="">
            <div>
              <span className={styles.eyebrow}>
                {en ? "OUR APPROACH" : "NOSSA ATUAÇÃO"}
              </span>
              <h2>{en ? "Start with the work." : "Começar pelo trabalho."}</h2>
              <p>
                {en
                  ? "Understanding the context guides the decisions about the experience, the product and its evolution."
                  : "Compreender o contexto orienta as decisões sobre experiência, produto e evolução."}
              </p>
            </div>
            <div>
              <span className={styles.eyebrow}>
                {en ? "WHAT WE VALUE" : "O QUE VALORIZAMOS"}
              </span>
              <h2>
                {en ? "Clarity and continuity." : "Clareza e continuidade."}
              </h2>
              <p>
                {en
                  ? "Make journeys understandable and create room for the product to evolve as needs change."
                  : "Tornar as jornadas compreensíveis e criar espaço para o produto evoluir junto com as necessidades."}
              </p>
            </div>
          </div>
          <Link className={styles.textLink} href="/produtos">
            {en ? "Explore product contexts" : "Conhecer contextos de produto"}{" "}
            ↗
          </Link>
          <div className={styles.aboutProof}>
            <span className={styles.eyebrow}>
              {en ? "PRODUCT CONTEXTS" : "CONTEXTOS DE PRODUTO"}
            </span>
            <div className={styles.grid}>
              {/* Weight order: Relloo before Knowly */}
              {["welabs-crm", "wekb"].map((id) => (
                <ProductCard
                  key={id}
                  item={catalog.find((p) => p.id === id)!}
                  locale={localeFor(lang)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export function SolutionsPage() {
  const { lang } = useT();
  const en = lang === "en";
  const solutions = [
    [
      "erp",
      en ? "Define the business" : "Definir o negócio",
      ownChallenge.erp[en ? 1 : 0],
    ],
    // Weight order of the Welabs products (operator, 2026-10-08)
    [
      "welabs-crm",
      en ? "Follow relationships" : "Acompanhar relacionamentos",
      ownChallenge["welabs-crm"][en ? 1 : 0],
    ],
    [
      "flow",
      en ? "Run the workflow" : "Conduzir o workflow",
      ownChallenge.flow[en ? 1 : 0],
    ],
    [
      "wekb",
      en ? "Consult knowledge" : "Consultar conhecimento",
      ownChallenge.wekb[en ? 1 : 0],
    ],
    [
      "malupe",
      en ? "Put events in context" : "Dar contexto aos eventos",
      ownChallenge.malupe[en ? 1 : 0],
    ],
    // Hidden products (lib/catalog.ts) leave the list
  ].filter(([id]) => !isHiddenProduct(id));
  return (
    <div className={styles.site}>
      <section className={`${styles.hero} ${styles.editorialHero}`}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>WELABS</span>
          <h1>
            {en ? "Different needs." : "Necessidades diferentes."}
            <br />
            <span>
              {en ? "Products with context." : "Produtos com contexto."}
            </span>
          </h1>
          <p className={styles.deck}>
            {en
              ? "Find the product context that matches your team’s work."
              : "Encontre o contexto de produto que se aproxima do trabalho da sua equipe."}
          </p>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.solutionList}>
            {solutions.map(([id, title, copy], i) => {
              const item = catalog.find((p) => p.id === id)!;
              // Domus (first) defines the business and the others bring it to life: one thread reaches each of them.
              return (
                <article
                  key={id}
                  data-reveal=""
                  data-thread={i === 0 ? "hub" : undefined}
                  data-thread-to={i === 0 ? undefined : "hub"}
                >
                  <span className={styles.solutionNumber}>0{i + 1}</span>
                  <div>
                    {/* First mention of each product on the page: "<Product> by Welabs" (brand 1.5.0) */}
                    <span className={styles.small}>
                      {item.productName}
                      <ByWelabs />
                    </span>
                    <h2>{title}</h2>
                    <p>{copy}</p>
                  </div>
                  <Link className={styles.textLink} href={productHref(id)}>
                    {en ? "Explore" : "Conhecer"} {item.productName} ↗
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
// HOME DA WELABS
// The company opening, the product ecosystem (catalog and film-only products) and the platform films.
export function WelabsHome() {
  const { lang } = useT();
  const en = lang === "en",
    locale = localeFor(lang);
  return (
    <div className={styles.site}>
      <CompanyHero locale={locale} />
      <section className={styles.section}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>
            {en ? "OUR ECOSYSTEM" : "NOSSO ECOSSISTEMA"}
          </span>
          <h2>
            {en ? "Different contexts." : "Contextos diferentes."}
            <br />
            {en ? "The same company." : "A mesma empresa."}
          </h2>
          {/* Catalog and film-only products together, as the Domus hub */}
          <ProductHub threadTo={{ flow: "flow" }} />
          <p className={styles.note}>
            {en
              ? "The data shown in the films is fictional."
              : "Os dados exibidos nos filmes são fictícios."}
          </p>
          <div className={styles.related}>
            <MotionGallery
              items={filmsForPage("welabs")}
              label={
                en
                  ? "HOW THE PLATFORM CONNECTS"
                  : "COMO A PLATAFORMA SE CONECTA"
              }
            />
          </div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.company}`}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>WELABS</span>
          <h2>
            {en ? "One company." : "Uma empresa."}
            <br />
            {en ? "A connected ecosystem." : "Um ecossistema conectado."}
          </h2>
          <p>
            {en
              ? "We develop our own products for management, relationships, automation and knowledge, preserving the context of each operation."
              : "Desenvolvemos nossos próprios produtos para gestão, relacionamento, automação e conhecimento, preservando o contexto de cada operação."}
          </p>
          <Link className={styles.textLink} href="/solucoes">
            {en ? "Explore solutions" : "Explorar soluções"} ↗
          </Link>
        </div>
      </section>
    </div>
  );
}

// PRODUTOS APRESENTADOS SÓ POR FILME
// Products without a catalog entry (Tuner) get a film-only page, linked by public slug; their card
// joins the catalog ones inside the Domus hub (ProductHub).
type MotionProduct = (typeof motionProducts)[number];
export function MotionProductPage({ product }: { product: MotionProduct }) {
  const { lang } = useT();
  const en = lang === "en";
  // An approved reel shows as one ordered gallery; otherwise overview and journey films stack.
  const reel = reelFilms(product.id);
  const overview = filmFor(product.id, "business");
  const journey = filmFor(product.id, "journey");
  return (
    <div className={styles.site}>
      <section className={`${styles.hero} ${styles.productHero}`}>
        <div className={styles.container}>
          <div className={styles.productCrumb}>
            <Link className={styles.small} href="/produtos">
              ← {en ? "Welabs products" : "Produtos Welabs"}
            </Link>
          </div>
          <div className={styles.productIntro}>
            <div>
              <span className={styles.eyebrow}>
                {product.publisher} / {en ? "PRODUCT" : "PRODUTO"}
              </span>
              <h1 className={styles.logoTitle}>
                {/* A Welabs product logo (Tuner) carries its own plate, sized by height */}
                <span
                  className={`${styles.heroLogo} ${styles.ownPlateLogo}`}
                  // Tuner's wordmark has its own clear zone (no symbol), so it overrides the shared ratio
                  style={
                    {
                      "--logo-clear-zone": product.logoClearZone,
                    } as React.CSSProperties
                  }
                >
                  <img
                    src={product.logo}
                    alt={product.title}
                    width="360"
                    height="120"
                  />
                </span>
              </h1>
              <p className={styles.productSummary}>
                {en ? product.summary[1] : product.summary[0]}
              </p>
            </div>
            <aside className={styles.productIdentity}>
              <span className={styles.small}>
                {en ? "WHO IT SERVES" : "PARA QUEM"}
              </span>
              <p>{en ? product.audience[1] : product.audience[0]}</p>
            </aside>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          {reel.length > 0 ? (
            <MotionGallery
              key={product.id}
              items={reel}
              label={en ? "IN MOTION" : "EM MOVIMENTO"}
            />
          ) : (
            <>
              {overview && (
                <MotionFilm
                  item={overview}
                  title={product.title}
                  label={en ? "PRODUCT OVERVIEW" : "VISÃO DO PRODUTO"}
                />
              )}
              {journey && (
                <MotionFilm
                  item={journey}
                  title={product.title}
                  label={en ? "SEE IT WORKING" : "VEJA FUNCIONANDO"}
                />
              )}
            </>
          )}
        </div>
      </section>
      <div className={`${styles.container} ${styles.closing}`}>
        <Link className={styles.textLink} href="/produtos">
          {en
            ? "Explore the Welabs ecosystem"
            : "Explorar o ecossistema Welabs"}{" "}
          ↗
        </Link>
      </div>
    </div>
  );
}

"use client";
import Link from "./LangLink";
import { useT } from "@/components/LangProvider";
import catalog from "@/lib/presentation-catalog.json";
import contextCopy from "@/lib/product-context.json";
import { Presentation, type Manifest } from "./Presentation";
import { CtaSection } from "./CtaSection";
import styles from "./InstitutionalSite.module.css";
import { CompanyHero } from "./CompanyHero";
import {
  ProductCard,
  PortfolioCollection,
  PRODUCT_LOGO,
} from "./PortfolioShowcase";
import visuals from "@/lib/presentation-visuals.json";
import {
  MotionFilm,
  MotionGallery,
  coverFilm,
  filmFor,
  filmsForPage,
  overviewFilms,
  posterSrc,
  reelFilms,
} from "./MotionFilm";
import {
  ClientCarousel,
  FactCounters,
  KnowHowLink,
  KnowHowList,
  WorkSteps,
} from "./KnowHow";
import motionProducts from "@/lib/motion-products.json";
import emphasis from "@/lib/emphasis.json";
import { publicSlug } from "@/lib/public-slugs";
type Item = (typeof catalog)[number];
type Publisher = "Imagine" | "Welabs";
type Locale = "pt-BR" | "en";
const localeFor = (lang: string): Locale => (lang === "en" ? "en" : "pt-BR");
// Legacy framepacks that name a client agency, an internal codename or a retired product name stay off the product page.
const legacyHidden = new Set([
  "autoinfracao",
  "malupe",
  "sgors",
  "kiosk-brands",
  "erp",
  "wekb",
  "welabs-crm",
]);
// Products whose own logo replaces the page title; client-group logos keep a smaller title.
const productLogo = PRODUCT_LOGO;
// Imagine products whose films show Welabs products (Tabe.la operation shows Flow Studio and Channels) link to Welabs.
const citesWelabs = new Set(["tabela"]);
const href = (p: Item) =>
  p.publisher === "Welabs"
    ? `/welabs/produtos/${publicSlug(p.id)}`
    : `/portfolio/${publicSlug(p.id)}`;
// HOME IMAGINE
// Know-how and clients only: no film, player or presentation showcase. The platform know-how is
// described as Imagine capability, without naming the company or products behind it.
export function ImagineHome() {
  const { lang } = useT();
  const en = lang === "en",
    locale = localeFor(lang);
  return (
    <div className={styles.site}>
      <CompanyHero publisher="Imagine" locale={locale} />
      <section id="knowhow" className={`${styles.section} ${styles.band}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader} data-reveal="">
            <div>
              <span className={styles.eyebrow}>
                {en ? "OUR KNOW-HOW" : "NOSSO KNOW-HOW"}
              </span>
              <h2>
                {en ? "From the challenge" : "Do desafio"}
                <br />
                {en
                  ? "to an operation that keeps running."
                  : "à operação que não para."}
              </h2>
            </div>
          </div>
          <KnowHowList en={en} />
          <KnowHowLink en={en} />
        </div>
      </section>
      <section id="clientes" className={styles.section}>
        <div className={styles.container}>
          <div data-reveal="">
            <span className={styles.eyebrow}>
              {en ? "CLIENTS" : "CLIENTES"}
            </span>
            <h2>
              {en ? "Different industries." : "Setores diferentes."}
              <br />
              {en
                ? "The same care for the operation."
                : "A mesma atenção à operação."}
            </h2>
          </div>
          <ClientCarousel en={en} />
        </div>
      </section>
      <section id="processo" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader} data-reveal="">
            <div>
              <span className={styles.eyebrow}>
                {en ? "OUR APPROACH" : "NOSSA FORMA DE TRABALHAR"}
              </span>
              <h2>
                {en ? "Context comes first." : "O contexto vem primeiro."}
              </h2>
            </div>
          </div>
          <div className={styles.process} data-reveal-stagger="" data-reveal="">
            {(en
              ? [
                  [
                    "Understand",
                    "Listen to the people and understand the work.",
                  ],
                  [
                    "Shape",
                    "Organize journeys, priorities and the experience.",
                  ],
                  ["Build", "Develop, validate and refine the product."],
                  ["Evolve", "Follow changing needs and the next steps."],
                ]
              : [
                  ["Entender", "Ouvir as pessoas e compreender o trabalho."],
                  [
                    "Desenhar",
                    "Organizar jornadas, prioridades e experiência.",
                  ],
                  ["Construir", "Desenvolver, validar e refinar o produto."],
                  [
                    "Evoluir",
                    "Acompanhar as necessidades e os próximos passos.",
                  ],
                ]
            ).map(([a, b], i) => (
              <article key={a}>
                <span>0{i + 1}</span>
                <h3>{a}</h3>
                <p>{b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.company}`}>
        <div className={styles.container} data-reveal="">
          <span className={styles.eyebrow}>IMAGINE APPS</span>
          <h2>
            {en ? "People, processes" : "Pessoas, processos"}
            <br />
            {en ? "and technology." : "e tecnologia."}
          </h2>
          <p>
            {en
              ? "Our approach starts with the operation: who works, what they need to do and which experience helps that work."
              : "Nossa atuação começa pela operação: quem trabalha, o que precisa fazer e qual experiência ajuda esse trabalho."}
          </p>
          <Link className={styles.textLink} href="/sobre">
            {en ? "About Imagine" : "Sobre a Imagine"} ↗
          </Link>
        </div>
      </section>
      <CtaSection formId="home-contact" />
    </div>
  );
}
export function PortfolioIndex({
  publisher = "Imagine",
}: {
  publisher?: Publisher;
}) {
  const { lang } = useT();
  const en = lang === "en",
    we = publisher === "Welabs";
  return (
    <div className={styles.site}>
      <section className={`${styles.hero} ${styles.collectionHero}`}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>
            {we ? "WELABS" : en ? "IMAGINE / PORTFOLIO" : "IMAGINE / PORTFÓLIO"}
          </span>
          <h1>
            {we
              ? en
                ? "Our products."
                : "Nossos produtos."
              : en
                ? "Product experiences."
                : "Experiências de produto."}
            <br />
            <span>
              {we
                ? en
                  ? "Each context matters."
                  : "Cada contexto importa."
                : en
                  ? "Different operations."
                  : "Operações diferentes."}
            </span>
          </h1>
          <div className={styles.indexIntro}>
            <p>
              {we
                ? en
                  ? "Management, knowledge, relationships and automation in our own product ecosystem."
                  : "Gestão, conhecimento, relacionamento e automação em nosso ecossistema de produtos próprios."
                : en
                  ? "Explore product contexts through their brands, challenges and illustrative journeys."
                  : "Conheça contextos de produto por suas marcas, desafios e jornadas ilustrativas."}
            </p>
            <nav
              className={styles.brandLinks}
              aria-label={en ? "Company portfolios" : "Portfólios das empresas"}
            >
              <Link aria-current={!we ? "page" : undefined} href="/portfolio">
                Imagine ↗
              </Link>
              <Link
                aria-current={we ? "page" : undefined}
                href="/welabs/produtos"
              >
                Welabs ↗
              </Link>
            </nav>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <PortfolioCollection publisher={publisher} />
          {!we && (
            <div className={styles.related}>
              <span className={styles.eyebrow}>
                {en ? "CLIENTS" : "CLIENTES"}
              </span>
              <ClientCarousel en={en} />
            </div>
          )}
        </div>
      </section>
      {!we && <CtaSection formId="portfolio-contact" />}
    </div>
  );
}
const ownChallenge: Record<string, [string, string]> = {
  erp: [
    "Manter cadastros, regras, contratos, fiscal e integrações num só lugar, consumido por todos os produtos.",
    "Keep records, rules, contracts, tax and integrations in one place that every product consumes.",
  ],
  flow: [
    "Dar clareza ao acompanhamento de tarefas e etapas de automação.",
    "Bring clarity to following automation tasks and stages.",
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
export function ProductPage({
  manifest,
  item,
}: {
  manifest: Manifest;
  item: Item;
}) {
  const { lang } = useT();
  const en = lang === "en",
    locale = localeFor(lang),
    d = item.locales[locale];
  const children = catalog.filter((p) => p.parentId === item.id);
  const context = (
    contextCopy as Record<
      string,
      Record<string, { problem: string; participation: string }>
    >
  )[item.id]?.[locale];
  const visual = (
    visuals as Record<string, (typeof visuals)[keyof typeof visuals]>
  )[item.id];
  const stage =
    item.maturity === "alpha"
      ? "Alpha"
      : item.maturity === "development"
        ? en
          ? "In development"
          : "Em desenvolvimento"
        : item.maturity === "historical-pending"
          ? en
            ? "Historical context"
            : "Contexto histórico"
          : en
            ? "Concept presentation"
            : "Apresentação conceitual";
  const problem =
    context?.problem || ownChallenge[item.id]?.[en ? 1 : 0] || d.summary;
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
            <Link
              className={styles.small}
              href={
                item.publisher === "Welabs" ? "/welabs/produtos" : "/portfolio"
              }
            >
              ←{" "}
              {item.publisher === "Welabs"
                ? en
                  ? "Welabs products"
                  : "Produtos Welabs"
                : en
                  ? "Portfolio"
                  : "Portfólio"}
            </Link>
            <span className={styles.stageBadge}>{stage}</span>
          </div>
          <div className={styles.productIntro}>
            <div>
              <span className={styles.eyebrow}>
                {item.publisher} /{" "}
                {en ? "PRODUCT EXPERIENCE" : "EXPERIÊNCIA DE PRODUTO"}
              </span>
              {productLogo.has(item.id) && visual.logo ? (
                <h1 className={styles.logoTitle}>
                  <span
                    className={`${styles.heroLogo} ${visual.logoPlate === "light" ? styles.lightLogo : styles.darkLogo}`}
                  >
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
              {visual.logo && !productLogo.has(item.id) && (
                <span
                  className={`${styles.detailLogo} ${styles.clientLogoSmall} ${visual.logoPlate === "light" ? styles.lightLogo : styles.darkLogo}`}
                >
                  <img
                    src={visual.logo}
                    alt={item.brand.name}
                    width="160"
                    height="56"
                  />
                </span>
              )}
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
            {!legacyHidden.has(item.id) && (
              <a href="#experiencia">{en ? "Experience" : "Experiência"}</a>
            )}
            <a href="#relacionados">{en ? "Related" : "Relacionados"}</a>
          </nav>
          {/* Threads: the challenge flows into the films, the films into the readable experience (or the Welabs link) */}
          <div className={styles.storyIntro} data-reveal="" data-thread="story">
            <span className={styles.eyebrow}>
              {en ? "THE CHALLENGE" : "O DESAFIO"}
            </span>
            <p>{problem}</p>
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
          {item.publisher === "Imagine" && citesWelabs.has(item.id) && (
            <Link
              className={styles.textLink}
              href="/welabs"
              data-thread-to="films"
            >
              {en
                ? "Flow and Channels: see the Welabs platform"
                : "Flow e Channels: conheça a plataforma Welabs"}{" "}
              ↗
            </Link>
          )}
          {journey && (
            <div id="funcionando" className={styles.anchor}>
              <MotionFilm
                key={journey.id}
                item={journey}
                label={en ? "SEE IT WORKING" : "VEJA FUNCIONANDO"}
              />
            </div>
          )}
          {!legacyHidden.has(item.id) && (
            <>
              <span id="experiencia" className={styles.anchor} />
              <div
                data-thread-to={citesWelabs.has(item.id) ? undefined : "films"}
              >
                <span className={styles.eyebrow}>
                  {en ? "READ THE EXPERIENCE" : "LEIA A EXPERIÊNCIA"}
                </span>
                <Presentation
                  key={item.id}
                  manifest={manifest}
                  baseUrl={item.presentationBase}
                />
              </div>
              <div className={styles.presentationLinks}>
                <Link
                  className={styles.textLink}
                  href={`/apresentacoes/${item.id}`}
                >
                  {en
                    ? "Open the complete presentation"
                    : "Abrir apresentação completa"}{" "}
                  ↗
                </Link>
                <span>
                  {en
                    ? "Illustrative journey with fictional data."
                    : "Jornada ilustrativa com dados fictícios."}
                </span>
              </div>
            </>
          )}
          {context && (
            <div className={styles.participation} data-reveal="">
              <span className={styles.eyebrow}>
                {en ? "PRESENTED PARTICIPATION" : "PARTICIPAÇÃO APRESENTADA"}
              </span>
              <p>{context.participation}</p>
            </div>
          )}
          {children.length > 0 && (
            <section className={styles.related}>
              <span className={styles.eyebrow}>
                {en ? "WITHIN THIS CONTEXT" : "NESTE CONTEXTO"}
              </span>
              <h2>{en ? "Explore each journey." : "Conheça cada jornada."}</h2>
              <div className={styles.grid}>
                {children.map((p) => (
                  <ProductCard key={p.id} item={p} locale={locale} />
                ))}
              </div>
            </section>
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
            <div className={styles.grid}>
              {catalog
                .filter(
                  (p) =>
                    p.publisher === item.publisher &&
                    p.id !== item.id &&
                    (item.publisher === "Welabs" || p.status === "selecionado"),
                )
                .slice(0, 2)
                .map((p) => (
                  <ProductCard key={p.id} item={p} locale={locale} />
                ))}
            </div>
          </section>
        </div>
      </section>
      {item.publisher === "Imagine" ? (
        <CtaSection formId={`case-${item.id}`} />
      ) : (
        <div className={`${styles.container} ${styles.closing}`}>
          <Link className={styles.textLink} href="/welabs/produtos">
            {en
              ? "Explore the Welabs ecosystem"
              : "Explorar o ecossistema Welabs"}{" "}
            ↗
          </Link>
        </div>
      )}
    </div>
  );
}
export function StandalonePresentation({
  manifest,
  item,
}: {
  manifest: Manifest;
  item: Item;
}) {
  const { lang } = useT();
  const d = item.locales[localeFor(lang)];
  return (
    <div className={`${styles.site} ${styles.standalone}`}>
      <div className={styles.container}>
        <Link href={href(item)} className={styles.textLink}>
          ← {lang === "en" ? "Back to the product" : "Voltar ao produto"}
        </Link>
        <h1>{d.title}</h1>
        <Presentation
          key={item.id}
          manifest={manifest}
          baseUrl={item.presentationBase}
        />
      </div>
    </div>
  );
}
export function CompanyAbout({
  publisher = "Imagine",
}: {
  publisher?: Publisher;
}) {
  const { lang } = useT();
  const en = lang === "en",
    we = publisher === "Welabs";
  return (
    <div className={styles.site}>
      <section className={`${styles.hero} ${styles.editorialHero}`}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>
            {we ? "WELABS" : "IMAGINE APPS"}
          </span>
          <h1>
            {we
              ? en
                ? "We are Welabs."
                : "Somos a Welabs."
              : en
                ? "Context, people"
                : "Contexto, pessoas"}
            <br />
            <span>
              {we
                ? en
                  ? "We build products."
                  : "Criamos produtos."
                : en
                  ? "and the next step."
                  : "e o próximo passo."}
            </span>
          </h1>
          <p className={styles.deck}>
            {we
              ? en
                ? "Our company builds its own products to connect management, knowledge, relationships and automation."
                : "Nossa empresa desenvolve produtos próprios para conectar gestão, conhecimento, relacionamento e automação."
              : en
                ? "We work on digital experiences shaped around the operation and the people using them."
                : "Trabalhamos em experiências digitais pensadas a partir da operação e das pessoas que as utilizam."}
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
          <Link
            className={styles.textLink}
            href={we ? "/welabs/produtos" : "/portfolio"}
          >
            {en ? "Explore product contexts" : "Conhecer contextos de produto"}{" "}
            ↗
          </Link>
          <div className={styles.aboutProof}>
            <span className={styles.eyebrow}>
              {en ? "PRODUCT CONTEXTS" : "CONTEXTOS DE PRODUTO"}
            </span>
            <div className={styles.grid}>
              {(we ? ["wekb", "welabs-crm"] : ["stant", "sgors"]).map((id) => (
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
      {!we && <CtaSection formId="about-contact" />}
    </div>
  );
}
export function SolutionsPage({
  publisher = "Imagine",
}: {
  publisher?: Publisher;
}) {
  const { lang } = useT();
  const en = lang === "en",
    we = publisher === "Welabs";
  const solutions = [
    [
      "erp",
      en ? "Organize management" : "Organizar a gestão",
      ownChallenge.erp[en ? 1 : 0],
    ],
    [
      "wekb",
      en ? "Consult knowledge" : "Consultar conhecimento",
      ownChallenge.wekb[en ? 1 : 0],
    ],
    [
      "welabs-crm",
      en ? "Follow relationships" : "Acompanhar relacionamentos",
      ownChallenge["welabs-crm"][en ? 1 : 0],
    ],
    [
      "flow",
      en ? "Follow automation" : "Acompanhar automações",
      ownChallenge.flow[en ? 1 : 0],
    ],
    [
      "malupe",
      en ? "Put events in context" : "Dar contexto aos eventos",
      ownChallenge.malupe[en ? 1 : 0],
    ],
  ];
  return (
    <div className={styles.site}>
      <section className={`${styles.hero} ${styles.editorialHero}`}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>
            {we
              ? "WELABS"
              : en
                ? "IMAGINE / OUR APPROACH"
                : "IMAGINE / ATUAÇÃO"}
          </span>
          <h1>
            {we
              ? en
                ? "Different needs."
                : "Necessidades diferentes."
              : en
                ? "What we do."
                : "O que fazemos."}
            <br />
            <span>
              {we
                ? en
                  ? "Products with context."
                  : "Produtos com contexto."
                : en
                  ? "And how we work."
                  : "E como atuamos."}
            </span>
          </h1>
          <p className={styles.deck}>
            {we
              ? en
                ? "Find the product context that matches your team’s work."
                : "Encontre o contexto de produto que se aproxima do trabalho da sua equipe."
              : en
                ? "Integration, applied AI, custom software, service channels and infrastructure: five fronts that meet in the same operation, from the first conversation to the product in use."
                : "Integração, IA aplicada, software sob medida, canais de atendimento e infraestrutura: cinco frentes que se encontram na mesma operação, da primeira conversa ao produto em uso."}
          </p>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          {we ? (
            <div className={styles.solutionList}>
              {solutions.map(([id, title, copy], i) => {
                const item = catalog.find((p) => p.id === id)!;
                // The domain hub (first) feeds every other product: one thread reaches each of them.
                return (
                  <article
                    key={id}
                    data-reveal=""
                    data-thread={i === 0 ? "hub" : undefined}
                    data-thread-to={i === 0 ? undefined : "hub"}
                  >
                    <span className={styles.solutionNumber}>0{i + 1}</span>
                    <div>
                      <span className={styles.small}>
                        {item.productName} /{" "}
                        {item.maturity === "alpha"
                          ? "Alpha"
                          : en
                            ? "In development"
                            : "Em desenvolvimento"}
                      </span>
                      <h2>{title}</h2>
                      <p>{copy}</p>
                    </div>
                    <Link
                      className={styles.textLink}
                      href={`/welabs/produtos/${publicSlug(id)}`}
                    >
                      {en ? "Explore" : "Conhecer"} {item.productName} ↗
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <ImagineApproach en={en} />
          )}
        </div>
      </section>
      {!we && <CtaSection formId="services-contact" />}
    </div>
  );
}
export function WelabsHome() {
  const { lang } = useT();
  const en = lang === "en",
    locale = localeFor(lang);
  return (
    <div className={styles.site}>
      <CompanyHero publisher="Welabs" locale={locale} />
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
          <div className={styles.grid}>
            {catalog
              .filter((p) => p.publisher === "Welabs")
              .sort(
                (a, b) =>
                  emphasis.welabs.indexOf(a.id) - emphasis.welabs.indexOf(b.id),
              )
              .map((p) => (
                <ProductCard
                  key={p.id}
                  item={p}
                  locale={locale}
                  threadTo={p.id === "flow" ? "flow" : undefined}
                />
              ))}
          </div>
          <MotionProductGrid en={en} publisher="Welabs" />
          <p className={styles.note}>
            {en
              ? "Stages and illustrative data are identified for each product."
              : "Os estágios e os dados ilustrativos são identificados em cada produto."}
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
              ? "We develop our own products for management, knowledge, relationships and automation, preserving the context of each operation."
              : "Desenvolvemos nossos próprios produtos para gestão, conhecimento, relacionamento e automação, preservando o contexto de cada operação."}
          </p>
          <Link className={styles.textLink} href="/welabs/solucoes">
            {en ? "Explore solutions" : "Explorar soluções"} ↗
          </Link>
        </div>
      </section>
    </div>
  );
}

// ATUAÇÃO DA IMAGINE
// What we do and how we work, told with reveals, threads, counters and steps; no film here
// (films live only in the portfolio). Figures are counted from the site's own data.
function ImagineApproach({ en }: { en: boolean }) {
  const systems =
    catalog.filter(
      (p) => p.publisher === "Imagine" && p.status === "selecionado",
    ).length +
    motionProducts.filter((p) => p.publisher === "Imagine" && coverFilm(p.id))
      .length;
  return (
    <>
      <FactCounters en={en} systems={systems} />
      <div className={styles.related}>
        <div data-reveal="">
          <span className={styles.eyebrow}>
            {en ? "WHAT WE DO" : "O QUE FAZEMOS"}
          </span>
          <h2>
            {en ? "Five fronts," : "Cinco frentes,"}
            <br />
            {en ? "one operation." : "uma operação."}
          </h2>
        </div>
        <KnowHowList en={en} detailed />
      </div>
      <div className={styles.related}>
        <div data-reveal="">
          <span className={styles.eyebrow}>
            {en ? "HOW WE WORK" : "COMO ATUAMOS"}
          </span>
          <h2>
            {en ? "Context comes first." : "O contexto vem primeiro."}
            <br />
            {en ? "Then, short steps." : "Depois, passos curtos."}
          </h2>
        </div>
        <WorkSteps en={en} />
      </div>
      <div className={styles.servicesClosing} data-reveal="">
        <span className={styles.eyebrow}>
          {en ? "SEE IT APPLIED" : "VEJA APLICADO"}
        </span>
        <p>
          {en
            ? "The portfolio shows these fronts at work in real product contexts, with films and illustrative data."
            : "O portfólio mostra essas frentes trabalhando em contextos de produto, com filmes e dados ilustrativos."}
        </p>
        <Link className={styles.textLink} href="/portfolio">
          {en ? "Explore the portfolio" : "Explorar o portfólio"} ↗
        </Link>
      </div>
    </>
  );
}

// PRODUTOS APRESENTADOS SÓ POR FILME
// Products without a legacy framepack (IUS, Netsafety, Report CRM; Channels on Welabs) get a film-only card and page.
type MotionProduct = (typeof motionProducts)[number];
const motionHref = (p: MotionProduct) =>
  p.publisher === "Welabs" ? `/welabs/produtos/${p.id}` : `/portfolio/${p.id}`;
function MotionProductGrid({
  en,
  publisher = "Imagine",
}: {
  en: boolean;
  publisher?: Publisher;
}) {
  const items = motionProducts.filter(
    (p) => p.publisher === publisher && coverFilm(p.id),
  );
  if (!items.length) return null;
  return (
    <section className={styles.related}>
      <span className={styles.eyebrow}>
        {en ? "MORE PRODUCTS" : "MAIS PRODUTOS"}
      </span>
      <div className={styles.grid}>
        {items.map((p) => (
          <article key={p.id} className={styles.card} data-reveal="">
            <Link className={styles.visual} href={motionHref(p)}>
              <img
                src={posterSrc(coverFilm(p.id, p.publisher)!)}
                alt=""
                width="1200"
                height="675"
                loading="lazy"
              />
              <span aria-hidden="true">↗</span>
            </Link>
            <div className={styles.cardBody}>
              <span className={styles.small}>
                {en ? p.sector[1] : p.sector[0]} ·{" "}
                {en ? p.stage[1] : p.stage[0]}
              </span>
              <h2>
                <Link href={motionHref(p)}>{p.title}</Link>
              </h2>
              <p>{en ? p.summary[1] : p.summary[0]}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
export function MotionProductPage({ product }: { product: MotionProduct }) {
  const { lang } = useT();
  const en = lang === "en";
  const we = product.publisher === "Welabs";
  // An approved reel shows as one ordered gallery; otherwise overview and journey films stack.
  const reel = reelFilms(product.id);
  const overview = filmFor(product.id, "business");
  const journey = filmFor(product.id, "journey");
  return (
    <div className={styles.site}>
      <section className={`${styles.hero} ${styles.productHero}`}>
        <div className={styles.container}>
          <div className={styles.productCrumb}>
            <Link
              className={styles.small}
              href={we ? "/welabs/produtos" : "/portfolio"}
            >
              ←{" "}
              {we
                ? en
                  ? "Welabs products"
                  : "Produtos Welabs"
                : en
                  ? "Portfolio"
                  : "Portfólio"}
            </Link>
            <span className={styles.stageBadge}>
              {en ? product.stage[1] : product.stage[0]}
            </span>
          </div>
          <div className={styles.productIntro}>
            <div>
              <span className={styles.eyebrow}>
                {product.publisher} / {en ? "PRODUCT" : "PRODUTO"}
              </span>
              {"logo" in product && product.logo ? (
                <h1 className={styles.logoTitle}>
                  <span className={`${styles.heroLogo} ${styles.lightLogo}`}>
                    <img
                      src={product.logo}
                      alt={product.title}
                      width="360"
                      height="120"
                    />
                  </span>
                </h1>
              ) : (
                <h1 className={styles.compactTitle}>{product.title}</h1>
              )}
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
      {we ? (
        <div className={`${styles.container} ${styles.closing}`}>
          <Link className={styles.textLink} href="/welabs/produtos">
            {en
              ? "Explore the Welabs ecosystem"
              : "Explorar o ecossistema Welabs"}{" "}
            ↗
          </Link>
        </div>
      ) : (
        <CtaSection formId={`case-${product.id}`} />
      )}
    </div>
  );
}

import { productData } from "./data/demo-data.js";
import { storyData } from "./data/story-data.js";
import { measureTarget, placeActionMarkers, waitForStableAssets } from "./shared/measured-action.js";
import {
  animateMeasuredAction,
  animateEntityHandoff,
  applyBrandTokens,
  createExclusiveSurfaceTransition,
  renderProductButton,
  renderProductCard,
  renderProductHeader,
  renderProductSurface,
} from "./shared/product-components.js";

const compositionId = "tabela-business-journey";
const browser = document.querySelector("#browser-page");
const stage = document.querySelector("#product-stage");
const content = browser.querySelector(".fvp-browser__content");
const brandTokens = await fetch("./assets/brand-tokens.json").then((response) => {
  if (!response.ok) throw new Error(`Brand token request failed: ${response.status}`);
  return response.json();
});

function buildingArtwork(colors) {
  return `<svg viewBox="0 0 460 352" role="img" aria-label="Ilustração DEMO de edifício residencial"><rect width="460" height="352" fill="${colors.supportSoft}"/><path d="M0 274h460v78H0z" fill="${colors.line}"/><path d="M110 274V104l116-48 120 48v170z" fill="${colors.surface}" stroke="${colors.accent}" stroke-width="7"/><path d="M226 58v216" stroke="${colors.accent}" stroke-width="6"/><path d="M132 128h62v48h-62zm126 0h62v48h-62zm-126 76h62v48h-62zm126 0h62v48h-62z" fill="${colors.muted}"/><path d="M200 274v-37h54v37" fill="${colors.secondary}"/></svg>`;
}

// Keep the agency record visually separate while reusing the same card structure.
function buildingCard({ id, detail = false, building = productData.building } = {}) {
  return renderProductCard({
    id,
    entityId: building.id,
    title: building.name,
    metadata: {
      location: building.location,
      type: building.type,
      summary: detail ? building.summary : "",
    },
    artwork: buildingArtwork(brandTokens.colors),
    detail,
  });
}

function productHeader(label) {
  return renderProductHeader({
    label,
    status: "DEMO · reconstrução ilustrativa",
  });
}

function pageTitle(kicker, title, copy = "") {
  return `<p class="section-kicker">${kicker}</p><h1 class="screen-title">${title}</h1>${copy ? `<p class="screen-copy">${copy}</p>` : ""}`;
}

function entityTrail() {
  return `<div class="entity-trail" aria-label="Entidade de referência"><span>${productData.building.name}</span><span aria-hidden="true">›</span><strong>Unidade 304 · DEMO</strong></div>`;
}

const developerScreen = renderProductSurface({
  id: "developer-screen",
  label: "Incorporadora organiza o portfólio",
  children: `${productHeader("Incorporadora DEMO").replace("app-topline", "app-topline persona-header")}
    ${pageTitle("PLATAFORMA DE COMERCIALIZAÇÃO IMOBILIÁRIA", "Da incorporadora à proposta", "Incorporadora, corretor e imobiliária têm trabalhos próprios.")}
    <div class="business-context">
      <div><h2 class="business-context__name">${productData.business.name}</h2><p class="business-context__meta">Organize empreendimentos e suas tabelas de preços.</p></div>
      ${renderProductButton({ id: "developer-cta", label: "Ver empreendimentos" })}
    </div>`,
});

const portfolioScreen = renderProductSurface({
  id: "portfolio-screen",
  label: "Portfólio filtrado pela incorporadora",
  children: `${productHeader("Incorporadora DEMO")}
    ${pageTitle("PORTFÓLIO FILTRADO", "Empreendimentos", "A seleção mantém o contexto da incorporadora.")}
    <div class="filter-row"><span class="filter-label">Incorporadora</span><span class="filter-chip">${productData.business.name}</span></div>
    ${buildingCard({ id: "building-card" })}`,
});

const detailScreen = renderProductSurface({
  id: "detail-screen",
  label: "Detalhe do empreendimento",
  children: `${productHeader("Incorporadora DEMO")}
    <nav class="detail-breadcrumb" aria-label="Caminho"><span>Empreendimentos</span><span aria-hidden="true">›</span><strong>${productData.building.name}</strong></nav>
    ${pageTitle("EMPREENDIMENTO", productData.building.name, "Consulte as informações e as tabelas deste empreendimento.")}
    ${buildingCard({ id: "building-detail-card", detail: true })}
    <div class="detail-tabs" aria-label="Seções do empreendimento"><span class="detail-tab detail-tab--active">Visão geral</span><button id="prices-tab" class="detail-tab" type="button">Tabelas de preços <span aria-hidden="true">→</span></button></div>`,
});

const priceTableScreen = renderProductSurface({
  id: "price-table-screen",
  label: "Tabela de preços e unidade demonstrativa",
  children: `${productHeader("Incorporadora DEMO")}
    <nav class="detail-breadcrumb" aria-label="Caminho"><span>${productData.building.name}</span><span aria-hidden="true">›</span><strong>Tabelas de preços</strong></nav>
    ${pageTitle("TABELA DO EMPREENDIMENTO", "Unidades para consulta", "A tabela organiza as unidades vinculadas a este empreendimento.")}
    ${entityTrail()}
    <div class="unit-table" role="table" aria-label="Unidades demonstrativas">
      <div class="unit-table__head" role="row"><span>Unidade</span><span>Identificação</span><span>Consulta</span></div>
      <div class="unit-table__row" role="row"><span>302</span><span>Residencial Horizonte</span><span>DEMO</span></div>
      <button id="unit-304-row" class="unit-table__row unit-table__row--selected" type="button" aria-label="Selecionar unidade 304 para consulta"><strong>304</strong><span>${productData.building.name}</span><b>Consultar unidade <span aria-hidden="true">→</span></b></button>
      <div class="unit-table__row" role="row"><span>306</span><span>Residencial Horizonte</span><span>DEMO</span></div>
    </div>`,
});

const realtorScreen = renderProductSurface({
  id: "realtor-screen",
  label: "Corretor consulta empreendimento e unidade",
  children: `${productHeader("Corretor · consulta DEMO")}
    ${pageTitle("CORRETOR", "Consulta do empreendimento", "Autônomo ou vinculado: consultar a unidade é o mesmo trabalho.")}
    ${entityTrail()}
    <div class="realtor-layout">${buildingCard({ id: "realtor-building-card" })}<div class="realtor-unit-panel"><span class="panel-kicker">UNIDADE EM CONSULTA</span><strong>304</strong>${renderProductButton({ id: "realtor-unit-select", label: "Montar proposta" })}</div></div>`,
});

const proposalComposeScreen = renderProductSurface({
  id: "proposal-compose-screen",
  label: "Corretor monta a proposta demonstrativa",
  children: `${productHeader("Corretor · proposta DEMO")}
    ${pageTitle("MONTAGEM", "Proposta ligada à unidade", "Empreendimento e unidade acompanham a proposta.")}
    ${entityTrail()}
    <div class="proposal-workspace">
      <ol class="proposal-steps"><li class="proposal-step proposal-step--done"><span>1</span><b>Empreendimento</b><small>Residencial Horizonte</small></li><li class="proposal-step proposal-step--done"><span>2</span><b>Unidade</b><small>304 · DEMO</small></li><li class="proposal-step proposal-step--current"><span>3</span><b>Conferência</b><small>Conferir empreendimento e unidade</small></li></ol>
      <div class="proposal-summary"><span class="panel-kicker">OBJETO DA PROPOSTA DEMO</span><h2>Residencial Horizonte · Unidade 304</h2>${renderProductButton({ id: "proposal-review-cta", label: "Revisar proposta" })}</div>
    </div>`,
});

const proposalReviewScreen = renderProductSurface({
  id: "proposal-review-screen",
  label: "Revisão da proposta sem envio",
  children: `${productHeader("Corretor · revisão DEMO")}
    ${pageTitle("REVISÃO", "Conferir antes de continuar", "Conferência de empreendimento, unidade e etapa.")}
    ${entityTrail()}
    <div class="review-layout"><div class="review-checklist"><span class="panel-kicker">RESUMO DEMONSTRATIVO</span><h2>Proposta · Unidade 304</h2><div class="review-line"><span>Empreendimento</span><strong>Residencial Horizonte</strong></div><div class="review-line"><span>Unidade</span><strong>304 · DEMO</strong></div><div class="review-line"><span>Etapa</span><strong>Revisão em tela</strong></div></div><aside class="review-stop"><b>Conferência em tela</b><span>Empreendimento e unidade permanecem visíveis.</span></aside></div>`,
});

const agencyScreen = renderProductSurface({
  id: "agency-screen",
  label: "Imobiliária consulta registro demonstrativo preexistente",
  children: `${productHeader("Imobiliária · consulta DEMO")}
    <div class="context-change"><span class="context-change__eyebrow">REGISTRO DEMO</span><strong>Área da imobiliária · exemplo independente</strong><p>Consulta de um registro preexistente.</p></div>
    ${pageTitle("IMOBILIÁRIA", "Propostas dos corretores", "A imobiliária acompanha registros de sua equipe.")}
    <div class="agency-record">${buildingCard({ id: "agency-record-card", building: productData.agencyRecord })}<div class="agency-record__stamp"><strong>REGISTRO DEMO</strong><span>Preexistente</span><b>${productData.agencyRecord.name} · Unidade ${productData.agencyRecord.unit} · DEMO</b></div></div>`,
});

FeatureVideoBrowserPage.configure(browser, {
  address: "app.tabe.la/jornada-demo",
  avatar: "DE",
  title: "Tabe.la · Jornada DEMO",
  heading: "Jornada DEMO",
  copy: "Comercialização imobiliária.",
  tabs: ["Tabe.la · Jornada DEMO", "Catálogo DEMO"],
  activeTab: 0,
  stage: "content",
  wireframe: false,
  duration: storyData.duration,
  palette: {
    accent: brandTokens.colors.accent,
    ink: brandTokens.colors.ink,
    panel: brandTokens.colors.windowPanel,
    page: brandTokens.colors.windowPage,
    line: brandTokens.colors.line,
    muted: brandTokens.colors.muted,
  },
  content: {
    type: "html",
    html: `<div class="app-shell" id="app-shell">${developerScreen}${portfolioScreen}${detailScreen}${priceTableScreen}${realtorScreen}${proposalComposeScreen}${proposalReviewScreen}${agencyScreen}</div>`,
  },
});

applyBrandTokens(stage, brandTokens);
await waitForStableAssets(stage);

const gsap = window.gsap;
const timeline = window.__timelines[compositionId];
const cursor = document.querySelector("#cursor-origin");
const focusRing = document.querySelector("#click-origin");
const focusGlyph = document.querySelector("#focus-ring");
const flight = document.querySelector("#entity-flight");
const screenIds = ["developer-screen", "portfolio-screen", "detail-screen", "price-table-screen", "realtor-screen", "proposal-compose-screen", "proposal-review-screen", "agency-screen"];
const screens = new Map(screenIds.map((id) => [id, content.querySelector(`#${id}`)]));

gsap.set([...screens.values()], { autoAlpha: 0 });
gsap.set(screens.get("developer-screen"), { autoAlpha: 1 });
gsap.set([cursor, focusRing, flight], { autoAlpha: 0 });

const sourceEntity = content.querySelector("#building-card");
const destinationEntity = content.querySelector("#building-detail-card");
gsap.set(destinationEntity, { autoAlpha: 0 });
const sourceEntityBox = measureTarget(stage, "#building-card").targetBox;
const destinationEntityBox = measureTarget(stage, "#building-detail-card").targetBox;
flight.innerHTML = sourceEntity.outerHTML;
flight.firstElementChild.removeAttribute("id");
flight.firstElementChild.classList.add("product-entity-flight-card");
gsap.set(flight, {
  left: sourceEntityBox.x,
  top: sourceEntityBox.y,
  width: sourceEntityBox.width,
  height: sourceEntityBox.height,
});

const geometry = [];
for (const action of storyData.actions) {
  const measured = measureTarget(stage, action.target);
  const cursorStart = { ...action.cursorStart };
  const markerMeasurement = {
    actionId: action.id,
    targetSelector: action.target,
    targetBox: measured.targetBox,
    targetCenter: measured.center,
    ...placeActionMarkers(cursor, focusRing, measured.center),
    cursorStart,
    contact: action.contact,
    pressure: action.pressure,
  };
  geometry.push(markerMeasurement);

  timeline.set(cursor, { left: cursorStart.x, top: cursorStart.y, autoAlpha: 0 }, Math.max(0, action.approachStart - 0.02));
  animateMeasuredAction({
    timeline,
    cursor,
    focusContainer: focusRing,
    focusGlyph,
    target: measured.target,
    startCenter: cursorStart,
    targetCenter: measured.center,
    action,
  });
  timeline.set(cursor, { autoAlpha: 0 }, action.responseEnd);

  createExclusiveSurfaceTransition({
    timeline,
    from: screens.get(action.transition.from.slice(1)),
    to: screens.get(action.transition.to.slice(1)),
    start: action.transition.start,
    duration: action.transition.duration,
  });

  if (action.entityHandoff) {
    animateEntityHandoff({
      timeline,
      flight,
      source: sourceEntity,
      destination: destinationEntity,
      sourceBox: sourceEntityBox,
      destinationBox: destinationEntityBox,
      start: action.entityHandoff.start,
      duration: action.entityHandoff.duration,
    });
  }
}

createExclusiveSurfaceTransition({
  timeline,
  from: screens.get("price-table-screen"),
  to: screens.get("realtor-screen"),
  start: 17.1,
  duration: 0.7,
});
createExclusiveSurfaceTransition({
  timeline,
  from: screens.get("proposal-review-screen"),
  to: screens.get("agency-screen"),
  start: 35.2,
  duration: 0.6,
});

window.__tabelaQa = {
  contractVersion: storyData.contractVersion,
  compositionId,
  duration: storyData.duration,
  proofTimes: storyData.proofTimes,
  coordinateRoot: "product-stage",
  geometry,
  entityContinuity: {
    entityId: productData.building.id,
    unitReference: "304 · DEMO",
    source: "#building-card",
    destination: "#building-detail-card",
    measuredSourceBox: sourceEntityBox,
    measuredDestinationBox: destinationEntityBox,
    agencyRecordIsPreexistingDemo: true,
  },
  surfaceExclusivity: {
    selector: ".pm-surface",
    transitionComponent: "createExclusiveSurfaceTransition",
    swapMode: "exclusive-opaque-surface-swap",
  },
};

import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import {
  animateMeasuredAction,
  applyBrandTokens,
  createExclusiveSurfaceTransition,
  renderProductHeader,
  renderProductSurface,
} from "./assets/shared/product-components.js";
import { measureTarget, placeActionMarkers } from "./assets/shared/measured-action.js";
import { action, brandTokens, contentData } from "./story-data.js";

const escapeMarkup = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

function renderCollectionScreen() {
  return `
    <div class="workspace">
      <aside class="workspace-rail"><span class="rail-mark">${escapeMarkup(contentData.organization)}</span><span class="rail-section">COLETA</span><span class="rail-active">${escapeMarkup(contentData.collection)}</span></aside>
      <section class="workspace-main">
        <div class="surface-heading"><div><p class="eyebrow">${escapeMarkup(contentData.collection)}</p><h1>Coleta de dados ESG</h1></div><span class="period-tag">Período DEMO</span></div>
        <p class="surface-intro">Indicadores em acompanhamento.</p>
        <button class="indicator-row" id="indicator-row" type="button" aria-label="Abrir ${escapeMarkup(contentData.indicator)}">
          <span class="row-index">01</span><span class="row-copy"><strong>${escapeMarkup(contentData.indicator)}</strong><small>Formulário de coleta</small></span>
          <span class="status-chip"><i aria-hidden="true"></i>${escapeMarkup(contentData.status)}</span><span class="row-arrow" aria-hidden="true">→</span>
        </button>
      </section>
    </div>`;
}

function renderIndicatorScreen() {
  const fields = contentData.fields.map((field, index) => `
    <label class="answer-field"><span class="field-label">${escapeMarkup(field)}</span><span class="field-box"><span class="field-placeholder">${index === 0 ? "Resposta não preenchida" : "Sem conteúdo DEMO"}</span></span></label>`).join("");
  return `
    <div class="workspace workspace--detail">
      <aside class="workspace-rail"><span class="rail-mark">${escapeMarkup(contentData.organization)}</span><span class="rail-section">COLETA</span><span class="rail-active">${escapeMarkup(contentData.collection)}</span><span class="rail-crumb">${escapeMarkup(contentData.indicator)}</span></aside>
      <section class="workspace-main detail-main">
        <div class="detail-topline"><span class="back-label">Coleta DEMO <span aria-hidden="true">/</span> Indicador</span><span class="status-chip"><i aria-hidden="true"></i>${escapeMarkup(contentData.status)}</span></div>
        <div class="indicator-title"><div><p class="eyebrow">FORMULÁRIO DE COLETA</p><h1>${escapeMarkup(contentData.indicator)}</h1></div><span class="demo-stamp">DEMO</span></div>
        <p class="surface-intro">Coleta de dados ESG</p>
        <div class="answer-list">${fields}</div>
      </section>
    </div>`;
}

function renderBody() {
  const header = renderProductHeader({ label: `${contentData.organization} · ${contentData.collection}` });
  const collection = renderProductSurface({ id: "collection-screen", label: "Lista da coleta DEMO", children: renderCollectionScreen() });
  const indicator = renderProductSurface({ id: "indicator-screen", label: "Formulário do indicador DEMO", children: renderIndicatorScreen() });
  return `${header}${collection}${indicator}<div class="product-action-plane" id="action-plane" aria-hidden="true"><div class="product-click-origin" id="click-origin"><span class="product-focus-ring" id="focus-ring"></span></div><div class="product-cursor-origin" id="cursor-origin"><svg class="product-cursor-glyph" viewBox="0 0 38 48"><path d="M0 0v34l9-9 7 17 7-3-7-17h14L0 0z" /></svg></div></div><div class="demo-watermark">${escapeMarkup(contentData.demoLabel)}</div>`;
}

async function buildTimeline({ gsap, timeline, stage }) {
  applyBrandTokens(stage, brandTokens);
  const collection = stage.querySelector("#collection-screen");
  const indicator = stage.querySelector("#indicator-screen");
  const cursor = stage.querySelector("#cursor-origin");
  const focusContainer = stage.querySelector("#click-origin");
  const focusGlyph = stage.querySelector("#focus-ring");
  const targetMeasurement = measureTarget(stage, action.target);
  placeActionMarkers(cursor, focusContainer, targetMeasurement.center);

  timeline.set(collection, { autoAlpha: 1 }, 0);
  timeline.set(indicator, { autoAlpha: 0 }, 0);
  timeline.set([cursor, focusContainer], { autoAlpha: 0 }, 0);
  animateMeasuredAction({
    timeline,
    cursor,
    focusContainer,
    focusGlyph,
    target: targetMeasurement.target,
    startCenter: action.cursorStart,
    targetCenter: targetMeasurement.center,
    action,
  });
  createExclusiveSurfaceTransition({
    timeline,
    from: collection,
    to: indicator,
    ...action.transition,
  });
  timeline.fromTo(
    indicator.querySelector(".detail-main"),
    { y: 14, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.48, ease: "power2.out" },
    action.transition.start + 0.04,
  );
  const cursorExit = action.contact + action.press.holdDuration + action.press.releaseDuration;
  // Clear the pointer after release before the form replaces the collection view.
  timeline.set(cursor, { autoAlpha: 0 }, cursorExit);
}

const stage = document.querySelector("#product-stage");
export async function buildComposition() {
  return initializeComposition({
    stage,
    renderBody,
    buildTimeline,
  });
}

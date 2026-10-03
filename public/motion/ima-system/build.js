import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import { applyBrandTokens, animateMeasuredAction, createExclusiveSurfaceTransition, renderProductHeader, renderProductSurface, renderProductButton } from "./assets/shared/product-components.js";
import { placeActionMarkers, measureTarget } from "./assets/shared/measured-action.js";
import { registrationDemo } from "./assets/data/content-demo.js";

export async function buildComposition() {
const stage = document.querySelector("#product-stage");
const brandTokens = {
  fontFamily: "IMA Demo Sans",
  colors: {
    background: "#f2f4ed",
    ink: "#183d38",
    accent: "#127d68",
    secondary: "#c9e78d",
    surface: "#fffefa",
    muted: "#526b65",
    line: "#cbd7cd",
    supportSoft: "#e5eed9",
    windowPage: "#f2f4ed",
    windowPanel: "#fffefa",
  },
};

const { timeline } = await initializeComposition({
  stage,
  renderBody: () => renderProductSurface({
    id: "product-surface",
    label: "Cadastro Técnico DEMO",
    children: `
      <div id="product-content">
        ${renderProductHeader({ label: "WeGO · contexto IMA", status: "DEMO" })}
        <section class="page-surface intake-page" id="intake-page">
          <div class="page-inner">
            <p class="step-label">Cadastro técnico · solicitação</p>
            <h1 class="page-title" id="intro-heading">Organize o Cadastro Técnico</h1>
            <p class="page-description" id="demo-description">Selecione a categoria e salve o registro da empresa.</p>
            <div class="form-layout">
              <div class="form-pane">
                <span class="field-label">Titular</span>
                <div class="owner-value" id="owner-display">${registrationDemo.owner}</div>
                <span class="field-label" id="form-category" style="margin-top:26px">Categorias</span>
                <div class="category-option">
                  <span class="category-check" aria-hidden="true">✓</span>
                  <span>${registrationDemo.category}</span>
                </div>
              </div>
              <aside class="summary-pane">
                <div class="demo-mark">
                  <span class="demo-orbit">IMA</span>
                  <span class="record-reference">${registrationDemo.reference}</span>
                </div>
                <div>
                  <h2 class="summary-title">Um cadastro, pronto para consulta</h2>
                  <p class="summary-copy">Os dados escolhidos seguem com o mesmo registro até a confirmação.</p>
                </div>
                ${renderProductButton({ id: "save-registration", label: "Gerar Cadastro Técnico" })}
              </aside>
            </div>
          </div>
        </section>
        <section class="page-surface saved-page" id="saved-page" aria-label="Detalhe do cadastro salvo">
          <div class="page-inner saved-inner">
            <div class="saved-side">
              <span class="saved-check" aria-hidden="true">✓</span>
              <p class="saved-state" id="saved-label">${registrationDemo.savedState}</p>
              <p class="context-label">${registrationDemo.recordType}</p>
            </div>
            <article class="saved-record">
              <span class="record-reference">${registrationDemo.reference}</span>
              <h2 class="record-title" id="entity-label">${registrationDemo.owner}</h2>
              <div class="record-grid">
                <div class="record-field">
                  <span class="record-field-label">Tipo de registro</span>
                  <span class="record-field-value" id="record-kind">${registrationDemo.recordType}</span>
                </div>
                <div class="record-field">
                  <span class="record-field-label">Categoria</span>
                  <span class="record-field-value" id="category-value">${registrationDemo.category}</span>
                </div>
              </div>
              <p class="record-note" id="record-context">Cadastro Técnico · registro DEMO mantido para consulta.</p>
            </article>
          </div>
        </section>
        <p class="demo-footer">DEMO · reconstrução ilustrativa</p>
        <div class="product-action-plane" aria-hidden="true">
          <div class="product-cursor-origin" id="cursor-origin">
            <svg class="product-cursor-glyph" id="demo-cursor" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1v34l9-9 7 16 7-3-7-16h13L1 1Z" fill="#fffefa" stroke="#153e37" stroke-width="2.4" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="product-click-origin" id="click-origin">
            <span class="product-focus-ring" id="focus-ring"></span>
          </div>
        </div>
      </div>
    `,
  }),
  buildTimeline: ({ timeline: productTimeline, stage: productStage }) => {
    applyBrandTokens(productStage, brandTokens);
    const intakePage = productStage.querySelector("#intake-page");
    const savedPage = productStage.querySelector("#saved-page");
    const cursor = productStage.querySelector("#cursor-origin");
    const focusContainer = productStage.querySelector("#click-origin");
    const focusGlyph = productStage.querySelector("#focus-ring");
    const { target, center: targetCenter } = measureTarget(productStage, "#save-registration");
    const startCenter = { x: 1120, y: 914 };
    const action = {
      id: "save-technical-registration",
      approachStart: 1.45,
      contact: 2.35,
      press: {
        start: 2.30,
        holdDuration: 0.18,
        releaseDuration: 0.24,
        riseDuration: 0.10,
        feedbackDuration: 0.08,
      },
      pressure: {
        opacity: 0.9,
        ringScale: 0.8,
        releaseScale: 1.12,
        targetScale: 0.975,
      },
    };
    placeActionMarkers(cursor, focusContainer, startCenter);
    productTimeline.set(cursor, { left: startCenter.x, top: startCenter.y, autoAlpha: 0 }, 0);
    productTimeline.set(intakePage, { autoAlpha: 1 }, 0);
    productTimeline.set(savedPage, { autoAlpha: 0 }, 0);
    animateMeasuredAction({ timeline: productTimeline, cursor, focusContainer, focusGlyph, target, startCenter, targetCenter, action });
    const surfaceTransition = createExclusiveSurfaceTransition({ timeline: productTimeline, from: intakePage, to: savedPage, start: 2.70, duration: 0.45 });
    const releaseCompleteAt = action.contact + action.press.holdDuration + action.press.releaseDuration;
    productTimeline.to(cursor, { autoAlpha: 0, duration: 0.12, ease: "none" }, releaseCompleteAt);
    productTimeline.fromTo(".app-topline", { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, 0);
    productTimeline.fromTo(".page-title", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, 0.05);
    productTimeline.fromTo(".form-layout", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" }, 0.08);
    productTimeline.fromTo(".saved-side, .saved-record", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.20, ease: "power2.out", stagger: 0.02 }, surfaceTransition.midpoint);
  },
});
return { timeline };
}

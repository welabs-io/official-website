// MONTAGEM DA SUPERFÍCIE DE CAMPANHA
import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import {
  animateMeasuredAction,
  applyBrandTokens,
  renderProductHeader,
  renderProductSurface,
} from "./assets/shared/product-components.js";
import { measureTarget } from "./assets/shared/measured-action.js";
import { actions, brandTokens, contentData } from "./story-data.js";

// MARCAÇÃO DA RECONSTRUÇÃO DEMO
function renderCampaignForm() {
  return `
    <div class="workspace">
      <nav class="workspace-rail" aria-label="Navegação">
        <p class="rail-caption">Kiosk Brands</p>
        <p class="rail-section">GESTÃO</p>
        <span class="rail-link">Visão geral</span>
        <span class="rail-link">Redes</span>
        <span class="rail-link rail-link--active">Campanhas</span>
      </nav>
      <section class="workspace-main">
        <div class="breadcrumb"><span>Campanhas</span><span aria-hidden="true">/</span><strong>Nova campanha</strong></div>
        <div class="page-heading">
          <div>
            <p class="eyebrow">CAMPANHA DEMO</p>
            <h1>Nova campanha</h1>
            <p class="page-intro">Organize uma campanha vinculada à empresa.</p>
          </div>
        </div>
        <div class="form-layout" data-campaign-entity="${contentData.campaignEntityId}">
          <section class="campaign-form" id="campaign-editor" aria-label="Formulário da campanha DEMO">
            <div class="form-heading">
              <div><p class="eyebrow">CONFIGURAÇÃO</p><h2>Informações básicas</h2></div>
            </div>
            <div class="field-grid">
              <div class="field field--half field--company">
                <label for="company-field">Empresa</label>
                <button class="select-control" id="company-field" type="button" aria-label="Selecionar empresa DEMO">
                  <span class="choice-copy"><span class="choice-placeholder" id="company-placeholder">Selecione uma empresa...</span><span class="choice-value" id="company-value">${contentData.organization}</span></span>
                  <span class="chevron" aria-hidden="true">⌄</span>
                </button>
                <div class="option-menu" id="company-menu" aria-label="Empresas DEMO">
                  <button class="option-row" id="company-option" type="button"><span class="option-mark">A</span><span><strong>${contentData.organization}</strong><small>Empresa DEMO</small></span><span class="option-arrow" aria-hidden="true">›</span></button>
                </div>
              </div>
              <div class="field field--half field--benefit">
                <label>Vantagem</label>
                <div class="control-stack">
                  <button class="select-control select-control--disabled" id="benefit-field-disabled" type="button" disabled><span>Selecione uma empresa...</span><span class="chevron" aria-hidden="true">⌄</span></button>
                  <button class="select-control select-control--active" id="benefit-field" type="button" aria-label="Selecionar vantagem DEMO"><span class="choice-copy"><span class="choice-placeholder" id="benefit-placeholder">Selecione uma vantagem...</span><span class="choice-value" id="benefit-value">${contentData.benefit}</span></span><span class="chevron" aria-hidden="true">⌄</span></button>
                </div>
                <div class="option-menu" id="benefit-menu" aria-label="Vantagens DEMO">
                  <button class="option-row" id="benefit-option" type="button"><span class="option-mark option-mark--benefit">✦</span><span><strong>${contentData.benefit}</strong><small>Disponível para esta empresa DEMO</small></span><span class="option-arrow" aria-hidden="true">›</span></button>
                </div>
              </div>
              <div class="field field--wide">
                <label for="campaign-name">Nome da campanha</label>
                <div class="text-control" id="campaign-name" role="textbox" aria-label="Nome da campanha DEMO"><span class="entry-copy" id="campaign-name-value">${contentData.campaignName}</span><span class="caret" aria-hidden="true"></span></div>
              </div>
              <div class="field">
                <label>Data de início</label>
                <div class="date-control"><span>${contentData.startDate}</span><span class="date-mark" aria-hidden="true">▦</span></div>
              </div>
              <div class="field">
                <label>Data de fim</label>
                <div class="date-control"><span>${contentData.endDate}</span><span class="date-mark" aria-hidden="true">▦</span></div>
              </div>
            </div>
            <div class="form-actions"><span class="form-hint">Os dados exibidos são de demonstração.</span><button class="create-button" id="create-campaign" type="button"><span>Criar campanha</span><span aria-hidden="true">→</span></button></div>
          </section>
          <aside class="relationship-note" aria-label="Relação entre empresa e vantagem">
            <span class="note-kicker">ORGANIZAÇÃO DA CAMPANHA</span>
            <h3>Uma campanha, uma empresa.</h3>
            <p>As vantagens disponíveis acompanham a marca da empresa selecionada.</p>
            <div class="relation-flow"><span id="relation-company">Empresa DEMO</span><span class="relation-link" aria-hidden="true"></span><span id="relation-benefit">Vantagem filtrada</span></div>
          </aside>
        </div>
      </section>
    </div>`;
}

// CONSTRUÇÃO DO CONTEÚDO E DO PALCO DE AÇÃO
function renderBody() {
  const header = renderProductHeader({ label: contentData.productName, status: "DEMO · PRÉVIA" });
  const surface = renderProductSurface({
    id: "campaign-surface",
    label: "Formulário de campanha DEMO",
    children: renderCampaignForm(),
  });
  const cursorLayer = `<div class="product-action-plane" id="action-plane" aria-hidden="true"><div class="product-click-origin" id="click-origin"><span class="product-focus-ring" id="focus-ring"></span></div><div class="product-cursor-origin" id="cursor-origin"><svg class="product-cursor-glyph" viewBox="0 0 38 48"><path d="M0 0v34l9-9 7 17 7-3-7-17h14L0 0z" /></svg></div></div>`;
  return `${header}${surface}${cursorLayer}`;
}

// LINHA DO TEMPO MEDIDA NO PALCO
async function buildTimeline({ timeline, stage }) {
  applyBrandTokens(stage, brandTokens);
  const cursor = stage.querySelector("#cursor-origin");
  const focusContainer = stage.querySelector("#click-origin");
  const focusGlyph = stage.querySelector("#focus-ring");
  const companyMenu = stage.querySelector("#company-menu");
  const benefitMenu = stage.querySelector("#benefit-menu");
  const companyPlaceholder = stage.querySelector("#company-placeholder");
  const companyValue = stage.querySelector("#company-value");
  const benefitPlaceholder = stage.querySelector("#benefit-placeholder");
  const benefitValue = stage.querySelector("#benefit-value");
  const disabledBenefit = stage.querySelector("#benefit-field-disabled");
  const benefitField = stage.querySelector("#benefit-field");
  const nameValue = stage.querySelector("#campaign-name-value");
  const campaignName = stage.querySelector("#campaign-name");
  const relationCompany = stage.querySelector("#relation-company");
  const relationBenefit = stage.querySelector("#relation-benefit");
  const positions = new Map();

  timeline.set(companyMenu, { autoAlpha: 0 }, 0);
  timeline.set(benefitMenu, { autoAlpha: 0 }, 0);
  timeline.set(companyValue, { autoAlpha: 0 }, 0);
  timeline.set(benefitValue, { autoAlpha: 0 }, 0);
  timeline.set(benefitField, { autoAlpha: 0 }, 0);
  timeline.set(nameValue, { clipPath: "inset(0 100% 0 0)" }, 0);
  timeline.set(cursor, { left: 1480, top: 860, autoAlpha: 0 }, 0);
  timeline.set(focusContainer, { left: 1480, top: 860, autoAlpha: 0 }, 0);

  for (const action of actions) {
    const measured = measureTarget(stage, action.target);
    positions.set(action.id, measured.center);
    const previous = action.id === actions[0].id
      ? { x: 1480, y: 860 }
      : positions.get(actions[actions.indexOf(action) - 1].id);
    animateMeasuredAction({
      timeline,
      cursor,
      focusContainer,
      focusGlyph,
      target: measured.target,
      startCenter: previous,
      targetCenter: measured.center,
      action: {
        ...action,
        cursorStart: previous,
        press: {
          start: action.contact,
          holdDuration: 0.12,
          riseDuration: 0.1,
          releaseDuration: 0.18,
          feedbackDuration: 0.14,
        },
        pressure: {
          opacity: 0.76,
          ringScale: 0.68,
          releaseScale: 0.86,
          targetScale: 0.975,
        },
      },
    });
  }

  timeline.to(companyMenu, { autoAlpha: 1, duration: 0.16 }, 1.34);
  timeline.to(companyMenu, { autoAlpha: 0, duration: 0.16 }, 2.18);
  timeline.to(companyPlaceholder, { autoAlpha: 0, duration: 0.14 }, 2.12);
  timeline.to(companyValue, { autoAlpha: 1, duration: 0.18 }, 2.16);
  timeline.to(disabledBenefit, { autoAlpha: 0, duration: 0.16 }, 2.18);
  timeline.to(benefitField, { autoAlpha: 1, duration: 0.18 }, 2.2);
  timeline.to(benefitMenu, { autoAlpha: 1, duration: 0.16 }, 3.34);
  timeline.to(benefitMenu, { autoAlpha: 0, duration: 0.16 }, 4.28);
  timeline.to(benefitPlaceholder, { autoAlpha: 0, duration: 0.14 }, 4.22);
  timeline.to(benefitValue, { autoAlpha: 1, duration: 0.18 }, 4.26);
  timeline.to(relationCompany, { color: "#f2f3f7", duration: 0.2 }, 2.2);
  timeline.to(relationBenefit, { color: "#f2f3f7", duration: 0.2 }, 4.28);
  timeline.to(nameValue, { clipPath: "inset(0 0% 0 0)", duration: 1.18, ease: "none" }, 6.02);
  timeline.to(campaignName, { borderColor: "#696ff0", duration: 0.22 }, 5.75);
  timeline.to(campaignName, { borderColor: "#383b48", duration: 0.22 }, 7.36);
  timeline.set(cursor, { autoAlpha: 0 }, 2.55);
  timeline.set(cursor, { autoAlpha: 0 }, 4.55);
  timeline.set(cursor, { autoAlpha: 0 }, 6.25);
  timeline.set(focusContainer, { autoAlpha: 0 }, 6.25);
}

// INICIALIZAÇÃO DO PLAYER NATIVO
const stage = document.querySelector("#product-stage");
export async function buildComposition() {
  return initializeComposition({
    stage,
    renderBody,
    buildTimeline,
  });
}

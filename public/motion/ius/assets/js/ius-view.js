import { iusContent } from "./ius-content.js";

// MARCAÇÃO EDITORIAL DA SUPERFÍCIE
export function renderIusSurface() {
  const phases = iusContent.phases.map((phase, index) => `
    <div class="phase-copy" id="phase-${phase.id}" data-phase-index="${index}">
      <span class="phase-copy__label">${phase.label}</span>
      <p>${phase.description}</p>
    </div>`).join("");
  const recordStates = iusContent.phases.map((phase) => `
    <span class="record-state" id="record-state-${phase.id}">${phase.recordState}</span>`).join("");

  return `<section class="ius-surface product-screen pm-surface" id="ius-surface" aria-label="Fluxo conceitual IUS com registro DEMO">
    <header class="ius-topline">
      <span class="ius-wordmark">${iusContent.workingName}</span>
      <span class="ius-topline__context">COMPARTILHAMENTO DE EXAME</span>
      <span class="ius-demo-seal">${iusContent.demoSeal}</span>
    </header>
    <div class="ius-content" id="surface-content">
      <div class="narrative" id="narrative-block">
        <p class="narrative__eyebrow">JORNADA · PROFISSIONAL CONVIDADO</p>
        <h1 id="ius-title">${iusContent.title}</h1>
        <div class="phase-stage" id="phase-stage">${phases}</div>
      </div>
      <div class="record-zone">
        <div class="record-orbit record-orbit--outer" aria-hidden="true"></div>
        <div class="record-orbit record-orbit--inner" aria-hidden="true"></div>
        <article class="exam-record" id="exam-anchor" aria-label="${iusContent.entity.label}">
          <div class="exam-record__topline">
      <span class="record-index">EXAME COMPARTILHADO</span>
            <span class="record-mark" aria-hidden="true"></span>
          </div>
          <div class="record-glyph" aria-hidden="true">
            <svg viewBox="0 0 156 190" role="presentation">
              <path d="M34 8h58l34 34v124a16 16 0 0 1-16 16H34a16 16 0 0 1-16-16V24A16 16 0 0 1 34 8Z" />
              <path d="M92 9v34h34M45 82h70M45 103h54M45 124h64" />
              <circle cx="112" cy="149" r="7" />
            </svg>
          </div>
          <div class="record-identity">
            <h2 id="exam-label">${iusContent.entity.label}</h2>
            <p class="record-identity__metadata">${iusContent.entity.metadata}</p>
          </div>
          <div class="record-divider"></div>
          <div class="record-state-wrap" id="record-state-wrap">${recordStates}</div>
        </article>
      </div>
      <div class="journey-rail" aria-label="Etapas ilustrativas da jornada">
        <span class="journey-rail__step" id="rail-invitation">CONVITE</span>
        <span class="journey-rail__step" id="rail-limited-view">VISUALIZAÇÃO LIMITADA</span>
        <span class="journey-rail__step" id="rail-registration">CADASTRO CONCLUÍDO</span>
        <span class="journey-rail__step" id="rail-incorporated">INCORPORADO</span>
        <span class="journey-rail__track" aria-hidden="true"><span id="journey-progress"></span></span>
      </div>
    </div>
  </section>`;
}

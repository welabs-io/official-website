import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import {
  animateMeasuredAction,
  applyBrandTokens,
  createExclusiveSurfaceTransition,
  renderProductButton,
  renderProductHeader,
  renderProductSurface,
} from "./assets/shared/product-components.js";
import { measureTarget, placeActionMarkers } from "./assets/shared/measured-action.js";
import { action, brandTokens, contentData } from "./story-data.js";

// MONTAGEM DA JORNADA DEMONSTRATIVA
function renderBody() {
  const header = `<img class="signgo-mark" src="./assets/brand/signgo.svg" alt="SignGo">${renderProductHeader({ label: "Documentos" })}`;
  const document = `
    <aside class="document-anchor" id="document-anchor" aria-label="Documento DEMO selecionado">
      <p class="pane-kicker">DOCUMENTO SELECIONADO · DEMO</p>
      <div class="paper-wrap" id="paper-wrap">
        <div class="paper-sheet">
          <span class="paper-mark">PDF</span>
          <span class="paper-rule paper-rule--title"></span>
          <span class="paper-rule"></span>
          <span class="paper-rule paper-rule--short"></span>
          <span class="paper-gap"></span>
          <span class="paper-rule"></span>
          <span class="paper-rule paper-rule--mid"></span>
          <span class="paper-rule"></span>
          <span class="paper-rule paper-rule--short"></span>
          <span class="paper-stamp">DEMO</span>
        </div>
      </div>
      <div class="file-name-row"><span class="pdf-icon">PDF</span><span class="file-name" id="document-name"></span></div>
      <div class="document-actions"><span>Visualizar</span><span class="remove-copy">Remover</span></div>
    </aside>`;
  const uploadScreen = renderProductSurface({
    id: "upload-screen",
    label: "Etapa de envio do documento DEMO",
    children: `
      <div class="step-body" id="upload-body">
        <div class="step-kicker"><span class="step-number">01</span><span>ETAPA 1 DE 2</span></div>
        <h2 id="upload-title">Enviar Documento</h2>
        <p class="step-copy" id="upload-copy">Selecione o documento <strong>.PDF</strong> em seu computador com tamanho máximo de 10 MB.</p>
        <div class="selected-file" id="selected-file"><span class="file-check">✓</span><span><strong>Documento pronto para avançar</strong><small>Prévia ilustrativa · nenhum arquivo real</small></span></div>
        <div class="step-footer">${renderProductButton({ id: "next-button", label: "Próximo" })}</div>
      </div>`,
  });
  const signerScreen = renderProductSurface({
    id: "signers-screen",
    label: "Etapa de preparação dos assinadores DEMO",
    children: `
      <div class="step-body" id="signers-body">
        <div class="step-kicker"><span class="step-number">02</span><span>ETAPA 2 DE 2</span></div>
        <h2 id="signers-title">Assinadores</h2>
        <p class="step-copy" id="signers-copy">Informe quem assinará e, se necessário, defina um prazo.</p>
        <div class="signer-row" id="signer-row"><span class="field-icon" aria-hidden="true">@</span><span class="field-copy"><small>E-mail do assinador</small><strong id="signer-email"></strong></span><span class="demo-dot" aria-hidden="true"></span></div>
        <div class="deadline-row" id="deadline-row"><span class="calendar-icon" aria-hidden="true">▦</span><span>Prazo para assinaturas</span><span class="optional-tag">Opcional</span></div>
        <div class="step-footer step-footer--signers"><button class="confirm-button" id="confirm-button" type="button">Confirmar <span aria-hidden="true">→</span></button></div>
      </div>`,
  });
  const cursor = `<div class="product-action-plane" id="action-plane" aria-hidden="true"><div class="product-click-origin" id="click-origin"><span class="product-focus-ring" id="focus-ring"></span></div><div class="product-cursor-origin" id="cursor-origin"><svg class="product-cursor-glyph" viewBox="0 0 38 48"><path d="M0 0v34l9-9 7 17 7-3-7-17h14L0 0z" /></svg></div></div>`;

  return `<div class="ambient-ring" id="ambient-ring" aria-hidden="true"></div>
    <h1 class="hero-title" id="hero-title"><span>O documento</span><span>segue com os assinadores.</span></h1>
    <p class="hero-subtitle" id="hero-subtitle">Da etapa de envio ao preparo, com a mesma minuta à vista.</p>
    <section class="app-window" id="app-window" aria-label="Reconstrução DEMO do SignGo">
      ${header}
      <div class="app-body">${document}${uploadScreen}${signerScreen}</div>
    </section>
    <p class="demo-watermark" id="demo-watermark">${contentData.demoLabel}</p>
    ${cursor}`;
}

async function buildTimeline({ timeline, stage }) {
  applyBrandTokens(stage, brandTokens);
  const uploadScreen = stage.querySelector("#upload-screen");
  const signersScreen = stage.querySelector("#signers-screen");
  const cursor = stage.querySelector("#cursor-origin");
  const focusContainer = stage.querySelector("#click-origin");
  const focusGlyph = stage.querySelector("#focus-ring");
  const target = measureTarget(stage, action.target);
  placeActionMarkers(cursor, focusContainer, target.center);
  stage.querySelector("#document-name").textContent = contentData.documentName;
  stage.querySelector("#signer-email").textContent = contentData.signerEmail;

  timeline.set(uploadScreen, { autoAlpha: 1 }, 0);
  timeline.set(signersScreen, { autoAlpha: 0 }, 0);
  timeline.set([cursor, focusContainer], { autoAlpha: 0 }, 0);
  timeline.fromTo("#app-window", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.58, ease: "power3.out" }, 0);
  timeline.fromTo("#hero-title", { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.54, ease: "power3.out" }, 0.16);
  timeline.fromTo("#hero-subtitle", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.44);
  timeline.fromTo("#document-anchor", { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.52, ease: "power2.out" }, 0.3);
  timeline.fromTo("#upload-body", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48, ease: "power3.out" }, 0.38);
  timeline.fromTo("#paper-wrap", { rotation: -2, scale: 0.98 }, { rotation: 0, scale: 1, duration: 0.72, ease: "power2.out" }, 0.52);
  timeline.fromTo("#ambient-ring", { scale: 0.93, opacity: 0.12 }, { scale: 1.06, opacity: 0.19, duration: 5.2, repeat: 1, yoyo: true, ease: "sine.inOut" }, 0);

  timeline.set(cursor, { left: action.cursorStart.x, top: action.cursorStart.y }, 0);
  animateMeasuredAction({
    timeline,
    cursor,
    focusContainer,
    focusGlyph,
    target: target.target,
    startCenter: action.cursorStart,
    targetCenter: target.center,
    action,
  });
  timeline.set(cursor, { autoAlpha: 0 }, action.contact + action.press.holdDuration + action.press.releaseDuration);
  timeline.set(focusContainer, { autoAlpha: 0 }, action.contact + action.press.holdDuration + action.press.releaseDuration);

  const transition = createExclusiveSurfaceTransition({ timeline, from: uploadScreen, to: signersScreen, ...action.transition });
  timeline.to(stage.querySelector("#upload-body"), { y: -10, opacity: 0, duration: 0.24, ease: "power2.in" }, action.transition.start - 0.28);
  timeline.fromTo("#signers-body", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.46, ease: "power3.out" }, transition.midpoint + 0.02);
  timeline.fromTo("#signer-row", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.36, ease: "power2.out" }, transition.midpoint + 0.34);
  timeline.fromTo("#deadline-row", { x: 12, opacity: 0 }, { x: 0, opacity: 1, duration: 0.34, ease: "power2.out" }, transition.midpoint + 0.7);
  timeline.fromTo("#confirm-button", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "power2.out" }, transition.midpoint + 1.02);
}

const stage = document.querySelector("#product-stage");
export async function buildComposition() {
  return initializeComposition({ stage, renderBody, buildTimeline });
}

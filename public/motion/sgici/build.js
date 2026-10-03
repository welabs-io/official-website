import {
  animateMeasuredAction,
  applyBrandTokens,
  renderProductButton,
  renderProductHeader,
  renderProductSurface,
} from "./assets/shared/product-components.js";
import {
  measureTarget,
  placeActionMarkers,
  waitForStableAssets,
} from "./assets/shared/measured-action.js";
import { action, brandTokens, contentData } from "./story-data.js";

const escapeMarkup = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

function renderProcessScreen() {
  const header = renderProductHeader({ label: "SGICI · processos de importação", status: contentData.demoLabel });
  const screen = renderProductSurface({
    id: "process-screen",
    label: "Detalhe do processo de importação DEMO",
    children: `
      <div class="application-shell">
        <aside class="workspace-rail" aria-label="Navegação reconstruída">
          <span class="rail-mark">SGICI</span>
          <span class="rail-section">OPERAÇÃO</span>
          <span class="rail-active">Processos de importação</span>
          <span class="rail-note">Registro DEMO</span>
        </aside>
        <section class="workspace-main">
          <div class="page-heading">
            <div>
              <p class="eyebrow">PROCESSO DE IMPORTAÇÃO</p>
              <h1>Etapa do processo</h1>
            </div>
            <span class="page-context">Acompanhamento DEMO</span>
          </div>
          <article class="process-record" aria-label="Processo sintético">
            <div class="record-topline">
              <span class="record-kicker">PROCESSO</span>
              <span class="record-id" id="record-number">${escapeMarkup(contentData.processNumber)}</span>
            </div>
            <div class="record-divider"></div>
            <div class="status-grid">
              <div class="status-copy">
                <span class="field-label">STATUS ATUAL</span>
                <div class="status-stack" aria-live="off">
                  <span class="status-value" id="status-approved">${escapeMarkup(contentData.initialStatus)}</span>
                  <span class="status-value status-value--next" id="status-transit">${escapeMarkup(contentData.nextStatus)}</span>
                </div>
              </div>
              <div class="stage-change" aria-hidden="true">
                <span class="stage-node stage-node--current" id="stage-approved"><i></i>Aprovado</span>
                <span class="stage-connector" id="stage-connector"></span>
                <span class="stage-node stage-node--pending" id="stage-transit"><i></i>Em trânsito</span>
              </div>
            </div>
            <div class="action-row">
              <p class="action-hint" id="action-hint">Acompanhe o embarque deste processo.</p>
              ${renderProductButton({ id: "transit-button", label: contentData.actionLabel })}
              <p class="response-hint" id="response-hint">Embarque registrado</p>
            </div>
          </article>
          <div class="context-line">
            <span class="context-mark" aria-hidden="true"></span>
            <span>Do planejamento ao embarque</span>
          </div>
        </section>
      </div>`,
  });
  return `${header}${screen}<div class="product-action-plane" id="action-plane" aria-hidden="true"><div class="product-click-origin" id="click-origin"><span class="product-focus-ring" id="focus-ring"></span></div><div class="product-cursor-origin" id="cursor-origin"><svg class="product-cursor-glyph" viewBox="0 0 38 48"><path d="M0 0v34l9-9 7 17 7-3-7-17h14L0 0z" fill="var(--brand-ink)" stroke="white" stroke-width="1.5" /></svg></div></div>`;
}

async function waitForLayout() {
  await waitForStableAssets(document.querySelector("#product-stage"));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

async function buildTimeline({ gsap, timeline, stage }) {
  applyBrandTokens(stage, brandTokens);

  const button = stage.querySelector(action.target);
  const cursor = stage.querySelector("#cursor-origin");
  const focusContainer = stage.querySelector("#click-origin");
  const focusGlyph = stage.querySelector("#focus-ring");
  const approved = stage.querySelector("#status-approved");
  const transit = stage.querySelector("#status-transit");
  const approvedNode = stage.querySelector("#stage-approved");
  const transitNode = stage.querySelector("#stage-transit");
  const connector = stage.querySelector("#stage-connector");
  const responseHint = stage.querySelector("#response-hint");
  const targetMeasurement = measureTarget(stage, action.target);

  placeActionMarkers(cursor, focusContainer, targetMeasurement.center);
  timeline.set(cursor, { left: action.cursorStart.x, top: action.cursorStart.y, autoAlpha: 0 }, 0);
  timeline.set(focusContainer, { autoAlpha: 0 }, 0);
  timeline.set(approved, { autoAlpha: 1 }, 0);
  timeline.set(transit, { autoAlpha: 0 }, 0);
  timeline.set(responseHint, { autoAlpha: 0, y: 8 }, 0);
  timeline.set(stage.querySelector("#process-screen"), { autoAlpha: 1 }, 0);
  timeline.fromTo(".process-record", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 0.56);
  timeline.fromTo(".page-heading", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.28);
  timeline.fromTo(button, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, ease: "power2.out" }, 1.72);
  timeline.fromTo(".context-line", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "none" }, 2.32);

  animateMeasuredAction({
    timeline,
    cursor,
    focusContainer,
    focusGlyph,
    target: button,
    startCenter: action.cursorStart,
    targetCenter: targetMeasurement.center,
    action,
  });

  timeline.set(approved, { autoAlpha: 0 }, action.statusSwapTime);
  timeline.set(transit, { autoAlpha: 1 }, action.statusSwapTime);
  timeline.to(approvedNode, { color: "#536b68", duration: 0.2, ease: "none" }, action.response);
  timeline.to(approvedNode.querySelector("i"), { backgroundColor: "#a7b7b3", duration: 0.2, ease: "none" }, action.response);
  timeline.to(transitNode, { color: "#183238", duration: 0.2, ease: "none" }, action.response);
  timeline.to(transitNode.querySelector("i"), { backgroundColor: "#21836e", scale: 1.15, duration: 0.2, ease: "power1.out" }, action.response);
  timeline.to(connector, { scaleX: 1, duration: 0.3, ease: "power2.out" }, action.response);
  timeline.to(button, { autoAlpha: 0, y: -5, duration: 0.18, ease: "power1.in" }, action.response);
  timeline.to(responseHint, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out" }, action.response + 0.26);
  const cursorExit = action.contact + action.press.holdDuration + action.press.releaseDuration;
  timeline.set(cursor, { autoAlpha: 0 }, cursorExit + 0.08);
}

export async function buildComposition() {
  const stage = document.querySelector("#product-stage");
  if (!stage) throw new Error("Missing product-stage composition root.");
  stage.innerHTML = renderProcessScreen();
  await waitForLayout();
  const timeline = window.gsap.timeline({ paused: true });
  await buildTimeline({ gsap: window.gsap, timeline, stage });
  return { timeline };
}

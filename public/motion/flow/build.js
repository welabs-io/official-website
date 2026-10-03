// COMPOSIÇÃO CONCEITUAL DO CICLO DE DEFINIÇÃO
import { initializeComposition } from "./assets/shared/composition-shell/init.js";

const compositionId = "flow-demo-definition-lifecycle";

function renderFlowSurface() {
  return `
    <section id="product-surface" class="product-screen pm-surface" aria-label="Flow: versões de uma definição">
      <div id="product-content" class="flow-surface">
        <header class="flow-topline">
          <div class="flow-brand">
            <span class="flow-brand-mark" aria-hidden="true">F</span>
            <span>Flow <span aria-hidden="true">·</span> Welabs</span>
          </div>
          <span class="demo-chip">DEMO · reconstrução ilustrativa</span>
        </header>

        <main class="flow-content">
          <section class="story-copy" aria-label="Resumo da jornada">
            <p class="eyebrow">Versões da definição</p>
            <h1 id="story-title" class="story-title">Uma definição. Versões sob controle.</h1>
            <p id="message-initial" class="story-state">Cada revisão tem identidade própria e um estado claro.</p>
            <p id="message-draft" class="story-state">Uma nova composição começa como rascunho.</p>
            <p id="message-publish" class="story-state">Ao publicar, a nova revisão assume o ativo.</p>
            <p id="message-history" class="story-state">A revisão anterior permanece registrada.</p>
          </section>

          <section class="definition-map" aria-label="Duas versões da mesma definição DEMO">
            <div class="definition-heading">
              <div class="definition-label">
                <span>Mesmo objeto ao longo do ciclo</span>
                <strong id="entity-label">DEMO-WORKFLOW-07</strong>
              </div>
              <span id="version-count" class="version-count">2 revisões</span>
            </div>

            <div class="version-stack">
              <span class="version-track" aria-hidden="true"></span>
              <div id="active-pointer" class="active-pointer" aria-label="Ponteiro da versão ativa">
                <span class="pointer-dot" aria-hidden="true"></span>
                <span id="active-pointer-label">ATIVA</span>
              </div>

              <article id="revision-v1" class="version-card">
                <span class="version-number">V01</span>
                <span class="version-details">
                  <strong>Revisão anterior</strong>
                  <code id="hash-v1">spec_hash · 7af3…c52d</code>
                </span>
                <span class="status-slot">
                  <span id="v1-active" class="version-status status-active">ACTIVE</span>
                  <span id="v1-deprecated" class="version-status status-deprecated">DEPRECATED</span>
                </span>
              </article>

              <article id="revision-v2" class="version-card version-card--new">
                <span class="version-number">V02</span>
                <span class="version-details">
                  <strong>Nova revisão</strong>
                  <code id="hash-v2">spec_hash · bf91…1e08</code>
                </span>
                <span class="status-slot">
                  <span id="v2-draft" class="version-status status-draft">DRAFT</span>
                  <span id="v2-active" class="version-status status-active">ACTIVE</span>
                </span>
              </article>
            </div>

            <div id="state-explainer" class="state-explainer">
              <span class="state-explainer-mark" aria-hidden="true"></span>
              <span>Publicar move a versão ativa e preserva o histórico.</span>
            </div>
          </section>
        </main>

        <footer class="flow-footer">
          <span>Definição versionada · estados DEMO</span>
          <span id="active-reference" class="footer-reference">
            <span id="active-reference-v1">active_spec_hash → V01</span>
            <span id="active-reference-v2">active_spec_hash → V02</span>
          </span>
        </footer>
      </div>
    </section>`;
}

function buildTimeline({ gsap, timeline, stage }) {
  timeline.fromTo(".flow-brand", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28, ease: "power2.out" }, 0.05);
  timeline.fromTo(".demo-chip", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28, ease: "power2.out" }, 0.12);
  timeline.fromTo(".story-copy", { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.42, ease: "power2.out" }, 0.14);
  timeline.fromTo(".definition-heading", { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.38, ease: "power2.out" }, 0.22);
  timeline.fromTo("#revision-v1", { x: 24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.42, ease: "power2.out" }, 0.38);
  timeline.fromTo("#active-pointer", { x: -12, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.32, ease: "power2.out" }, 0.72);
  timeline.fromTo("#message-initial", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.32, ease: "power2.out" }, 0.65);
  timeline.set("#message-initial", { autoAlpha: 0 }, 4.05);
  timeline.fromTo("#revision-v2", { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 4.08);
  timeline.fromTo("#message-draft", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.32, ease: "power2.out" }, 4.08);
  timeline.set("#message-draft", { autoAlpha: 0 }, 7.15);
  timeline.fromTo("#message-publish", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.32, ease: "power2.out" }, 7.15);
  timeline.to("#active-pointer", { y: 202, duration: 0.72, ease: "power2.inOut" }, 7.4);
  timeline.set("#v1-active", { autoAlpha: 0 }, 7.76);
  timeline.set("#v1-deprecated", { autoAlpha: 1 }, 7.76);
  timeline.set("#v2-draft", { autoAlpha: 0 }, 7.76);
  timeline.set("#v2-active", { autoAlpha: 1 }, 7.76);
  timeline.set("#active-reference-v1", { autoAlpha: 0 }, 7.76);
  timeline.set("#active-reference-v2", { autoAlpha: 1 }, 7.76);
  timeline.set("#message-publish", { autoAlpha: 0 }, 10.15);
  timeline.fromTo("#message-history", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.34, ease: "power2.out" }, 10.15);
  timeline.fromTo("#state-explainer", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.38, ease: "power2.out" }, 10.45);
  timeline.fromTo(".flow-footer", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "none" }, 0.7);

  const requiredElements = ["#product-surface", "#product-content", "#entity-label", "#revision-v1", "#revision-v2", "#active-pointer"];
  for (const selector of requiredElements) {
    if (!stage.querySelector(selector)) throw new Error(`Missing conceptual scene element: ${selector}`);
  }
}

export async function buildComposition() {
  const stage = document.querySelector("#product-stage");
  return initializeComposition({ stage, renderBody: renderFlowSurface, buildTimeline });
}

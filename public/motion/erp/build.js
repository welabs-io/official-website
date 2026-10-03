import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import {
  animateEntityHandoff,
  animateMeasuredAction,
  applyBrandTokens,
  createExclusiveSurfaceTransition,
} from "./assets/shared/product-components.js";
import { measureTarget, placeActionMarkers } from "./assets/shared/measured-action.js";

// MONTAGEM DA JORNADA DE PROJETOS
const compositionId = "weer-project-context-demo";
const brandTokens = {
  fontFamily: "system-ui",
  colors: {
    background: "#f4f5f7",
    ink: "#141415",
    accent: "#4d57b7",
    secondary: "#eceef8",
    surface: "#ffffff",
    muted: "#5e6471",
    line: "#d8dbe3",
    supportSoft: "#eef0fa",
    windowPage: "#f4f5f7",
    windowPanel: "#ffffff",
  },
};

const measuredAction = {
  id: "open-project",
  approachStart: 3,
  contact: 4.12,
  press: {
    start: 4.04,
    holdDuration: 0.18,
    releaseDuration: 0.22,
    riseDuration: 0.1,
    feedbackDuration: 0.1,
  },
  pressure: {
    opacity: 0.88,
    ringScale: 0.82,
    releaseScale: 1.12,
    targetScale: 0.975,
  },
};

function renderBrowserPage() {
  return `
    <div class="fvp-browser erp-browser" id="weerp-browser">
      <div class="fvp-browser__chrome">
        <div class="fvp-browser__tab-row">
          <div class="fvp-browser__lights" aria-hidden="true"><i></i><i></i><i></i></div>
          <div class="fvp-browser__tab" aria-selected="true">
            <b class="fvp-browser__tab-dot" aria-hidden="true"></b>
            <span class="fvp-browser__tab-label">WeERP · Projects</span>
          </div>
        </div>
        <div class="fvp-browser__toolbar">
          <div class="fvp-browser__nav" aria-hidden="true">‹ &nbsp; › &nbsp; ↻</div>
          <div class="fvp-browser__address"><span>WeERP · espaço de trabalho DEMO</span></div>
          <div class="fvp-browser__avatar" aria-label="Demonstração sintética">D</div>
        </div>
      </div>
      <div class="fvp-browser__viewport">
        <aside class="fvp-browser__sidebar" aria-label="Navegação">
          <div class="fvp-browser__side-head"><span class="fvp-browser__side-label">WeERP</span></div>
          <div class="fvp-browser__side-items">
            <div class="fvp-browser__side-item"><b class="fvp-browser__side-icon" aria-hidden="true"></b><span>Visão geral</span></div>
            <div class="fvp-browser__side-item fvp-browser__side-item--active erp-side-item--active"><b class="fvp-browser__side-icon" aria-hidden="true"></b><span>Projects</span></div>
            <div class="fvp-browser__side-item"><b class="fvp-browser__side-icon" aria-hidden="true"></b><span>Issues</span></div>
          </div>
        </aside>
        <div class="fvp-browser__wireframe" hidden></div>
        <main class="fvp-browser__content erp-browser__content" aria-label="WeERP reconstruído">
          <div class="erp-product-content">
            <section class="erp-page" id="project-list-surface" aria-label="Lista de projetos">
              <div class="erp-page__crumbs"><span>Projects</span></div>
              <div class="erp-page__heading">
                <h1 id="list-primary-title">Projects</h1>
                <span class="erp-demo-tag">DEMO · reconstrução ilustrativa</span>
              </div>
              <div class="erp-table" id="project-list-content">
                <div class="erp-table__header" aria-hidden="true">
                  <span>Nome</span><span>Sigla</span><span>Status</span><span>Lead (User)</span><span></span>
                </div>
                <a class="erp-project-row" id="project-open" href="#project-demo" aria-label="Abrir projeto Implantação DEMO">
                  <span class="erp-project-row__name" id="project-list-anchor" data-entity-id="project-demo-001">Implantação DEMO</span>
                  <span class="erp-project-row__value" id="project-list-abbr">DEMO</span>
                  <span class="erp-project-row__value erp-project-row__status" id="project-list-status">Active</span>
                  <span class="erp-project-row__value" id="project-list-lead">demo.lead@example.invalid</span>
                  <span class="erp-project-row__open" aria-hidden="true">›</span>
                </a>
              </div>
            </section>
            <section class="erp-page erp-page--hidden" id="project-detail-surface" aria-label="Detalhe do projeto">
              <div class="erp-page__crumbs"><span>Projects</span><span aria-hidden="true">›</span><span>Implantação DEMO</span></div>
              <div class="erp-page__heading">
                <h1 id="project-detail-anchor" data-entity-id="project-demo-001">Implantação DEMO</h1>
                <span class="erp-demo-tag">DEMO · reconstrução ilustrativa</span>
              </div>
              <div class="erp-detail-layout" id="project-detail-content">
                <div class="erp-detail-main">
                  <p class="erp-project-description" id="project-description-primary">Organização documental do trabalho de implantação.</p>
                  <h2 class="erp-detail-section-title" id="issues-primary-title">Issues do projeto</h2>
                  <div class="erp-issue-tree" aria-label="Árvore de Issues sintética">
                    <div class="erp-issue-header" aria-hidden="true"><span>Item</span><span>Status</span><span>Esforço</span></div>
                    <div class="erp-issue-row">
                      <span class="erp-issue-row__subject" id="issue-group-primary"><span class="erp-issue-toggle" aria-hidden="true">⌄</span>Preparar organização documental</span>
                      <span class="erp-issue-row__status" id="issue-group-status">Backlog</span>
                      <span class="erp-issue-row__effort" id="issue-group-effort">—</span>
                    </div>
                    <div class="erp-issue-row erp-issue-row--child">
                      <span class="erp-issue-row__subject" id="issue-child-one-primary">Catalogar documentos do projeto</span>
                      <span class="erp-issue-row__status" id="issue-child-one-status">Backlog</span>
                      <span class="erp-issue-row__effort" id="issue-child-one-effort">—</span>
                    </div>
                    <div class="erp-issue-row erp-issue-row--child">
                      <span class="erp-issue-row__subject" id="issue-child-two-primary">Definir sequência de revisão</span>
                      <span class="erp-issue-row__status" id="issue-child-two-status">Backlog</span>
                      <span class="erp-issue-row__effort" id="issue-child-two-effort">—</span>
                    </div>
                  </div>
                </div>
                <aside class="erp-detail-aside">
                  <span class="erp-detail-aside__label">Sigla</span>
                  <span class="erp-detail-aside__value" id="project-detail-abbr">DEMO</span>
                </aside>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
    <div class="product-action-plane" aria-hidden="true">
      <div class="product-click-origin" id="click-origin"><span class="product-focus-ring" id="focus-ring"></span></div>
      <div class="product-cursor-origin" id="cursor-origin">
        <svg class="product-cursor-glyph" viewBox="0 0 38 48" aria-hidden="true"><path d="M0 0v34l9-9 7 17 7-3-7-17h14L0 0z" fill="#fff" stroke="#141415" stroke-width="2.4" stroke-linejoin="round"/></svg>
      </div>
      <span class="product-entity-flight erp-entity-flight" id="entity-flight" aria-hidden="true">Implantação DEMO</span>
    </div>`;
}

export async function buildComposition() {
  return initializeComposition({
    stage: document.querySelector("#product-stage"),
    renderBody: renderBrowserPage,
    buildTimeline: async ({ gsap, timeline, stage }) => {
      applyBrandTokens(stage, brandTokens);

      const target = measureTarget(stage, "#project-open");
      const source = measureTarget(stage, "#project-list-anchor");
      const destination = measureTarget(stage, "#project-detail-anchor");
      const cursor = stage.querySelector("#cursor-origin");
      const focusContainer = stage.querySelector("#click-origin");
      const focusGlyph = stage.querySelector("#focus-ring");
      const projectRow = stage.querySelector("#project-open");
      const listSurface = stage.querySelector("#project-list-surface");
      const detailSurface = stage.querySelector("#project-detail-surface");
      const detailContent = stage.querySelector("#project-detail-content");
      const entityFlight = stage.querySelector("#entity-flight");
      const targetCenter = target.center;
      const cursorOrigin = {
        x: Math.min(1660, targetCenter.x + 240),
        y: Math.min(910, targetCenter.y + 185),
      };

      placeActionMarkers(cursor, focusContainer, targetCenter);
      gsap.set(cursor, { left: cursorOrigin.x, top: cursorOrigin.y, autoAlpha: 0 });
      gsap.set(focusContainer, { autoAlpha: 0 });
      gsap.set(focusGlyph, { opacity: 0, scale: 0.82 });
      gsap.set(projectRow, { transformOrigin: "50% 50%" });
      gsap.set(listSurface, { autoAlpha: 1 });
      gsap.set(detailSurface, { autoAlpha: 0 });
      // Keep the destination anchor hidden until the measured handoff reveals it.
      gsap.set(destination.target, { autoAlpha: 0 });
      gsap.set(detailContent, { autoAlpha: 0 });
      gsap.set(entityFlight, { autoAlpha: 0 });

      animateMeasuredAction({
        timeline,
        cursor,
        focusContainer,
        focusGlyph,
        target: projectRow,
        startCenter: cursorOrigin,
        targetCenter,
        action: measuredAction,
      });

      timeline.to(cursor, { autoAlpha: 0, duration: 0.16, ease: "none" }, 4.58);

      createExclusiveSurfaceTransition({
        timeline,
        from: listSurface,
        to: detailSurface,
        start: 4.95,
        duration: 0.12,
      });

      animateEntityHandoff({
        timeline,
        flight: entityFlight,
        source: source.target,
        destination: destination.target,
        sourceBox: source.targetBox,
        destinationBox: destination.targetBox,
        start: 4.95,
        duration: 0.78,
      });

      timeline.set(detailContent, { autoAlpha: 1 }, 5.73);
    },
  });
}

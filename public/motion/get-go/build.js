import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import { applyBrandTokens, renderProductHeader } from "./assets/shared/product-components.js";

const compositionId = "get-go-form-source-demo";
const duration = 16;
const brandTokens = {
  colors: {
    background: "#f2efe7",
    ink: "#163b39",
    accent: "#dc633d",
    secondary: "#8da99d",
    surface: "#fffdf7",
    muted: "#5d6b67",
    line: "#d6d9ce",
    supportSoft: "#e4ebe3",
    windowPage: "#f2efe7",
    windowPanel: "#fffdf7",
  },
  fontFamily: "system-ui",
};

// CONTEÚDO SINTÉTICO DA JORNADA
const contentData = {
  itemId: "DEMO 01",
  itemTitle: "Unidade",
  sourceTitle: "Unidades · DEMO",
  recordLabel: "Polo Centro",
  recordValue: "Unidade Centro",
  itemStatus: "Pendente",
  introduction: "Um item pode consultar a fonte de dados associada.",
  conclusion: "A fonte vinculada expõe registros para consulta.",
};

// ÂNCORAS EDITORIAIS DO OBJETO
const entityAnchors = {
  itemSelector: "#form-item",
  sourceSelector: "#source-node",
  sourceRecordSelector: "#record-source",
  readingSelector: "#reading-anchor",
};

// MONTAGEM E LINHA DO TEMPO DA COMPOSIÇÃO
export async function buildComposition() {
  const stage = document.querySelector("#product-stage");
  if (!stage) throw new Error("Missing product-stage composition root.");
  applyBrandTokens(stage, brandTokens);
  const completed = await initializeComposition({
    stage,
    renderBody: () => `
      <main id="product-surface" class="storyboard" aria-label="Relação conceitual entre item, fonte e registro">
        <header class="topline">${renderProductHeader({ label: "Get-Go", status: "DEMO · RECONSTRUÇÃO" })}</header>
        <section id="hero-context" class="hero">
          <p class="eyebrow">FORMULÁRIOS · MODELO CONCEITUAL</p>
          <h1 id="hero-title" class="hero-title">Organize um formulário</h1>
          <p id="hero-copy" class="hero-copy">${contentData.introduction}</p>
        </section>
        <section id="diagram" class="diagram" aria-label="Item relacionado a uma fonte de dados">
          <article id="form-item" class="form-node">
            <div class="node-heading">
              <span class="column-label">FORMULÁRIO · DEMO</span>
              <span class="field-index">${contentData.itemId}</span>
            </div>
            <h2 class="node-title">ITEM DO FORMULÁRIO</h2>
            <div class="form-field">
              <div class="field-copy">
                <p id="entity-title" class="field-title">${contentData.itemTitle}</p>
                <p id="entity-meta" class="field-meta">Fonte de dados vinculada</p>
              </div>
              <span class="field-index">01</span>
            </div>
            <p id="link-copy" class="link-note">Uma referência entre item e fonte</p>
          </article>
          <div class="relation-lane" aria-hidden="true">
            <svg class="relation-svg" viewBox="0 0 220 300" preserveAspectRatio="none">
              <path id="relation-path" class="relation-path" d="M2 150 C64 150 130 150 218 150"></path>
            </svg>
            <span id="relation-dot" class="relation-dot"></span>
          </div>
          <article id="source-node" class="source-node">
            <div class="node-heading">
              <span class="column-label">FONTE DE DADOS · DEMO</span>
              <span class="field-index">3 registros</span>
            </div>
            <h2 id="source-title" class="node-title">${contentData.sourceTitle}</h2>
            <div id="source-table" class="source-table" role="table" aria-label="Registros sintéticos da fonte">
              <div class="source-table__head" role="row"><span role="columnheader">Rótulo</span><span role="columnheader">Valor</span></div>
              <div id="record-north" class="source-row" role="row"><span id="record-north-label" class="record-label">Polo Norte</span><span id="record-north-value" class="record-value">Unidade Norte</span></div>
              <div id="record-source" class="source-row source-row--focus" role="row"><span id="record-label" class="record-label record-entity-label">${contentData.recordLabel}</span><span id="record-value" class="record-value">${contentData.recordValue}</span></div>
              <div id="record-south" class="source-row" role="row"><span id="record-south-label" class="record-label">Polo Sul</span><span id="record-south-value" class="record-value">Unidade Sul</span></div>
            </div>
          </article>
        </section>
        <div id="reading-anchor" class="reading-anchor" role="row" aria-label="Registro DEMO em foco editorial">
          <span id="reading-label" class="record-label record-entity-label">${contentData.recordLabel}</span>
          <span id="reading-value" class="record-value">${contentData.recordValue}</span>
        </div>
        <span id="entity-flight" class="entity-flight record-label record-entity-label" aria-label="Rótulo DEMO em foco editorial">${contentData.recordLabel}</span>
        <section id="status-line" class="state-line" aria-label="Estado permitido do item">
          <span id="status-title" class="state-line__label">Estado do item · referência do modelo</span>
          <span id="status-value" class="state-value">${contentData.itemStatus}</span>
        </section>
        <section id="closing" class="closing">
          <p class="eyebrow">CONSULTA DE REGISTROS · DEMO</p>
          <h2 id="closing-title" class="closing-title">Encontre o registro</h2>
          <p id="closing-copy" class="closing-copy">${contentData.conclusion}</p>
        </section>
        <p id="footer-note" class="footer-note">Get-Go · DEMO · reconstrução conceitual</p>
      </main>`,
    buildTimeline: async ({ timeline, stage: productStage }) => {
      const fontSelectors = ["#hero-copy", "#entity-title", "#record-label", "#hero-title", "#record-value", "#status-value"];
      const computedTypography = fontSelectors.map((selector) => {
        const style = getComputedStyle(productStage.querySelector(selector));
        return { selector, family: style.fontFamily, weight: style.fontWeight, size: style.fontSize };
      });
      const webFontRequests = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((url) => /\.(?:woff2?|ttf|otf)(?:[?#]|$)/i.test(url));
      if (computedTypography.some((entry) => !entry.family.startsWith("system-ui")) || webFontRequests.length) {
        throw new Error("The conceptual composition must use the system font stack without web-font requests.");
      }
      window.__getGoFontProof = {
        family: "system-ui, sans-serif",
        measuredWeights: [500, 600, 650, 700],
        computedTypography,
        webFontRequests,
      };

      const stageBox = productStage.getBoundingClientRect();
      const sourceRow = productStage.querySelector(entityAnchors.sourceRecordSelector);
      const sourceLabel = productStage.querySelector("#record-label");
      const readingAnchor = productStage.querySelector(entityAnchors.readingSelector);
      const readingLabel = productStage.querySelector("#reading-label");
      const flight = productStage.querySelector("#entity-flight");
      const sourceBox = sourceLabel.getBoundingClientRect();
      const readingBox = readingLabel.getBoundingClientRect();
      const sourcePosition = {
        x: sourceBox.left - stageBox.left,
        y: sourceBox.top - stageBox.top,
      };
      const destinationPosition = {
        x: readingBox.left - stageBox.left,
        y: readingBox.top - stageBox.top,
      };
      flight.style.left = `${sourcePosition.x}px`;
      flight.style.top = `${sourcePosition.y}px`;
      flight.style.width = `${sourceBox.width}px`;
      flight.style.height = `${sourceBox.height}px`;
      const delta = {
        x: destinationPosition.x - sourcePosition.x,
        y: destinationPosition.y - sourcePosition.y,
      };
      const relationPath = productStage.querySelector("#relation-path");
      const relationLength = relationPath.getTotalLength();
      relationPath.style.strokeDasharray = `${relationLength}`;
      relationPath.style.strokeDashoffset = `${relationLength}`;

      const visible = (selector, at, duration = 0.58, vars = {}) => {
        timeline.fromTo(
          productStage.querySelector(selector),
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration, ease: "power2.out", immediateRender: false, ...vars },
          at,
        );
      };

      visible("#hero-context", 0.35, 0.7);
      visible("#diagram", 1.25, 0.6);
      visible("#link-copy", 2.45, 0.45);
      timeline.to(relationPath, { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut" }, 3.05);
      timeline.fromTo("#relation-dot", { x: -170, autoAlpha: 0 }, { x: 170, autoAlpha: 1, duration: 1.4, ease: "power1.inOut", immediateRender: false }, 3.12);
      visible("#source-title", 4.65, 0.5);
      visible("#source-table", 5.25, 0.48);
      visible("#status-line", 6.5, 0.55);

      const handoffStart = 8.066666666666666;
      const handoffEnd = 9.1;
      const horizontalEnd = handoffStart + 0.38;
      const verticalEnd = handoffStart + 0.76;
      const laneX = 1000;
      const readBox = (element) => {
        const box = element.getBoundingClientRect();
        return {
          x: box.left - stageBox.left,
          y: box.top - stageBox.top,
          width: box.width,
          height: box.height,
        };
      };
      window.__getGoHandoffProof = {
        handoffStart,
        horizontalEnd,
        verticalEnd,
        handoffEnd,
        sourceRow: readBox(sourceRow),
        sourceLabel: readBox(sourceLabel),
        flightAtStart: readBox(flight),
        lane: { x: laneX, y: sourcePosition.y, width: sourceBox.width, height: sourceBox.height },
        destinationLabel: readBox(readingLabel),
        destinationRow: readBox(readingAnchor),
        formPanel: readBox(productStage.querySelector(entityAnchors.itemSelector)),
        sourcePanel: readBox(productStage.querySelector(entityAnchors.sourceSelector)),
        statusLine: readBox(productStage.querySelector("#status-line")),
      };
      timeline.set(sourceRow, { autoAlpha: 0 }, handoffStart);
      timeline.fromTo(
        flight,
        { x: 0, y: 0, autoAlpha: 1 },
        { x: laneX - sourcePosition.x, y: 0, autoAlpha: 1, duration: 0.38, ease: "power2.inOut", immediateRender: false },
        handoffStart,
      );
      timeline.to(flight, { x: laneX - sourcePosition.x, y: delta.y, duration: 0.38, ease: "power1.inOut" }, horizontalEnd);
      timeline.to(flight, { x: delta.x, y: delta.y, duration: handoffEnd - verticalEnd, ease: "power1.inOut" }, verticalEnd);
      timeline.set(flight, { autoAlpha: 0 }, handoffEnd);
      timeline.set(readingAnchor, { autoAlpha: 1 }, handoffEnd);
      visible("#closing", 10.4, 0.55);
      timeline.to("#footer-note", { color: "#163b39", duration: 0.25, ease: "none" }, 12.2);
      timeline.set("#source-node", { autoAlpha: 0.4 }, 12.7);
      timeline.set("#form-item", { autoAlpha: 0.7 }, 12.7);
      timeline.set("#status-line", { autoAlpha: 1 }, 12.7);
      timeline.set("#closing", { autoAlpha: 1 }, 12.7);
      timeline.set("#reading-anchor", { autoAlpha: 0 }, 0);
    },
  });
  return { timeline: completed.timeline };
}

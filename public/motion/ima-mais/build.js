import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import { animateEntityHandoff, applyBrandTokens, renderProductSurface } from "./assets/shared/product-components.js";
import { brandTokens, contentData } from "./story-data.js";

const compositionId = "ima-mais-history-demo";
const stage = document.querySelector("#product-stage");
const entityAnchors = {
  entityId: contentData.record.entityId,
  source: "#entity-source",
  destination: "#entity-destination",
  flight: "#entity-flight",
};

function stageBox(element, stageElement) {
  const rect = element.getBoundingClientRect();
  const stageRect = stageElement.getBoundingClientRect();
  return {
    x: rect.left - stageRect.left,
    y: rect.top - stageRect.top,
    width: rect.width,
    height: rect.height,
  };
}

function renderRecordCard(instance, className) {
  return `<article class="entity-card ${className}" id="entity-${instance}" data-entity-id="${contentData.record.entityId}">
    <div class="entity-card__text">
      <span class="entity-id" id="${instance}-label">${contentData.record.id}</span>
      <span class="entity-title" id="${instance}-title">${contentData.record.title}</span>
    </div>
    <span class="entity-status" id="${instance}-status">${contentData.record.status}</span>
  </article>`;
}

// MONTAGEM DA CONSULTA HISTÓRICA
export async function buildComposition() {
  return initializeComposition({
    stage,
    renderBody: () => {
      applyBrandTokens(stage, brandTokens);
      const surface = renderProductSurface({
        id: "product-surface",
        label: "Reconstrução histórica de consulta de requerimento",
        children: `
          <div class="archive-header">
            <div class="archive-wordmark" aria-label="IMA+">IMA<span class="archive-wordmark__plus">+</span></div>
            <span class="history-chip" id="archive-label">Arquivo ${contentData.referenceYear} · DEMO</span>
          </div>
          <section class="case-copy" id="case-copy" aria-label="Consulta de requerimentos">
            <h1 class="case-title case-title--list" id="title-list">Consulte seus requerimentos</h1>
            <h1 class="case-title case-title--focus" id="title-focus">Situação do requerimento</h1>
          </section>
          <div class="phone-frame" id="archive-screen" aria-label="Lista histórica de requerimentos">
            <div class="phone-screen">
              <div class="phone-topline"><span class="phone-product">IMA+</span></div>
              <div class="phone-heading">
                <h2 id="phone-title">Requerimentos</h2>
                <p>Autorização</p>
              </div>
              <div class="record-area">
                <p class="record-area__label" id="record-section-label">Lista de requerimentos</p>
                <div class="entity-slot" id="entity-source-slot" aria-hidden="true"></div>
                ${renderRecordCard("source", "entity-card--source")}
              </div>
            </div>
          </div>
          <div class="editorial-focus" id="editorial-focus" aria-label="Destaque editorial do requerimento">
            ${renderRecordCard("destination", "entity-card--editorial")}
          </div>
          <div class="product-entity-flight" id="entity-flight" aria-hidden="true">
            ${renderRecordCard("flight", "entity-card--flight")}
          </div>
        `,
      });
      return `${surface}`;
    },
    buildTimeline: ({ timeline }) => {
      const copy = stage.querySelector("#case-copy");
      const screen = stage.querySelector("#archive-screen");
      const titleList = stage.querySelector("#title-list");
      const titleFocus = stage.querySelector("#title-focus");
      const source = stage.querySelector(entityAnchors.source);
      const destination = stage.querySelector(entityAnchors.destination);
      const flight = stage.querySelector(entityAnchors.flight);

      timeline.set([copy, screen], { autoAlpha: 1 });
      timeline.set(titleFocus, { autoAlpha: 0 });
      timeline.set(destination, { autoAlpha: 0 });
      timeline.set(flight, { autoAlpha: 0 });
      timeline.set(source, { autoAlpha: 1 });

      const handoff = animateEntityHandoff({
        timeline,
        flight,
        source,
        destination,
        sourceBox: stageBox(source, stage),
        destinationBox: stageBox(destination, stage),
        start: 4.6,
        duration: 1.1,
      });

      timeline.to(titleList, { autoAlpha: 0, duration: 0.18, ease: "power1.out" }, handoff.start + 0.15);
      timeline.to(titleFocus, { autoAlpha: 1, duration: 0.24, ease: "power1.out" }, handoff.start + 0.46);
      timeline.to(flight.querySelector(".entity-id"), { fontSize: 40, duration: handoff.end - handoff.start, ease: "power2.inOut" }, handoff.start);
      timeline.to(flight.querySelector(".entity-title"), { fontSize: 31, duration: handoff.end - handoff.start, ease: "power2.inOut" }, handoff.start);
      timeline.to(flight.querySelector(".entity-status"), { fontSize: 30, duration: handoff.end - handoff.start, ease: "power2.inOut" }, handoff.start);
    },
  });
}


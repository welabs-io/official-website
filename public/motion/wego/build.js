import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import { measureTarget } from "./assets/shared/measured-action.js";
import { panoramaData } from "./data/content-data.js";

export async function buildComposition() {
  const stage = document.querySelector("#product-stage");
  const entityMarkup = panoramaData.modules.map((module) => `
    <article class="entity-card entity-card--${module.id}" id="entity-${module.id}" data-entity-id="${module.entityId}" aria-label="${module.label} · ${module.object}">
      <header class="entity-heading"><span class="entity-module">${module.label}</span><span class="entity-kind">DEMO</span></header>
      <div class="object-art object-art--${module.artwork}" aria-hidden="true">
        <span class="art-sheet"></span><span class="art-lines"></span><span class="art-mark"></span>
      </div>
      <div class="entity-copy">
        <h2 class="entity-title" id="entity-title-${module.id}">${module.object}</h2>
        <p class="entity-state" id="entity-state-${module.id}">${module.state}</p>
        <div class="entity-details">
          ${module.details.map((detail, index) => `<p class="entity-detail" id="entity-detail-${module.id}-${index + 1}">${detail}</p>`).join("")}
        </div>
      </div>
    </article>`).join("");

  const { timeline } = await initializeComposition({
    stage,
    renderBody: () => `
      <div id="product-content">
        <header class="wego-topline">
          <p class="wego-wordmark">WeGO</p>
          <span class="demo-chip">DEMO</span>
        </header>
        <section class="panorama-heading" aria-label="Contexto do ecossistema">
          <p class="panorama-eyebrow">Ecossistema ambiental e documental</p>
          <h1 id="panorama-title">Cinco frentes, no mesmo panorama.</h1>
        </section>
        <div class="panorama-window" id="panorama-window" aria-label="Panorama dos módulos WeGO">
          <div class="panorama-camera" id="panorama-camera" data-layout-allow-overflow="true">
            <div class="panorama-plane" id="panorama-plane">${entityMarkup}</div>
          </div>
        </div>
        <p class="demo-footer">DEMO · reconstrução ilustrativa</p>
      </div>`,
    buildTimeline: ({ timeline: productTimeline, stage: productStage }) => {
      const camera = productStage.querySelector("#panorama-camera");
      const focus = panoramaData.focus;
      const measuredAnchor = measureTarget(productStage, focus.selector);
      const stageBox = productStage.getBoundingClientRect();
      const focusPose = {
        x: stageBox.width / 2 - measuredAnchor.center.x * focus.scale,
        y: focus.targetY - measuredAnchor.center.y * focus.scale,
        scale: focus.scale,
      };

      camera.dataset.focusEntity = focus.entityId;
      camera.dataset.focusSelector = focus.selector;
      camera.dataset.focusSourceBox = JSON.stringify(measuredAnchor.targetBox);
      camera.dataset.focusPose = JSON.stringify(focusPose);
      productTimeline.set("#panorama-camera", { x: 0, y: 0, scale: 1, transformOrigin: "0 0" }, 0);
      productTimeline.addLabel("panorama-context", 0);
      productTimeline.addLabel("document-approach", focus.approachStart);
      productTimeline.to("#panorama-camera", {
        x: focusPose.x,
        y: focusPose.y,
        scale: focusPose.scale,
        duration: focus.approachDuration,
        ease: "power3.inOut",
      }, focus.approachStart);
      productTimeline.addLabel("document-focus", focus.approachStart + focus.approachDuration);
      productTimeline.addLabel("panorama-return", focus.holdUntil);
      productTimeline.to("#panorama-camera", {
        x: 0,
        y: 0,
        scale: 1,
        duration: focus.returnDuration,
        ease: "power3.inOut",
      }, focus.holdUntil);
      productTimeline.addLabel("panorama-restored", focus.holdUntil + focus.returnDuration);
      productTimeline.addLabel("panorama-end", panoramaData.duration);
    },
  });

  return { timeline };
}

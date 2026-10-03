import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import { storyData } from "./data/story-data.js";

const storyTiming = {
  duration: 12,
  activeStarts: [0.35, 3.6, 7.55],
  moveStarts: [2.55, 6.55],
  moveDuration: 0.75,
};

function renderBody() {
  return `
    <section class="sgors-board" aria-label="Jornada conceitual SGORS">
      <header class="sgors-topline">
        <div class="sgors-brand">SGORS <span aria-hidden="true">·</span> IMA · contexto institucional</div>
        <div class="sgors-demo">DEMO · reconstrução ilustrativa</div>
      </header>
      <div class="sgors-heading">Do registro ao recebimento</div>
      <div class="sgors-subheading">Gestão de resíduos em etapas para gerador, transportador e receptor</div>
      <div class="sgors-flow">
        <article class="sgors-module is-active" id="generator-module" data-module="generator">
          <div class="sgors-module-tag">01 · Gerador</div>
          <div class="sgors-module-title">Organizar o registro</div>
          <div class="sgors-module-copy">Resíduo e destino em etapas do formulário MTR.</div>
          <div class="sgors-data-row"><span>Material</span><strong>${storyData.waste}</strong></div>
          <div class="sgors-data-row"><span>Quantidade</span><strong>${storyData.quantity}</strong></div>
        </article>
        <article class="sgors-module" id="transport-module" data-module="transport">
          <div class="sgors-module-tag">02 · Transporte</div>
          <div class="sgors-module-title">Acompanhar a etapa</div>
          <div class="sgors-module-copy">A jornada conserva o identificador do registro.</div>
          <div class="sgors-data-row"><span>Origem</span><strong>${storyData.origin}</strong></div>
          <div class="sgors-data-row"><span>Responsável</span><strong>${storyData.carrier}</strong></div>
        </article>
        <article class="sgors-module" id="receiver-module" data-module="receiver">
          <div class="sgors-module-tag">03 · Receptor</div>
          <div class="sgors-module-title">Registrar recebimento</div>
          <div class="sgors-module-copy">A tela de recebimento apresenta a MTR e os dados do gerador.</div>
          <div class="sgors-data-row"><span>Destino</span><strong>${storyData.receiver}</strong></div>
          <div class="sgors-data-row"><span>Registro</span><strong>Recebimento</strong></div>
        </article>
      </div>
      <div class="sgors-record" id="record-anchor">
        <div class="sgors-record-mark" aria-hidden="true">R</div>
        <div class="sgors-record-copy">${storyData.recordId}<span class="sgors-record-status" id="record-status">${storyData.states[0]}</span></div>
      </div>
      <footer class="sgors-footer"><span>Módulos SGORS · sequência conceitual</span><span>WeGO · gestão ambiental</span></footer>
    </section>
  `;
}

export async function buildComposition() {
  return initializeComposition({
    stage: document.querySelector("#product-stage"),
    renderBody,
    buildTimeline: ({ timeline, stage }) => {
      const modules = [
        stage.querySelector("#generator-module"),
        stage.querySelector("#transport-module"),
        stage.querySelector("#receiver-module"),
      ];
      const status = stage.querySelector("#record-status");
      const record = stage.querySelector("#record-anchor");
      timeline.fromTo(stage.querySelector(".sgors-heading"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, 0.1);
      timeline.fromTo(stage.querySelector(".sgors-subheading"), { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0.45);
      modules.forEach((module, index) => {
        timeline.fromTo(module, { opacity: 0.48, y: 14 }, { opacity: 1, y: 0, duration: 0.42, ease: "power2.out" }, storyTiming.activeStarts[index]);
        if (index > 0) {
          timeline.to(modules[index - 1], { opacity: 0.78, duration: 0.32 }, storyTiming.activeStarts[index]);
        }
      });
      timeline.set(status, { textContent: storyData.states[1] }, storyTiming.moveStarts[0]);
      timeline.to(record, { x: 588, duration: storyTiming.moveDuration, ease: "power2.inOut" }, storyTiming.moveStarts[0]);
      timeline.set(status, { textContent: storyData.states[2] }, storyTiming.moveStarts[1]);
      timeline.to(record, { x: 1176, duration: storyTiming.moveDuration, ease: "power2.inOut" }, storyTiming.moveStarts[1]);
      timeline.to(stage.querySelector("#transport-module"), { opacity: 0.7, duration: 0.4 }, 8.05);
      timeline.to(stage.querySelector("#receiver-module"), { boxShadow: "0 24px 52px rgba(27,95,73,.18)", duration: 0.5 }, 8.05);
      timeline.to(status, { color: "#16583f", duration: 0.35 }, 9.1);
    },
  });
}

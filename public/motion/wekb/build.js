import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import { story } from "./story-data.js";

const escapeMarkup = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

const sourceMarkup = () => `
  <section id="product-surface" aria-label="Demonstração conceitual de rastreabilidade">
    <div id="product-content">
      <header class="brandline">
        <div class="wordmark"><span class="wordmark__name">${escapeMarkup(story.brand)}</span><span class="wordmark__publisher">Welabs</span></div>
        <span class="demo-seal">${escapeMarkup(story.demoLabel)}</span>
      </header>
      <div class="story">
        <p class="eyebrow">RECUPERAR CONTEXTO <span aria-hidden="true">/</span> FONTE → EVIDÊNCIA</p>
        <h1 id="headline">${escapeMarkup(story.title)}</h1>
        <div class="source-excerpt" id="source-excerpt">
          <span class="source-excerpt__label">TEXTO-FONTE · DEMO</span>
          <p id="source-text">${escapeMarkup(story.passageText)}</p>
        </div>
        <div class="question-row">
          <span class="question-kicker">CONSULTA CONCEITUAL</span>
          <p id="ask-text">${escapeMarkup(story.question)}</p>
          <span class="question-mark" aria-hidden="true">?</span>
        </div>
        <div class="trace" aria-label="Caminho conceitual entre fonte, artefato, versão e trecho">
          <span class="trace-wire" id="wire-source-artifact" aria-hidden="true"></span>
          <span class="trace-wire" id="wire-artifact-version" aria-hidden="true"></span>
          <span class="trace-wire" id="wire-version-passage" aria-hidden="true"></span>
          <article class="trace-node trace-node--source" id="source-node">
            <span class="node-index">01 <span>ORIGEM</span></span>
            <span class="node-shape node-shape--source" aria-hidden="true"><span></span></span>
            <h2 id="object-source">Fonte</h2>
            <p class="node-value" id="source-uri">${escapeMarkup(story.sourceUri)}</p>
          </article>
          <article class="trace-node trace-node--artifact" id="artifact-node">
            <span class="node-index">02 <span>ITEM</span></span>
            <span class="node-shape node-shape--artifact" aria-hidden="true"><span></span></span>
            <h2 id="object-artifact">Artefato</h2>
            <p class="node-value" id="artifact-ref">${escapeMarkup(story.artifactRef)}</p>
          </article>
          <article class="trace-node trace-node--version" id="version-node">
            <span class="node-index">03 <span>OBSERVAÇÃO</span></span>
            <span class="node-shape node-shape--version" aria-hidden="true"><span></span></span>
            <h2 id="object-version">Versão</h2>
            <p class="node-value" id="version-ref">${escapeMarkup(story.versionRef)}</p>
          </article>
          <article class="trace-node trace-node--passage" id="passage-node">
            <span class="node-index">04 <span>TRECHO</span></span>
            <span class="node-shape node-shape--passage" aria-hidden="true"><span>“</span></span>
            <h2 id="object-passage">Passagem</h2>
            <p class="node-value" id="passage-ref">${escapeMarkup(story.passageRef)}</p>
          </article>
        </div>
        <section class="evidence" id="passage-panel" aria-label="Exemplo de trecho e rastreio">
          <div class="evidence__quote">
            <span class="evidence__label">TRECHO ${escapeMarkup(story.passageRef)}</span>
            <blockquote id="quote-text">${escapeMarkup(story.passageText)}</blockquote>
          </div>
          <div class="evidence__trail">
            <span class="evidence__label">RASTRO DO EXEMPLO</span>
            <p id="trail-source">${escapeMarkup(story.sourceUri)}</p>
            <p id="trail-artifact">${escapeMarkup(story.artifactRef)} <span aria-hidden="true">·</span> ${escapeMarkup(story.versionRef)} <span aria-hidden="true">·</span> trecho ${escapeMarkup(story.passageRef)}</p>
          </div>
        </section>
        <footer class="footerline" id="footerline"><span>WEKB <span aria-hidden="true">/</span> CONHECIMENTO COM RASTREIO</span><span>FONTE · ARTEFATO · VERSÃO · PASSAGEM</span></footer>
      </div>
    </div>
  </section>`;

export async function buildComposition() {
  return initializeComposition({
    stage: document.querySelector("#product-stage"),
    renderBody: sourceMarkup,
    buildTimeline: ({ timeline }) => {
      timeline.fromTo("#headline", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power2.out" }, 0.15);
      timeline.fromTo(".question-row", { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: "power2.out" }, 0.85);
      timeline.fromTo("#source-excerpt", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.15);
      timeline.fromTo("#source-node", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" }, 1.25);
      timeline.fromTo("#artifact-node", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 3.28);
      timeline.fromTo("#wire-source-artifact", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" }, 3.82);
      timeline.fromTo("#version-node", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 5.33);
      timeline.fromTo("#wire-artifact-version", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" }, 5.87);
      timeline.fromTo("#passage-node", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 7.28);
      timeline.fromTo("#wire-version-passage", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" }, 7.82);
      timeline.fromTo("#passage-panel", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power2.out" }, 8.05);
      timeline.to("#source-excerpt", { autoAlpha: 0, duration: 0.28, ease: "none" }, 7.95);
      timeline.fromTo("#footerline", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 9.1);
    },
  });
}

import { initializeComposition } from "./assets/shared/composition-shell/init.js";

const renderBody = () => `
  <section id="sdk-story" aria-label="Demonstração conceptual do Channels SDK">
    <header class="sdk-identity">
      <span class="sdk-label">Channels SDK · rótulo de trabalho</span>
      <span class="demo-label">DEMO · reconstrução ilustrativa</span>
    </header>
    <h1 class="sdk-title" id="sdk-title">Monte o runtime dentro da sua aplicação.</h1>
    <p class="sdk-dek" id="sdk-dek">Imports reais · teste em memória · resposta local demonstrativa</p>
    <div class="payload-rail" aria-hidden="true"></div>
    <div class="payload-object" id="message-payload" data-state="input" aria-label="Payload sintético">
      <span class="payload-values">
        <span class="payload-value" id="input-value">message-1 · oi</span>
        <span class="payload-value payload-value-reply" id="reply-value">Olá, Ada!</span>
      </span>
    </div>
    <div class="truth-line" id="workspace-status">@welabs-io/channels · 0.0.0 · private:true</div>
  </section>
  <div
    data-composition-id="code-morph"
    data-composition-src="compositions/code-morph.html"
    data-start="0"
    data-duration="16"
    data-track-index="0"
    data-width="1920"
    data-height="1080"
  ></div>`;

export async function buildComposition() {
  const { timeline } = await initializeComposition({
    stage: document.querySelector("#product-stage"),
    renderBody,
    buildTimeline: ({ timeline: productTimeline, stage }) => {
      const payload = stage.querySelector("#message-payload");
      const dek = stage.querySelector("#sdk-dek");

      productTimeline.fromTo("#sdk-story", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.out" }, 0);
      productTimeline.fromTo("#sdk-title", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48, ease: "power2.out" }, 0.12);
      productTimeline.fromTo("#sdk-dek", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 0.5);
      productTimeline.fromTo("#message-payload", { x: 0, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "power1.out" }, 2.15);
      productTimeline.to(payload, { x: 980, duration: 1.75, ease: "power2.inOut" }, 6.65);
      productTimeline.fromTo("#input-value", { opacity: 1 }, { opacity: 0, duration: 0.24, ease: "none" }, 8.25);
      productTimeline.fromTo("#reply-value", { opacity: 0 }, { opacity: 1, duration: 0.24, ease: "none" }, 8.25);
      productTimeline.to(payload, { scale: 1.035, duration: 0.28, yoyo: true, repeat: 1, ease: "power1.out" }, 8.25);
      productTimeline.to(dek, { opacity: 0, duration: 0.2 }, 10.6);
      productTimeline.call(() => {
        dek.textContent = "O exemplo responde no runtime local, sem depender do serviço hospedado.";
      }, [], 10.8);
      productTimeline.to(dek, { opacity: 1, duration: 0.26 }, 10.8);
      productTimeline.to("#workspace-status", { color: "#c7d6e3", duration: 0.3 }, 11.2);
    },
  });

  return { timeline };
}

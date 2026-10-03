import { initializeComposition } from "./assets/shared/composition-shell/init.js";

export async function buildComposition() {
  const contentData = {
    installationId: "inst_demo",
    endpointId: "ep_demo",
    eventType: "channels.message.received",
    deliveryId: "dlv_demo",
  };

  const renderBody = () => `
  <section id="product-surface" aria-label="Jornada conceitual do Channels Product">
    <header class="topline">
      <span class="brand-label">Channels Product · serviço em desenvolvimento</span>
      <span class="demo-label">DEMO · reconstrução ilustrativa</span>
    </header>
    <div class="hero">
      <p class="eyebrow">Uma instalação conecta conversa e consumidor</p>
      <h1>Do vínculo ao evento — e de volta à conversa</h1>
      <p class="hero-copy">O control plane mantém o vínculo; cada lado conserva seu domínio.</p>
    </div>
    <div class="map" aria-label="Consumidor, serviço Channels e plataforma Discord">
      <svg class="links" viewBox="0 0 1768 650" aria-hidden="true">
        <path class="route" d="M365 185 C480 185 518 185 655 185" pathLength="1" />
        <path class="route" d="M1115 185 C1242 185 1290 185 1403 185" pathLength="1" />
        <path class="route-active" id="install-route" d="M365 185 C480 185 518 185 655 185" pathLength="1" />
        <path class="route-active" id="event-route" d="M1403 185 C1290 185 1242 185 1115 185" pathLength="1" />
        <path class="route-active" id="event-consumer-route" d="M655 185 C518 185 480 185 365 185" pathLength="1" />
        <path class="route-reply" id="reply-route" d="M365 211 C480 211 518 211 655 211" pathLength="1" />
        <path class="route-reply" id="reply-platform-route" d="M1115 211 C1242 211 1290 211 1403 211" pathLength="1" />
      </svg>
      <article class="node node-consumer" id="consumer-node">
        <span class="node-kicker">CONSUMIDOR</span>
        <h2 class="node-title">Backend da aplicação</h2>
        <p class="node-subtitle">Domínio próprio · integração por API</p>
      </article>
      <article class="node node-control" id="control-node">
        <span class="node-kicker">CHANNELS · CONTROL PLANE</span>
        <h2 class="node-title">Vínculo e roteamento</h2>
        <div class="service-mark"><span class="service-dot"></span><span>inst_demo</span></div>
      </article>
      <article class="node node-platform" id="platform-node">
        <span class="node-kicker">PLATAFORMA</span>
        <h2 class="node-title">Servidor Discord</h2>
        <p class="node-subtitle">endpoint ep_demo <span class="record-state" id="endpoint-pending">aguardando ativação</span><span class="record-state" id="endpoint-authorized">autorizado</span></p>
      </article>
      <span class="pulse-point" id="install-pulse"></span>
      <span class="pulse-point" id="event-pulse"></span>
      <span class="pulse-point" id="reply-pulse"></span>
      <section class="ledger" id="record-ledger" aria-label="Registros relacionados da mesma instalação">
        <p class="ledger-kicker">REGISTROS DA MESMA INSTALAÇÃO</p>
        <div class="ledger-row">
          <div class="ledger-cell install-cell"><span class="cell-label">Instalação</span><strong class="cell-value" id="install-id">inst_demo</strong><span class="record-state" id="install-pending-state">pending_activation</span><span class="record-state" id="install-active-state">active</span></div>
          <div class="ledger-cell"><span class="cell-label">Ativação</span><strong class="cell-value state-value" id="activation-pending-state">Pendente</strong><strong class="cell-value state-value" id="activation-active-state">Ativa</strong></div>
          <div class="ledger-cell event-cell"><span class="cell-label">Evento de entrada</span><strong class="cell-value state-value" id="event-waiting-state">Aguardando</strong><strong class="cell-value state-value" id="event-record">channels.message.received</strong></div>
          <div class="ledger-cell delivery-cell"><span class="cell-label">Entrega</span><strong class="cell-value state-value" id="delivery-waiting-state">Aguardando</strong><strong class="cell-value state-value" id="delivery-queued-state">dlv_demo · queued</strong><strong class="cell-value state-value" id="delivery-sent-state">dlv_demo · sent</strong></div>
        </div>
      </section>
      <div class="stage-caption" aria-live="off">
        <p class="caption-step" id="step-create">O consumidor pede o vínculo da instalação.</p>
        <p class="caption-step" id="step-activate">Um administrador ativa; o endpoint passa a pertencer à instalação.</p>
        <p class="caption-step" id="step-event">A conversa vira evento assinado, entregue ao consumidor.</p>
        <p class="caption-step" id="step-reply">A resposta percorre o control plane até a plataforma.</p>
      </div>
    </div>
    <footer class="footline">
      <span>Consumidor: domínio da aplicação</span>
      <span>Channels: aplicações · instalações · eventos · entregas</span>
      <span>Discord: plataforma ilustrativa</span>
    </footer>
  </section>`;

  const { timeline } = await initializeComposition({
  stage: document.querySelector("#product-stage"),
  renderBody,
  buildTimeline: ({ timeline: productTimeline, stage }) => {
    const find = (selector) => stage.querySelector(selector);
    const createStep = find("#step-create");
    const activateStep = find("#step-activate");
    const eventStep = find("#step-event");
    const replyStep = find("#step-reply");
    const installRoute = find("#install-route");
    const eventRoute = find("#event-route");
    const eventConsumerRoute = find("#event-consumer-route");
    const replyRoute = find("#reply-route");
    const replyPlatformRoute = find("#reply-platform-route");

    productTimeline.fromTo("#product-surface", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out" }, 0);
    productTimeline.fromTo(".hero", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" }, 0.18);
    productTimeline.fromTo(["#consumer-node", "#control-node", "#platform-node"], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: "power2.out" }, 0);
    productTimeline.fromTo("#record-ledger", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power2.out" }, 0.18);
    productTimeline.set("#install-pending-state, #activation-pending-state, #endpoint-pending, #event-waiting-state, #delivery-waiting-state", { autoAlpha: 1 }, 0);
    productTimeline.set("#install-active-state, #activation-active-state, #endpoint-authorized, #event-record, #delivery-queued-state, #delivery-sent-state", { autoAlpha: 0 }, 0);

    productTimeline.to(installRoute, { strokeDashoffset: 0, duration: 1.15, ease: "power2.inOut" }, 1.35);
    productTimeline.fromTo("#install-pulse", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power1.out" }, 1.42);
    productTimeline.to("#install-pulse", { left: "37%", duration: 0.9, ease: "power2.inOut" }, 1.55);
    productTimeline.to("#install-pulse", { opacity: 0, duration: 0.2 }, 2.5);
    productTimeline.fromTo(createStep, { opacity: 0, y: 9 }, { opacity: 1, y: 0, duration: 0.25 }, 0.2);

    productTimeline.to(createStep, { opacity: 0, duration: 0.22 }, 2.8);
    productTimeline.fromTo(activateStep, { opacity: 0, y: 9 }, { opacity: 1, y: 0, duration: 0.28 }, 3.02);
    productTimeline.set("#install-pending-state, #activation-pending-state, #endpoint-pending", { autoAlpha: 0 }, 4.3);
    productTimeline.set("#install-active-state, #activation-active-state, #endpoint-authorized", { autoAlpha: 1 }, 4.3);
    productTimeline.fromTo(".service-dot", { scale: 0.72, backgroundColor: "#71859e", boxShadow: "0 0 0 rgba(119,224,223,0)" }, { scale: 1, backgroundColor: "#77e0df", boxShadow: "0 0 18px rgba(119,224,223,0.7)", duration: 0.55, ease: "back.out(2)" }, 4.3);
    productTimeline.to("#platform-node", { borderColor: "#5d8c91", duration: 0.45 }, 4.3);

    productTimeline.to(activateStep, { opacity: 0, duration: 0.22 }, 5.55);
    productTimeline.fromTo(eventStep, { opacity: 0, y: 9 }, { opacity: 1, y: 0, duration: 0.28 }, 5.8);
    productTimeline.to(eventRoute, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 6.05);
    productTimeline.fromTo("#event-pulse", { opacity: 0, scale: 0.65 }, { opacity: 1, scale: 1, duration: 0.18 }, 6.1);
    productTimeline.to("#event-pulse", { left: "63%", duration: 0.9, ease: "power2.inOut" }, 6.2);
    productTimeline.to(eventConsumerRoute, { strokeDashoffset: 0, duration: 0.92, ease: "power2.inOut" }, 6.92);
    productTimeline.to("#event-pulse", { left: "20.6%", duration: 0.92, ease: "power2.inOut" }, 6.92);
    productTimeline.to("#event-pulse", { opacity: 0, duration: 0.2 }, 7.88);
    productTimeline.set("#event-waiting-state", { autoAlpha: 0 }, 7.98);
    productTimeline.set("#event-record", { autoAlpha: 1 }, 7.98);
    productTimeline.fromTo("#event-record", { color: "#d8c8ff" }, { color: "#ffffff", duration: 0.42 }, 7.98);

    productTimeline.to(eventStep, { opacity: 0, duration: 0.22 }, 9.15);
    productTimeline.fromTo(replyStep, { opacity: 0, y: 9 }, { opacity: 1, y: 0, duration: 0.28 }, 9.4);
    productTimeline.to(replyRoute, { strokeDashoffset: 0, duration: 1.05, ease: "power2.inOut" }, 9.7);
    productTimeline.fromTo("#reply-pulse", { opacity: 0, scale: 0.65 }, { opacity: 1, scale: 1, duration: 0.18 }, 9.72);
    productTimeline.to("#reply-pulse", { left: "37%", duration: 0.9, ease: "power2.inOut" }, 9.82);
    productTimeline.to(replyPlatformRoute, { strokeDashoffset: 0, duration: 0.92, ease: "power2.inOut" }, 10.74);
    productTimeline.to("#reply-pulse", { left: "80%", duration: 0.92, ease: "power2.inOut" }, 10.74);
    productTimeline.to("#reply-pulse", { opacity: 0, duration: 0.2 }, 11.7);
    productTimeline.set("#delivery-waiting-state", { autoAlpha: 0 }, 10.74);
    productTimeline.set("#delivery-queued-state", { autoAlpha: 1 }, 10.74);
    productTimeline.set("#delivery-queued-state", { autoAlpha: 0 }, 11.72);
    productTimeline.set("#delivery-sent-state", { autoAlpha: 1 }, 11.72);
    productTimeline.to("#control-node", { borderColor: "#62aeb0", duration: 0.55 }, 12.4);
    productTimeline.to(replyStep, { opacity: 0.82, duration: 0.5 }, 14.1);
    productTimeline.to(".footline", { color: "#b2c3d7", duration: 0.5 }, 14.35);

    return { scope: "conceptual", ids: contentData };
  },
  });

  return { timeline };
}

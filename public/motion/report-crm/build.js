import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import { measureTarget } from "./assets/shared/measured-action.js";

export async function buildComposition() {
  return initializeComposition({
    stage: document.querySelector("#product-stage"),
    renderBody: () => `
      <section id="relationship-stage" class="report-content" aria-label="Relação entre empresa e contato">
        <div class="ambient-glow" id="ambient-glow" aria-hidden="true"></div>
        <p class="eyebrow">Report CRM</p>
        <p class="demo-seal">DEMO · reconstrução ilustrativa</p>
        <h1 class="main-title" id="main-title">Contatos associados à empresa</h1>
        <p class="scope-label" id="scope-label">Uma empresa mantém o contexto da relação.</p>
        <div class="anchor-mark" id="anchor-opening" aria-hidden="true"></div>
        <svg class="relation-visual" id="relation-visual" width="1920" height="1080" viewBox="0 0 1920 1080" aria-hidden="true">
          <path class="relation-halo" id="relation-halo"></path>
          <path class="relation-path" id="relationship-path"></path>
        </svg>
        <article class="entity-node" id="company-entity" aria-label="Empresa DEMO">
          <p class="entity-kicker">Contexto</p>
          <h2 class="entity-name" id="company-label">Empresa DEMO</h2>
        </article>
        <article class="entity-node" id="contact-entity" aria-label="Contato associado">
          <p class="entity-kicker">Relação</p>
          <h2 class="entity-name" id="contact-label">Contato associado</h2>
        </article>
        <p class="route-proof" id="route-proof"><span>Rota de consulta</span><code><span class="route-method">GET</span> /company/:companyId/contact</code></p>
        <div class="footer-rule" id="footer-rule" aria-hidden="true"></div>
      </section>`,
    buildTimeline: ({ timeline, stage }) => {
      const company = stage.querySelector("#company-entity");
      const contact = stage.querySelector("#contact-entity");
      const route = stage.querySelector("#route-proof");
      const relation = stage.querySelector("#relationship-path");
      const halo = stage.querySelector("#relation-halo");
      const opening = measureTarget(stage, "#anchor-opening").center;
      const companyMeasurement = measureTarget(stage, "#company-entity");
      const contactMeasurement = measureTarget(stage, "#contact-entity");
      const companyStart = {
        x: opening.x - companyMeasurement.center.x,
        y: opening.y - companyMeasurement.center.y,
      };
      const startX = companyMeasurement.targetBox.x + companyMeasurement.targetBox.width;
      const startY = companyMeasurement.center.y;
      const endX = contactMeasurement.targetBox.x;
      const endY = contactMeasurement.center.y;
      const midpointX = (startX + endX) / 2;
      const curve = `M ${startX} ${startY} C ${midpointX - 40} ${startY}, ${midpointX + 40} ${endY}, ${endX} ${endY}`;
      relation.setAttribute("d", curve);
      halo.setAttribute("d", curve);
      const pathLength = Math.hypot(endX - startX, endY - startY) + 18;

      timeline.set(company, { x: companyStart.x, y: companyStart.y, scale: 1.08 }, 0);
      timeline.fromTo(company,
        { x: companyStart.x, y: companyStart.y, scale: 1.08 },
        { x: 0, y: 0, scale: 1, duration: 1.28, ease: "power3.inOut", immediateRender: false },
        0.8,
      );
      timeline.set(contact, { opacity: 0, scale: 0.91 }, 0);
      timeline.fromTo(contact,
        { opacity: 0, scale: 0.91 },
        { opacity: 1, scale: 1, duration: 0.72, ease: "back.out(1.25)", immediateRender: false },
        2.35,
      );
      timeline.set(relation, { strokeDasharray: pathLength, strokeDashoffset: pathLength }, 0);
      timeline.set(halo, { opacity: 0 }, 0);
      timeline.fromTo(relation,
        { strokeDashoffset: pathLength },
        { strokeDashoffset: 0, duration: 0.9, ease: "power2.out", immediateRender: false },
        2.2,
      );
      timeline.to(halo, { opacity: 1, duration: 0.5, ease: "power1.out" }, 2.42);
      timeline.set(route, { opacity: 0, y: 16 }, 0);
      timeline.fromTo(route,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", immediateRender: false },
        6.65,
      );
      timeline.fromTo(stage.querySelector("#footer-rule"),
        { scaleX: 0.68, opacity: 0.3 },
        { scaleX: 1, opacity: 1, duration: 1.2, ease: "sine.inOut", immediateRender: false },
        0.25,
      );
      timeline.fromTo(stage.querySelector("#ambient-glow"),
        { scale: 0.94, opacity: 0.54 },
        { scale: 1.05, opacity: 1, duration: 2.2, repeat: 2, yoyo: true, ease: "sine.inOut", immediateRender: false },
        0,
      );
      return;
    },
  });
}

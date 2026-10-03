import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import { applyBrandTokens, renderProductSurface } from "./assets/shared/product-components.js";
import { demoData } from "./data/demo-data.js";

const stage = document.querySelector("#product-stage");
const brandTokens = {
  colors: {
    background: "#F4F1DE",
    ink: "#264653",
    accent: "#299A8C",
    secondary: "#299A8C",
    surface: "#F9F7EE",
    muted: "#647A78",
    line: "#CAD4CA",
    supportSoft: "#DDEBE7",
    windowPage: "#F4F1DE",
    windowPanel: "#F9F7EE",
  },
  fontFamily: "JetBrains Mono",
};

function renderBody() {
  applyBrandTokens(stage, brandTokens);

  return renderProductSurface({
    id: "product-surface",
    label: "Relação ilustrativa entre APR e permissão",
    children: `
      <div class="paper-field" aria-hidden="true" data-layout-ignore></div>
      <header class="story-header" id="product-content">
        <p class="story-kicker" id="demo-badge">DEMO · reconstrução ilustrativa</p>
        <h1 class="story-title" id="message-primary">Uma permissão, ligada à APR.</h1>
        <p class="story-subtitle">Um registro vinculado. Um estado inicial legível.</p>
      </header>
      <div class="record-stage">
        <article class="record-block apr-block" id="apr-record" aria-label="Registro APR fictício">
          <p class="record-overline">REGISTRO BASE</p>
          <p class="record-kind">APR</p>
          <p class="record-id" id="apr-id">${demoData.aprId}</p>
        </article>
        <svg class="relation-svg" viewBox="0 0 1920 1080" aria-hidden="true">
          <path id="relation-path" d="M 676 694 C 840 694 1038 694 1210 694"></path>
        </svg>
        <article class="record-block permission-block" id="permission-record" aria-label="Permissão de trabalho fictícia">
          <p class="record-overline">REGISTRO VINCULADO</p>
          <p class="record-kind">Permissão de trabalho</p>
          <p class="record-id" id="permission-id">${demoData.permissionId}</p>
          <div class="status-line" id="status-line">
            <p class="status-label" id="status-label">ESTADO INICIAL</p>
            <p class="status-value" id="status-value">${demoData.initialStatus}</p>
          </div>
        </article>
        <p class="relation-label" id="relation-label">APR <span aria-hidden="true">→</span> permissão</p>
      </div>
      <footer class="story-footer">
        <p>MESMO REGISTRO · RELAÇÃO E ESTADO</p>
        <p class="footer-mark">DEMO / DADOS FICTÍCIOS</p>
      </footer>
    `,
  });
}

export async function buildComposition() {
  const { timeline } = await initializeComposition({
    stage,
    renderBody,
    buildTimeline: ({ timeline: compositionTimeline }) => {
      const path = stage.querySelector("#relation-path");
      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = `${pathLength}`;
      path.style.strokeDashoffset = `${pathLength}`;

      compositionTimeline.set(".apr-block", { opacity: 0, scale: 0 }, 0);
      compositionTimeline.set(".permission-block", { opacity: 0, scale: 0 }, 0);
      compositionTimeline.set(".relation-label", { opacity: 0, y: 12 }, 0);
      compositionTimeline.set(".status-line", { opacity: 0, y: 12 }, 0);
      compositionTimeline.to(".paper-field", { x: 12, y: -8, duration: 13.4, ease: "none" }, 0.3);

      compositionTimeline.fromTo(
        ".apr-block",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.54, ease: "power3.out", immediateRender: false },
        1.22,
      );

      compositionTimeline.fromTo(
        ".permission-block",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.56, ease: "power3.out", immediateRender: false },
        3.62,
      );
      compositionTimeline.to(path, { strokeDashoffset: 0, duration: 0.92, ease: "power2.out" }, 4.2);
      compositionTimeline.to(".relation-label", { opacity: 1, y: 0, duration: 0.38, ease: "power1.out" }, 5.22);
      compositionTimeline.to(".status-line", { opacity: 1, y: 0, duration: 0.44, ease: "power2.out" }, 6.18);
      compositionTimeline.addLabel("record-linked", 5.22);
      compositionTimeline.addLabel("initial-status-visible", 6.18);
    },
  });

  return { timeline };
}

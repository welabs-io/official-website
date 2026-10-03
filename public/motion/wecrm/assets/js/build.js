import { initializeComposition } from "../shared/composition-shell/init.js";
import {
  applyBrandTokens,
  createExclusiveSurfaceTransition,
  animateMeasuredAction,
} from "../shared/product-components.js";
import {
  measureTarget,
  placeActionMarkers,
  waitForStableAssets,
} from "../shared/measured-action.js";
import demoData from "../data/wecrm-demo.json" with { type: "json" };

const compositionId = "wecrm-people-channels";
const timelineConfig = {
  duration: 15,
  listEntry: 0.2,
  cursorApproach: 1.55,
  contact: 2.46,
  pressStart: 2.4,
  pressEnd: 2.9,
  ringProbe: 2.52,
  cursorExitStart: 2.95,
  cursorExitDuration: 0.24,
  routeSwap: 3.3,
  routeDuration: 0.65,
  detailEntry: 3.66,
  firstChannel: 4.12,
  secondChannel: 4.56,
  rest: 9.5,
};
const brandTokens = {
  fontFamily: "system-ui",
  colors: {
    background: "#050505",
    ink: "#ffffff",
    accent: "#fb4730",
    secondary: "#0e0e0e",
    surface: "#171717",
    muted: "#a0a0a0",
    line: "rgba(255, 255, 255, 0.12)",
    supportSoft: "#26110e",
    windowPage: "#050505",
    windowPanel: "#0a0a0a",
  },
};

// MARCAÇÃO DA LISTA E DO DETALHE
function renderPeopleList() {
  const [selectedPerson, ...otherPeople] = demoData.people;
  const rows = [selectedPerson, ...otherPeople]
    .map((person) => {
      const selected = person.id === selectedPerson.id;
      const content = `<span class="person-name-wrap"><span class="avatar-initials" aria-hidden="true">${person.name.split(" ").map((part) => part[0]).join("")}</span><span class="person-name">${person.name}</span></span><span class="table-value">—</span><span class="table-value">${person.createdLabel}</span>`;
      return selected
        ? `<a id="gesture-target" class="person-row person-row--target" href="#person-detail" aria-label="Abrir detalhe de ${person.name}">${content}</a>`
        : `<div class="person-row">${content}</div>`;
    })
    .join("");

  return `<section id="list-surface" class="product-screen pm-surface" aria-label="Pessoas">
    <div id="list-content" class="screen-content">
      <p class="page-kicker">Projeto DEMO</p>
      <h1 id="list-title" class="page-title">Pessoas</h1>
      <p class="page-description">Gerencie as pessoas deste projeto.</p>
      <div class="people-table" role="table" aria-label="Pessoas do projeto">
        <div class="table-head" role="row"><span>Nome</span><span>Canais</span><span>Criada em</span></div>
        <div role="rowgroup">${rows}</div>
      </div>
      <p class="list-footnote">Seleção de uma linha abre o detalhe da pessoa.</p>
    </div>
  </section>`;
}

function renderPersonDetail() {
  const person = demoData.people[0];
  const [primaryChannel, secondaryChannel] = person.channels;
  return `<section id="detail-surface" class="product-screen pm-surface" aria-label="Detalhe da pessoa">
    <div id="detail-content" class="screen-content">
      <div class="detail-header">
        <div class="detail-identity">
          <span class="avatar-initials detail-avatar" aria-hidden="true">LN</span>
          <div>
            <p class="page-kicker">Pessoas · detalhe</p>
            <h1 id="person-title" class="detail-name">${person.name}</h1>
            <p class="detail-meta">Cadastro sintético · ${person.createdLabel}</p>
          </div>
        </div>
      </div>
      <section class="info-section" aria-label="Canais associados">
        <h2 class="info-heading">Canais</h2>
        <div class="channel-list">
          <div id="primary-channel" class="channel-row">
            <span class="channel-symbol" aria-hidden="true">W</span>
            <div>
              <p class="channel-identifier">${primaryChannel.identifier}</p>
              <p class="channel-type">${primaryChannel.type}</p>
            </div>
            <span id="channel-status" class="channel-status"><span class="status-dot" aria-hidden="true"></span>${primaryChannel.status}</span>
          </div>
          <div id="secondary-channel" class="channel-row">
            <span class="channel-symbol" aria-hidden="true">@</span>
            <div>
              <p class="channel-identifier">${secondaryChannel.identifier}</p>
              <p class="channel-type">${secondaryChannel.type}</p>
            </div>
            <span class="channel-status"><span class="status-dot" aria-hidden="true"></span>${secondaryChannel.status}</span>
          </div>
        </div>
      </section>
      <p class="detail-footnote">Demonstração ilustrativa · dados sintéticos</p>
    </div>
  </section>`;
}

// MONTAGEM DO PALCO DO PRODUTO
function renderProductBody() {
  return `<header class="app-topbar">
      <div class="brand-lockup"><span class="brand-mark" aria-hidden="true"></span><span id="brand-name">WeCRM</span></div>
      <span class="demo-chip">DEMO · dados sintéticos</span>
    </header>
    ${renderPeopleList()}
    ${renderPersonDetail()}
    <div class="product-action-plane" aria-hidden="true">
      <div id="click-origin" class="product-click-origin"><span id="focus-ring" class="product-focus-ring"></span></div>
      <div id="cursor-origin" class="product-cursor-origin"><svg class="product-cursor-glyph" viewBox="0 0 42 54" aria-hidden="true"><path d="M2 2 L2 40 L12 30 L20 50 L29 46 L21 27 L38 27 Z" fill="#fff" stroke="#111" stroke-width="3" stroke-linejoin="round" /></svg></div>
    </div>`;
}

// CONSTRUÇÃO DA TIMELINE DA JORNADA
export async function buildComposition() {
  const stage = document.querySelector("#product-stage");
  const completed = await initializeComposition({
    stage,
    renderBody: renderProductBody,
    buildTimeline: ({ timeline, stage: productStage }) => {
      applyBrandTokens(productStage, brandTokens);
      const listSurface = productStage.querySelector("#list-surface");
      const detailSurface = productStage.querySelector("#detail-surface");
      const listContent = productStage.querySelector("#list-content");
      const detailContent = productStage.querySelector("#detail-content");
      const target = measureTarget(productStage, "#gesture-target");
      const cursor = productStage.querySelector("#cursor-origin");
      const focusContainer = productStage.querySelector("#click-origin");
      const focusGlyph = productStage.querySelector("#focus-ring");
      const startCenter = {
        x: target.center.x - 220,
        y: target.center.y + 140,
      };

      placeActionMarkers(cursor, focusContainer, target.center);
      timeline.set(listSurface, { autoAlpha: 1 }, 0);
      timeline.set(detailSurface, { autoAlpha: 0 }, 0);
      timeline.set(cursor, {
        left: startCenter.x,
        top: startCenter.y,
        autoAlpha: 0,
      }, 0);
      timeline.fromTo(listContent, { opacity: 0 }, {
        opacity: 1,
        duration: 0.42,
        ease: "power2.out",
      }, timelineConfig.listEntry);

      const action = {
        id: "open-person-detail",
        approachStart: timelineConfig.cursorApproach,
        contact: timelineConfig.contact,
        press: {
          start: timelineConfig.pressStart,
          holdDuration: 0.18,
          releaseDuration: 0.26,
          riseDuration: 0.1,
          feedbackDuration: 0.08,
        },
        pressure: {
          opacity: 0.94,
          ringScale: 0.86,
          releaseScale: 1.1,
          targetScale: 0.975,
        },
      };
      animateMeasuredAction({
        timeline,
        cursor,
        focusContainer,
        focusGlyph,
        target: target.target,
        startCenter,
        targetCenter: target.center,
        action,
      });
      timeline.to(cursor, {
        left: target.center.x + 180,
        top: target.center.y + 160,
        autoAlpha: 0,
        duration: timelineConfig.cursorExitDuration,
        ease: "power1.in",
      }, timelineConfig.cursorExitStart);

      createExclusiveSurfaceTransition({
        timeline,
        from: listSurface,
        to: detailSurface,
        start: timelineConfig.routeSwap,
        duration: timelineConfig.routeDuration,
      });
      timeline.fromTo(detailContent, {
        opacity: 0,
        x: 28,
      }, {
        opacity: 1,
        x: 0,
        duration: 0.52,
        ease: "power3.out",
      }, timelineConfig.detailEntry);
      timeline.fromTo(productStage.querySelector("#primary-channel"), {
        opacity: 0,
        y: 18,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.42,
        ease: "power2.out",
      }, timelineConfig.firstChannel);
      timeline.fromTo(productStage.querySelector("#secondary-channel"), {
        opacity: 0,
        y: 18,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.42,
        ease: "power3.out",
      }, timelineConfig.secondChannel);
    },
  });

  await waitForStableAssets(stage);
  return { timeline: completed.timeline };
}

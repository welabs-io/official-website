import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import {
  applyBrandTokens,
  renderProductButton,
  renderProductHeader,
  renderProductSurface,
} from "./assets/shared/product-components.js";
import {
  measureTarget,
  placeActionMarkers,
} from "./assets/shared/measured-action.js";
import { contentData } from "./data/content-data.js";
import { measuredActions } from "./data/measured-actions.js";
import brandTokens from "./data/brand-tokens.json" with { type: "json" };

const compositionId = "licenciamento-request-documents-demo";
const stage = document.querySelector("#product-stage");
const escapeMarkup = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

function renderRequestSurface() {
  const body = [
    '<div class="licensing-ui">',
    '<div id="folio-orbit" class="folio-orbit" aria-hidden="true"></div>',
    '<header class="licensing-topbar">',
    renderProductHeader({
      label: "IMA · CONTEXTO INSTITUCIONAL",
      status: "DEMO · RECONSTRUÇÃO ILUSTRATIVA",
    }),
    "</header>",
    '<div class="licensing-heading">',
    '<p class="licensing-eyebrow">LICENCIAMENTO AMBIENTAL · WEGO</p>',
    '<h1 id="stage-title">Acompanhe o requerimento</h1>',
    "</div>",
    '<div class="licensing-layout">',
    '<section class="request-record" aria-label="Registro do requerimento demonstrativo">',
    '<p class="record-kicker">REGISTRO SELECIONADO</p>',
    '<p id="record-id" class="record-id">' + escapeMarkup(contentData.requestId) + "</p>",
    '<h2 id="record-title" class="record-title">' + escapeMarkup(contentData.title) + "</h2>",
    '<div class="request-status-slot" aria-label="Estado do requerimento">',
    '<span id="request-status" class="request-status">' + escapeMarkup(contentData.requestStatus) + "</span>",
    "</div>",
    '<p class="record-note">Confira os documentos ligados a esta referência.</p>',
    renderProductButton({
      id: "open-record",
      label: "Abrir requerimento DEMO",
    }),
    "</section>",
    '<section id="details-panel" class="details-panel" aria-label="Documentos do requerimento">',
    '<div class="details-head">',
    '<div id="detail-heading-block">',
    '<p class="detail-kicker">ACOMPANHAMENTO</p>',
    '<h2 id="detail-heading" class="detail-heading">Documentos do requerimento</h2>',
    "</div>",
    '<div class="attachment-count" id="attachment-count">',
    "<strong>" + contentData.attachmentCount + " de " + contentData.attachmentTotal + "</strong>",
    "<span>documentos anexados · DEMO</span>",
    "</div>",
    "</div>",
    '<div class="progress-track" aria-label="Progresso demonstrativo dos anexos">',
    '<span id="progress-fill" class="progress-fill"></span>',
    "</div>",
    '<div class="document-row" id="document-row">',
    '<span class="document-icon" aria-hidden="true">PDF</span>',
    '<div class="document-copy">',
    '<strong id="document-name" class="document-name">' + escapeMarkup(contentData.attachmentName) + "</strong>",
    '<span id="document-note" class="document-note">' + escapeMarkup(contentData.attachmentNote) + "</span>",
    "</div>",
    '<span id="document-status" class="document-status">' + escapeMarkup(contentData.attachmentStatus) + "</span>",
    "</div>",
    '<p class="detail-note">Documentos vinculados ao requerimento DEMO.</p>',
    "</section>",
    "</div>",
    '<div id="caption-slot" class="caption-slot"><span id="caption-copy">' + escapeMarkup(contentData.caption) + "</span></div>",
    '<div class="product-action-plane" aria-hidden="true">',
    '<div id="click-origin" class="product-click-origin"><span id="focus-ring" class="product-focus-ring"></span></div>',
    '<div id="gesture-cursor" class="product-cursor-origin">',
    '<svg class="product-cursor-glyph" viewBox="0 0 38 48" aria-hidden="true">',
    '<path d="M1 1v35l9-9 8 17 7-3-8-17h13L1 1z" fill="#fffdf7" stroke="#19352e" stroke-width="3" stroke-linejoin="round"/>',
    "</svg>",
    "</div>",
    "</div>",
    "</div>",
  ].join("");

  return renderProductSurface({
    id: "request-surface",
    label: "Acompanhamento demonstrativo do requerimento",
    children: body,
  });
}

export async function buildComposition() {
  const initialized = await initializeComposition({
    stage,
    renderBody: renderRequestSurface,
    buildTimeline: ({ timeline, stage: productStage }) => {
      applyBrandTokens(productStage, brandTokens);
      const action = measuredActions.openRequest;
      const measured = measureTarget(productStage, action.targetSelector);
      const cursor = productStage.querySelector(action.cursorSelector);
      const focusContainer = productStage.querySelector(action.ringContainerSelector);
      const focusRing = productStage.querySelector(action.ringSelector);
      const panel = productStage.querySelector("#details-panel");
      const heading = productStage.querySelector("#detail-heading-block");
      const documentRow = productStage.querySelector("#document-row");
      const progressFill = productStage.querySelector("#progress-fill");
      const cursorStart = {
        x: measured.center.x - 175,
        y: measured.center.y + 112,
      };

      placeActionMarkers(cursor, focusContainer, measured.center);
      timeline.set(cursor, {
        left: cursorStart.x,
        top: cursorStart.y,
        opacity: 0,
      }, 0);
      timeline.set(focusRing, { opacity: 0, scale: 0.62 }, 0);
      timeline.to(cursor, {
        left: measured.center.x,
        top: measured.center.y,
        opacity: 1,
        duration: action.contact - action.approachStart,
        ease: "power2.out",
      }, action.approachStart);
      timeline.to(measured.target, {
        scale: 0.985,
        duration: 0.1,
        repeat: 1,
        yoyo: true,
        ease: "power1.out",
      }, action.contact);
      timeline.set(focusRing, { opacity: 0.88, scale: 0.72 }, action.contact);
      timeline.to(focusRing, {
        scale: 1,
        duration: 0.12,
        ease: "power1.out",
      }, action.contact);
      timeline.to(focusRing, {
        opacity: 0,
        scale: 1.16,
        duration: 0.22,
        ease: "power1.out",
      }, action.pressEnd);
      timeline.to(cursor, {
        opacity: 0,
        duration: 0.18,
        ease: "none",
      }, action.pressEnd);
      timeline.fromTo(panel, {
        x: 58,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        duration: 0.76,
        ease: "power2.out",
      }, action.panelStart);
      timeline.fromTo(heading, {
        y: 14,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.46,
        ease: "power2.out",
      }, action.panelStart + 0.18);
      timeline.fromTo(documentRow, {
        y: 16,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      }, action.panelStart + 0.42);
      timeline.fromTo(progressFill, {
        scaleX: 0,
      }, {
        scaleX: contentData.attachmentCount / contentData.attachmentTotal,
        duration: 0.64,
        ease: "power1.out",
      }, action.panelStart + 0.5);
      timeline.fromTo(productStage.querySelector("#folio-orbit"), {
        scale: 0.97,
        opacity: 0.12,
      }, {
        scale: 1.04,
        opacity: 0.2,
        duration: 6.2,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      }, 0);
    },
  });

  return { timeline: initialized.timeline };
}

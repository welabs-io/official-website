import { productData } from "./data/content-data.js";
import { storyData } from "./data/timeline-data.js";
import { measureTarget, placeActionMarkers, waitForStableAssets } from "./shared/measured-action.js";
import {
  animateEntityHandoff,
  animateMeasuredAction,
  applyBrandTokens,
  createExclusiveSurfaceTransition,
  renderProductButton,
  renderProductCard,
  renderProductHeader,
  renderProductSurface,
} from "./shared/product-components.js";

const compositionId = "docgo-folder-to-blank-editor";
const stage = document.querySelector("#product-stage");
const surfaceMount = document.querySelector("#surface-mount");
const brandTokens = await fetch("./assets/brand-tokens.json").then((response) => {
  if (!response.ok) throw new Error(`Brand token request failed: ${response.status}`);
  return response.json();
});

function renderDocGoDocumentCard({ entityId, id }) {
  if (entityId !== productData.document.id) throw new Error(`Unsupported DocGo entity: ${entityId}`);
  const documentIcon = `<svg class="docgo-document-icon" viewBox="0 0 28 38" aria-hidden="true"><path d="M4 1h13l7 7v28H4zM17 1v8h7M8 16h12M8 22h12M8 28h9" /></svg>`;
  return renderProductCard({
    id,
    entityId,
    title: productData.document.label,
    metadata: {
      location: productData.document.type,
      type: productData.document.choice,
    },
    artwork: documentIcon,
  })
    .replace("building-card", "building-card docgo-document-card")
    .replace("data-building-entity", "data-entity-id");
}

function renderFolderSurface() {
  return renderProductSurface({
    id: "folder-screen",
    label: productData.folder.label,
    children: `<aside class="sidebar"><p class="sidebar__label">DOCUMENTOS</p><div class="sidebar__folder sidebar__folder--active"><span class="folder-icon" aria-hidden="true"></span><span>${productData.folder.label}</span></div></aside>
      <div class="folder-workspace"><div class="folder-workspace__eyebrow">PASTAS</div><div class="folder-heading"><div class="folder-heading__title"><span class="folder-icon folder-icon--large" aria-hidden="true"></span><h1>${productData.folder.label}</h1></div>${renderProductButton({ id: "new-document-button", label: "Novo Documento" })}</div><div class="folder-workspace__rule"></div><div class="folder-workspace__open-space" aria-hidden="true"><span class="open-space__line"></span><span class="open-space__line open-space__line--short"></span></div></div>`,
  }).replace('id="folder-screen"', `id="folder-screen" data-folder-id="${productData.folder.id}"`);
}

function renderDialogSurface() {
  return renderProductSurface({
    id: "dialog-screen",
    label: "Novo Documento",
    children: `<div class="dialog-backdrop"></div><section class="creation-dialog" aria-labelledby="dialog-title"><header class="creation-dialog__header"><div><p class="dialog-kicker">${productData.folder.label}</p><h1 id="dialog-title">Novo Documento</h1></div><span class="dialog-close" aria-hidden="true">×</span></header><div class="creation-dialog__body"><label class="field-label" for="demo-type">Tipo de documento</label><div id="demo-type" class="type-field"><span>${productData.document.type}</span><span class="type-field__chevron" aria-hidden="true">⌄</span></div><p class="field-label choice-label">Escolha como começar</p><button id="blank-choice" class="blank-choice" type="button" aria-pressed="false"><span class="blank-choice__icon" aria-hidden="true"><span></span></span><span class="blank-choice__copy"><strong>${productData.document.choice}</strong><small>Folha vazia</small></span><span id="blank-choice-check" class="blank-choice__check" aria-hidden="true">✓</span></button><div class="creation-result" id="creation-result" aria-hidden="true"><span class="creation-result__label">RASCUNHO DEMO</span><div id="document-demo-card" class="document-card-anchor">${renderDocGoDocumentCard({ id: "document-demo-card-item", entityId: productData.document.id })}</div></div></div><footer class="creation-dialog__footer"><span class="dialog-note">Tipo DEMO · Em Branco</span>${renderProductButton({ id: "continue-button", label: "Continuar" })}</footer></section>`,
  }).replace('id="dialog-screen"', `id="dialog-screen" data-folder-id="${productData.folder.id}"`);
}

function renderEditorSurface() {
  return renderProductSurface({
    id: "editor-screen",
    label: "Editor de documento em branco",
    children: `<header class="editor-toolbar"><div class="editor-toolbar__left"><span class="editor-toolbar__document" aria-hidden="true"></span><span>${productData.document.label}</span><span class="editor-toolbar__state">DEMO</span></div></header><div class="editor-workspace"><div class="editor-ruler" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div><div class="editor-sheet" id="editor-document" data-entity-id="${productData.document.id}" aria-label="Folha em branco"></div></div>`,
  }).replace('id="editor-screen"', `id="editor-screen" data-folder-id="${productData.folder.id}"`);
}

document.querySelector(".product-frame__header").outerHTML = renderProductHeader({
  label: `${productData.productName} · Módulo ${productData.parentProduct}`,
  status: "DEMO · reconstrução ilustrativa",
}).replace('class="pm-header app-topline"', 'class="pm-header app-topline product-frame__header"');
surfaceMount.innerHTML = `${renderFolderSurface()}${renderDialogSurface()}${renderEditorSurface()}`;
document.querySelector("#continue-button").classList.add("product-button--primary");

const context = document.querySelector(".editorial-context");
context.textContent = productData.copy.context;
document.querySelector(".editorial-disclaimer").textContent = productData.copy.disclaimer;
applyBrandTokens(stage, brandTokens);
await waitForStableAssets(stage);

const gsap = window.gsap;
const timeline = gsap.timeline({ paused: true });
const screens = new Map(["folder-screen", "dialog-screen", "editor-screen"].map((id) => [id, stage.querySelector(`#${id}`)]));
const cursor = stage.querySelector("#cursor-origin");
const focusContainer = stage.querySelector("#click-origin");
const focusGlyph = stage.querySelector("#focus-ring");
const flight = stage.querySelector("#entity-flight");
const blankCheck = stage.querySelector("#blank-choice-check");
const result = stage.querySelector("#creation-result");
const sourceEntity = stage.querySelector("#document-demo-card-item");
const destinationEntity = stage.querySelector("#editor-document");

gsap.set([...screens.values()], { autoAlpha: 0 });
gsap.set(screens.get("folder-screen"), { autoAlpha: 1 });
gsap.set([cursor, focusContainer, flight, blankCheck, result, destinationEntity], { autoAlpha: 0 });
flight.innerHTML = sourceEntity.outerHTML;
flight.firstElementChild.removeAttribute("id");
flight.firstElementChild.classList.add("product-entity-flight-card");

const measuredActions = [];
const cursorStart = { x: 1740, y: 980 };
for (const action of storyData.actions) {
  const measured = measureTarget(stage, action.target);
  const markers = placeActionMarkers(cursor, focusContainer, measured.center);
  measuredActions.push({
    id: action.id,
    targetSelector: action.target,
    targetBox: measured.targetBox,
    targetCenter: measured.center,
    cursorTip: markers.cursorTip,
    ringCenter: markers.focusCenter,
    cursorStart,
    contact: action.contact,
    press: action.press,
  });
  if (measuredActions.length === 1) timeline.set(cursor, { left: cursorStart.x, top: cursorStart.y, autoAlpha: 0 }, 0);
  animateMeasuredAction({
    timeline,
    cursor,
    focusContainer,
    focusGlyph,
    target: measured.target,
    startCenter: cursorStart,
    targetCenter: measured.center,
    action,
  });
  timeline.to(cursor, { autoAlpha: 0, duration: 0.1 }, action.rest - 0.1);
}

const blankAction = storyData.actions[1];
timeline.addLabel("open-folder", 0);
timeline.addLabel("choose-blank", 4.5);
timeline.addLabel("handoff-to-editor", storyData.transitions.documentHandoff.start);
timeline.to(blankCheck, { autoAlpha: 1, scale: 1, duration: 0.16, ease: "power1.out" }, blankAction.contact + 0.13);
timeline.to(result, { autoAlpha: 1, duration: 0.18, ease: "power1.out" }, storyData.entityRevealTime);
timeline.to(document.querySelector(".editorial-disclaimer"), { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, storyData.proofTimes.ending - 1.2);
createExclusiveSurfaceTransition({
  timeline,
  from: screens.get("folder-screen"),
  to: screens.get("dialog-screen"),
  ...storyData.transitions.folderToDialog,
});
createExclusiveSurfaceTransition({
  timeline,
  from: screens.get("dialog-screen"),
  to: screens.get("editor-screen"),
  ...storyData.transitions.dialogToEditor,
});

const sourceBox = measureTarget(stage, "#document-demo-card-item").targetBox;
const destinationBox = measureTarget(stage, "#editor-document").targetBox;
const handoff = animateEntityHandoff({
  timeline,
  flight,
  source: sourceEntity,
  destination: destinationEntity,
  sourceBox,
  destinationBox,
  ...storyData.transitions.documentHandoff,
});
timeline.addLabel("editor-rest", storyData.proofTimes.editorRest);
timeline.addLabel("disclaimer", storyData.proofTimes.ending);

window.__docgoEvidence = {
  compositionId,
  kit: { contractId: "product-motion-kit", schemaVersion: 1, contractVersion: 2, revision: "pilot-2" },
  folderId: productData.folder.id,
  documentId: productData.document.id,
  initialSelections: { documentType: productData.document.typeInitialState, blankChoice: "unselected" },
  measuredActions,
  handoff,
};
window.__registerDocGoTimeline(timeline);

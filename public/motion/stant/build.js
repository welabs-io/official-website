import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderProductButton, renderProductCard, renderProductHeader, renderProductSurface } from "../../shared/product-components.js";
import { storyData } from "./data/story-data.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const campaignRoot = path.resolve(projectRoot, "../..");
const sharedRoot = path.join(campaignRoot, "shared");
const assetsRoot = path.join(projectRoot, "assets");
const componentPath = path.join(projectRoot, "compositions/components/browser-device-stage.html");
const tokens = JSON.parse(await readFile(path.join(projectRoot, "data/brand-tokens.json"), "utf8"));

function escapeMarkup(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function entityCard({ id, state, description }) {
  const artwork = `<svg viewBox="0 0 96 96" role="img" aria-label="Ícone DEMO de ficha de inspeção"><rect x="8" y="8" width="80" height="80" rx="18" fill="${tokens.colors.supportSoft}"/><path d="M32 31h34M32 47h34M32 63h22" stroke="${tokens.colors.accent}" stroke-width="6" stroke-linecap="round"/><path d="m21 30 4 4 8-9m-12 22 4 4 8-9m-12 22 4 4 8-9" fill="none" stroke="${tokens.colors.success}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  let card = renderProductCard({
    title: "Inspeção de alvenaria",
    entityId: storyData.entityId,
    metadata: { location: "Visita DEMO", type: description, summary: "" },
    artwork,
  });
  if (id === "activity-before") {
    card = card.replace('<span class="building-card__action" aria-hidden="true">›</span>', '<button id="activity-before-control" class="building-card__action" type="button" aria-label="Abrir ficha DEMO">›</button>');
  }
  return `<div id="${escapeMarkup(id)}" class="stant-entity" data-entity-id="${escapeMarkup(storyData.entityId)}" data-state="${escapeMarkup(state)}">${card}<span class="stant-entity__state">${escapeMarkup(state)}</span></div>`;
}

function pageHeader(label) {
  return renderProductHeader({ label, status: "DEMO" });
}

function surface({ id, label, title, subtitle, body, footer = "" }) {
  return renderProductSurface({
    id,
    label,
    children: `<div class="stant-page">${pageHeader(label)}<h1>${escapeMarkup(title)}</h1>${subtitle ? `<p class="stant-subtitle">${escapeMarkup(subtitle)}</p>` : ""}<div class="stant-page__body">${body}</div>${footer}</div>`,
  });
}

const visitBefore = surface({
  id: "visit-before",
  label: "Visita DEMO aberta",
  title: "Visita de inspeção",
  subtitle: "Obra DEMO · Torre A",
  body: `<div class="stant-section-heading"><span>ATIVIDADES</span><span>1 ficha</span></div>${entityCard({ id: "activity-before", state: "Em andamento", description: "Ficha vinculada" })}<p class="stant-readout">Ficha DEMO-0421 · dados fictícios</p>`,
  footer: `<nav class="stant-bottom-nav" aria-label="Navegação móvel"><span class="is-active">Visitas</span><span>Obras</span><span>Perfil</span></nav>`,
});

const inspectionOpen = surface({
  id: "inspection-open",
  label: "Ficha de inspeção DEMO",
  title: "Ficha de inspeção",
  subtitle: "Visita DEMO · Torre A",
  body: `${entityCard({ id: "activity-open", state: "Em andamento", description: "Ficha DEMO-0421" })}<div class="stant-detail-row"><span>Serviço</span><strong>Alvenaria</strong></div><div class="stant-detail-row"><span>Registro</span><strong>Dados DEMO</strong></div>${renderProductButton({ id: "finish-button", label: "Finalizar" })}`,
  footer: `<nav class="stant-bottom-nav" aria-label="Navegação móvel"><span class="is-active">Ficha</span><span>Visita</span><span>Mais</span></nav>`,
});

const finishConfirmation = surface({
  id: "finish-confirmation",
  label: "Confirmação DEMO",
  title: "Finalizar ficha",
  subtitle: "Inspeção de alvenaria · DEMO-0421",
  body: `<div class="stant-sheet-card"><div class="stant-sheet-handle" aria-hidden="true"></div><h2>Confirmar finalização</h2><p>Informe a data para encerrar esta ficha DEMO.</p><button id="date-field" class="stant-date-field" type="button"><span><small>Data de finalização</small><strong>Selecionar data</strong></span><span aria-hidden="true">▦</span></button></div>`,
});

const datePicker = surface({
  id: "date-picker",
  label: "Calendário DEMO",
  title: "Escolha uma data",
  subtitle: "Calendário demonstrativo",
  body: `<div class="stant-calendar"><div class="stant-calendar__month"><span aria-hidden="true">‹</span><strong>Outubro 2026</strong><span aria-hidden="true">›</span></div><div class="stant-calendar__grid stant-calendar__weekdays"><span>dom</span><span>seg</span><span>ter</span><span>qua</span><span>qui</span><span>sex</span><span>sáb</span></div><div class="stant-calendar__grid stant-calendar__days">${["27", "28", "29", "30", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "1", "2", "3", "4", "5", "6", "7"].map((day, index) => `<span class="${index === 4 ? "is-outside" : ""}">${day}</span>`).join("")}</div><button id="demo-date-option" class="stant-date-option" type="button"><span>01</span><span>Qui, 01 de outubro de 2026</span><span class="stant-date-option__check" aria-hidden="true">✓</span></button></div>`,
});

const finishDateSelected = surface({
  id: "finish-date-selected",
  label: "Confirmação DEMO",
  title: "Finalizar ficha",
  subtitle: "Inspeção de alvenaria · DEMO-0421",
  body: `<div class="stant-sheet-card"><div class="stant-sheet-handle" aria-hidden="true"></div><h2>Confirmar finalização</h2><p>Data escolhida para esta ficha DEMO.</p><div class="stant-date-field is-selected"><span><small>Data de finalização</small><strong>01 out. 2026</strong></span><span aria-hidden="true">✓</span></div>${renderProductButton({ id: "save-button", label: "Salvar" })}</div>`,
});

const inspectionCompleted = surface({
  id: "inspection-completed",
  label: "Ficha DEMO finalizada",
  title: "Ficha finalizada",
  subtitle: "Visita DEMO · Torre A",
  body: `<div class="stant-completion-mark" aria-hidden="true">✓</div>${entityCard({ id: "activity-done-form", state: "Finalizada", description: "Ficha DEMO-0421 · 01 out. 2026" })}`,
});

const visitAfter = surface({
  id: "visit-after",
  label: "Visita DEMO atualizada",
  title: "Visita de inspeção",
  subtitle: "Obra DEMO · Torre A",
  body: `<div class="stant-section-heading"><span>ATIVIDADES</span><span>1 ficha</span></div>${entityCard({ id: "activity-after", state: "Finalizada", description: "Ficha DEMO-0421 · 01 out. 2026" })}`,
  footer: `<nav class="stant-bottom-nav" aria-label="Navegação móvel"><span class="is-active">Visitas</span><span>Obras</span><span>Perfil</span></nav>`,
});

const screenMarkup = [visitBefore, inspectionOpen, finishConfirmation, datePicker, finishDateSelected, inspectionCompleted, visitAfter].join("");
const sharedEntry = path.join(projectRoot, "scripts/shared-kit-entry.js");
const sharedBundle = path.join(assetsRoot, "shared-kit.bundle.js");
await mkdir(path.join(assetsRoot, "shared"), { recursive: true });
await copyFile(path.join(sharedRoot, "product-motion-kit.css"), path.join(assetsRoot, "shared/product-motion-kit.css"));
execFileSync("npx", ["--offline", "--yes", "esbuild@0.25.12", sharedEntry, "--bundle", "--format=iife", `--outfile=${sharedBundle}`], { stdio: "inherit" });

const componentHtml = await readFile(componentPath, "utf8");
if (!componentHtml.includes(`data-composition-duration="${storyData.duration}"`) || !componentHtml.includes(`data-duration="${storyData.duration}"`)) {
  throw new Error("Phone primitive duration and story data are out of sync.");
}

const actionSelectors = storyData.actions.map((action) => action.target).join(", ");
const actionTimes = storyData.actions.map((action) => action.contact).join(", ");
const pageCss = `
@font-face{font-family:"Inter var";src:url("./assets/fonts/Inter-roman.var.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}
@font-face{font-family:"Inter var";src:url("./assets/fonts/Inter-italic.var.woff2") format("woff2");font-style:italic;font-weight:100 900;font-display:swap}
html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:"Inter var",sans-serif;background:#e9eef3}
[data-composition-id="stant-visit-finish"]{position:relative;width:100%;height:100%;overflow:hidden}
.product-stage{--brand-background:${tokens.colors.background};--brand-ink:${tokens.colors.ink};--brand-accent:${tokens.colors.accent};--brand-secondary:${tokens.colors.secondary};--brand-surface:${tokens.colors.surface};--brand-muted:${tokens.colors.muted};--brand-line:${tokens.colors.line};--brand-support-soft:${tokens.colors.supportSoft};--brand-window-page:${tokens.colors.windowPage};--brand-window-panel:${tokens.colors.windowPanel};--brand-font:"Inter var",sans-serif;--bg:#eef2f6;--fg:${tokens.colors.ink};--surface:#ffffff;--border:#cbd5e1;--accent:${tokens.colors.accent};--accent-2:${tokens.colors.secondary};--brand:${tokens.colors.success};position:relative;width:100%;height:100%;overflow:hidden;background:radial-gradient(ellipse at 53% 46%,#fff 0%,#eef2f6 62%,#e4ebf2 100%);color:${tokens.colors.ink};font-family:"Inter var",sans-serif}
.stage-copy{position:absolute;left:8.5%;top:35%;width:30%;z-index:1}
.stage-copy__eyebrow{margin:0 0 22px;color:${tokens.colors.accent};font-size:26px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.stage-copy h1{max-width:560px;margin:0;font-size:58px;line-height:1.08;font-weight:700;letter-spacing:-.035em}
.stage-copy__sub{max-width:520px;margin:24px 0 0;font-size:30px;line-height:1.35;color:#405a74}
.stage-copy__notice{display:inline-flex;margin-top:34px;padding:13px 18px;border:1px solid #cbd8e5;border-radius:999px;background:#fff;color:#3a536e;font-size:24px;font-weight:600}
.stant-ui{position:relative;width:100%;height:100%;overflow:hidden;background:#f3f4f6;color:#002a53;font-family:"Inter var",sans-serif;font-size:24px}
.stant-ui .product-screen{background:#f3f4f6;overflow:hidden}
.stant-page{position:absolute;inset:0;display:flex;flex-direction:column;padding:100px 30px 24px;gap:20px;background:#f3f4f6}
.stant-brand-row{position:absolute;z-index:2;left:30px;right:30px;top:42px;display:flex;align-items:center;justify-content:space-between;gap:12px;height:36px}
.stant-brand-row img{display:block;width:112px;height:auto}
.stant-brand-row span{font-size:15px;font-weight:750;letter-spacing:.055em;color:#506780;white-space:nowrap}
.stant-ui .pm-header{min-height:44px;padding:0 0 14px;border-bottom:1px solid #d8dee7;font-size:24px;font-weight:650;color:#002a53}
.stant-ui .demo-chip{display:inline-flex;align-items:center;min-height:32px;padding:4px 12px;border-radius:999px;background:#eaf1f8;color:#003b75;font-size:24px;font-weight:750;letter-spacing:.04em}
.stant-page h1{margin:8px 0 0;font-size:32px;line-height:1.12;font-weight:720;letter-spacing:-.025em;color:#002a53}
.stant-subtitle{margin:-12px 0 0;font-size:24px;line-height:1.3;color:#526475}
.stant-page__body{display:flex;flex:1;min-height:0;flex-direction:column;gap:18px}
.stant-section-heading{display:flex;align-items:center;justify-content:space-between;color:#526475;font-size:24px;font-weight:750;letter-spacing:.06em}
.stant-entity{position:relative;display:block}
.stant-ui .pm-card{grid-template-columns:66px minmax(0,1fr) 44px;gap:14px;min-height:144px;margin-bottom:0;padding:18px;border:1px solid #d8dee7;border-radius:18px;background:#fff;box-shadow:0 5px 16px #002a5310}
.stant-ui .building-card__art{width:66px;height:66px}
.stant-ui .building-card__art svg{display:block;width:100%;height:100%}
.stant-ui .building-card__body{min-width:0}
.stant-ui .building-card__title{margin:0 0 8px;font-size:24px;line-height:1.16;font-weight:700;color:#002a53}
.stant-ui .building-meta{margin:0;font-size:24px;line-height:1.2;color:#526475}
.stant-ui .building-card__action{display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:12px;background:#eaf1f8;color:#003b75;font-family:inherit;font-size:28px}
.stant-entity__state{display:inline-flex;align-items:center;position:static;min-height:34px;margin:8px 0 0 12px;padding:3px 10px;border-radius:999px;background:#fff2e2;color:#754400;font-size:24px;font-weight:700}
#activity-after .stant-entity__state,#activity-done-form .stant-entity__state{background:#edf5df;color:#45620d}
.stant-readout{margin:0;padding:12px 14px;border-radius:12px;background:#eaf1f8;color:#294862;font-size:24px;line-height:1.25}
.stant-reference{display:flex;flex-direction:column;gap:7px;padding:16px 18px;border-left:5px solid #003b75;border-radius:10px;background:#fff}
.stant-reference span:first-child{font-size:16px;font-weight:750;letter-spacing:.06em;color:#526475}
.stant-reference strong{font-size:22px;line-height:1.2;color:#002a53}
.stant-reference span:last-child{font-size:18px;color:#526475}
.stant-ui h2{margin:2px 0 0;font-size:23px;line-height:1.2;font-weight:700;color:#002a53}
.stant-detail-row{display:flex;align-items:center;justify-content:space-between;min-height:56px;padding:0 14px;border-bottom:1px solid #d8dee7;font-size:24px}
.stant-detail-row span{color:#526475}.stant-detail-row strong{font-weight:650;color:#002a53}
.stant-ui .pm-button{width:100%;min-height:64px;margin-top:auto;padding:12px 18px;border:0;border-radius:14px;background:#003b75;color:#fff;font-family:inherit;font-size:24px;font-weight:700;box-shadow:0 6px 14px #003b7530}
.stant-ui .pm-button{position:relative}.stant-ui .product-button__arrow{display:block;position:absolute;right:18px;font-size:28px}
.stant-bottom-nav{display:flex;justify-content:space-around;gap:16px;padding-top:12px;border-top:1px solid #d8dee7;color:#526475;font-size:18px;font-weight:650}
.stant-bottom-nav span{padding:6px 12px}.stant-bottom-nav .is-active{color:#003b75}
.stant-sheet-card{display:flex;flex:1;flex-direction:column;gap:18px;margin:34px -2px 0;padding:22px 20px;border:1px solid #d8dee7;border-radius:24px 24px 10px 10px;background:#fff;box-shadow:0 12px 30px #002a5314}
.stant-sheet-handle{align-self:center;width:58px;height:6px;border-radius:99px;background:#c4ccd5}
.stant-sheet-card p{margin:0;font-size:24px;line-height:1.2;color:#526475}
.stant-date-field{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:78px;padding:12px 14px;border:1px solid #cbd8e5;border-radius:14px;background:#f8fafc;color:#003b75;text-align:left;font-family:inherit}
.stant-date-field small{display:block;margin-bottom:5px;color:#526475;font-size:24px}.stant-date-field strong{display:block;font-size:24px;color:#002a53}.stant-date-field.is-selected{border-color:#80b027;background:#f7faef}
.stant-calendar{display:flex;flex:1;flex-direction:column;gap:18px;padding:18px;border:1px solid #d8dee7;border-radius:20px;background:#fff}
.stant-calendar__month{display:flex;align-items:center;justify-content:space-between;font-size:24px}.stant-calendar__month span{font-size:30px;color:#526475}
.stant-calendar__grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}
.stant-calendar__weekdays{color:#526475;font-size:20px;font-weight:700;letter-spacing:-.04em;text-transform:uppercase}
.stant-calendar__days span{display:grid;place-items:center;min-height:43px;border-radius:50%;font-size:24px;color:#304c68}
.stant-calendar__days .is-outside{color:#526475}
.stant-date-option{display:flex;align-items:center;gap:12px;min-height:66px;margin-top:auto;padding:8px 12px;border:2px solid #003b75;border-radius:14px;background:#eff5fa;color:#002a53;text-align:left;font-family:inherit;font-size:24px;font-weight:650}
.stant-date-option>span:first-child{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#003b75;color:#fff;font-size:22px}.stant-date-option__check{margin-left:auto;color:#45620d;font-size:22px}
.stant-completion-mark{display:grid;place-items:center;align-self:center;width:62px;height:62px;border:2px solid #80b027;border-radius:50%;background:#edf5df;color:#42600c;font-size:38px;font-weight:700}
.product-action-plane{z-index:60}.stant-touch-actor{width:0;height:0;z-index:61}.stant-touch-actor__disc{position:absolute;left:-29px;top:-29px;width:58px;height:58px;border:3px solid #fff;border-radius:50%;background:#003b75a8;box-shadow:0 0 0 4px #003b7540,0 4px 15px #002a5340}
.stant-entity-flight{position:absolute;z-index:7;pointer-events:none}.stant-entity-flight .stant-entity{width:100%}.stant-entity-flight .pm-card{grid-template-columns:66px minmax(0,1fr) 44px;gap:14px;min-height:144px;margin-bottom:0;padding:18px;border:1px solid #d8dee7;border-radius:18px;background:#fff;box-shadow:0 5px 16px #002a5310}.stant-entity-flight .building-card__art{width:66px;height:66px}.stant-entity-flight .building-card__art svg{display:block;width:100%;height:100%}.stant-entity-flight .building-card__title{margin:0 0 8px;font-size:24px;line-height:1.16;font-weight:700;color:#002a53}.stant-entity-flight .building-meta{margin:0;font-size:20px;color:#526475}.stant-entity-flight .stant-entity__state{position:static;margin:8px 0 0 12px}
.bds-clip{background:#eef2f6!important}.bds-device{border-color:#173c61!important;background:#002a53!important;box-shadow:0 22px 56px #002a5330!important}.bds-notch{background:#001b34!important}
`;

const page = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Stant · visita e ficha DEMO</title>
<link rel="stylesheet" href="./assets/shared/product-motion-kit.css" />
<style>${pageCss}</style>
</head>
<body>
<div data-composition-id="stant-visit-finish" data-width="1920" data-height="1080" data-duration="${storyData.duration}" data-fps="30">
  <div class="product-stage">
    <aside class="stage-copy" aria-label="Resumo editorial da demonstração">
      <p class="stage-copy__eyebrow">STANT · CAMPO</p>
      <h1>Da visita à ficha finalizada.</h1>
      <p class="stage-copy__sub">A mesma atividade volta à visita com o estado atualizado na demonstração.</p>
      <p class="stage-copy__notice">Reconstrução editorial · dados DEMO</p>
    </aside>
    <div id="stant-phone" data-composition-id="browser-device-stage" data-composition-src="./compositions/components/browser-device-stage.html" data-start="0" data-duration="${storyData.duration}" data-track-index="1" data-width="1920" data-height="1080" data-variable-values='{"chrome":"phone","title":"Stant · DEMO","accent":"blue","exit":"none"}'></div>
  </div>
</div>
<template data-slot="browser-device-stage-screen">
  <div class="stant-ui" data-story='${escapeMarkup(JSON.stringify(storyData))}' style="--brand-background:${tokens.colors.background};--brand-ink:${tokens.colors.ink};--brand-accent:${tokens.colors.accent};--brand-secondary:${tokens.colors.secondary};--brand-surface:${tokens.colors.surface};--brand-muted:${tokens.colors.muted};--brand-line:${tokens.colors.line};--brand-support-soft:${tokens.colors.supportSoft};--brand-window-page:${tokens.colors.windowPage};--brand-window-panel:${tokens.colors.windowPanel};--brand-font:'Inter var',sans-serif;">
    <div class="stant-brand-row"><img src="./assets/brand/stantLogo.svg" alt="Stant" /></div>
    ${screenMarkup}
    <div id="stant-entity-flight" class="product-entity-flight stant-entity-flight"></div>
    <div class="product-action-plane"><div id="stant-touch-actor" class="product-cursor-origin stant-touch-actor"><span class="stant-touch-actor__disc"></span></div><div id="stant-focus-container" class="product-click-origin"><span id="stant-focus-ring" class="product-focus-ring"></span></div></div>
  </div>
</template>
<script src="./assets/gsap.min.js"></script>
<script>
window.__timelines=window.__timelines||{};
window.__timelines["stant-visit-finish"]=gsap.timeline({paused:true}).fromTo(".stage-copy",{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.72,ease:"power2.out"},0);
</script>
<script src="./assets/shared-kit.bundle.js"></script>
</body>
</html>
`;

await writeFile(path.join(projectRoot, "index.html"), page);
console.log(JSON.stringify({ projectRoot, duration: storyData.duration, targetSelectors: actionSelectors, contacts: actionTimes, sharedModules: ["shared/product-components.js", "shared/measured-action.js", "shared/product-motion-kit.css"], bundle: "assets/shared-kit.bundle.js" }, null, 2));

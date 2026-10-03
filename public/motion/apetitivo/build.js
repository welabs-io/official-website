import { initializeComposition } from "./assets/shared/composition-shell/init.js";
import { applyBrandTokens, renderProductHeader, renderProductSurface } from "./assets/shared/product-components.js";
import { measureTarget } from "./assets/shared/measured-action.js";
import { demoContent } from "./assets/data/content-demo.js";

const compositionId = "apetitivo-historical-menu";
const stage = document.querySelector("#product-stage");
const brandTokens = {
  fontFamily: "Montserrat",
  colors: {
    background: "#f6ebdd",
    ink: "#33251e",
    accent: "#f14b22",
    secondary: "#f4b51f",
    surface: "#fffaf2",
    muted: "#69584c",
    line: "#d9c4ae",
    supportSoft: "#f8d9a5",
    windowPage: "#f6ebdd",
    windowPanel: "#fffaf2",
  },
};

function escapeMarkup(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function renderPlateMark(className = "") {
  return `<svg class="${className}" viewBox="0 0 160 160" aria-hidden="true">
    <circle cx="80" cy="80" r="66" fill="#fffaf2" stroke="#33251e" stroke-width="4" />
    <circle cx="80" cy="80" r="50" fill="none" stroke="#d9c4ae" stroke-width="3" />
    <path d="M47 90c8-18 22-30 33-30 13 0 25 12 33 30-11 12-22 18-33 18-12 0-23-6-33-18Z" fill="#f4b51f" stroke="#33251e" stroke-width="3" stroke-linejoin="round" />
    <path d="M61 84c6-7 12-11 19-11m5 15c5-6 11-9 17-9" fill="none" stroke="#f14b22" stroke-width="4" stroke-linecap="round" />
    <circle cx="67" cy="93" r="3" fill="#33251e" />
    <circle cx="97" cy="94" r="3" fill="#33251e" />
  </svg>`;
}

function renderRestaurantMark() {
  return `<span class="restaurant-mark" id="restaurant-anchor" aria-hidden="true">
    <svg viewBox="0 0 72 72">
      <path d="M18 39h36c-2 12-8 19-18 19S20 51 18 39Z" fill="#fffaf2" stroke="#33251e" stroke-width="3" stroke-linejoin="round" />
      <path d="M15 35h42M24 25c2-6 5-9 10-9m8 9c1-4 4-7 8-8" fill="none" stroke="#33251e" stroke-width="3" stroke-linecap="round" />
      <circle cx="35" cy="26" r="3" fill="#f14b22" />
    </svg>
  </span>`;
}

function renderMenuItems() {
  return demoContent.menuItems.map((item, index) => {
    const isFeatured = item.id === demoContent.featuredItemId;
    return `<article class="menu-row${isFeatured ? " is-featured" : ""}" data-entity-id="${escapeMarkup(item.id)}"${isFeatured ? ' id="featured-menu-item"' : ""}>
      <span class="menu-bullet"${isFeatured ? ' id="menu-item-anchor"' : ""}>0${index + 1}</span>
      <span class="menu-item-copy">
        <span class="menu-item-name"${isFeatured ? ' id="menu-item-name"' : ""}>${escapeMarkup(item.name)}</span>
        <span class="menu-description"${isFeatured ? ' id="menu-item-description"' : ""}>${escapeMarkup(item.description)}</span>
      </span>
    </article>`;
  }).join("");
}

function renderContent() {
  const featuredItem = demoContent.menuItems.find((item) => item.id === demoContent.featuredItemId);
  const body = `<div class="apetitivo-frame">
    <div class="apetitivo-header">${renderProductHeader({ label: demoContent.brandName, status: "DEMO" })}</div>
    <div class="archive-row"><span id="archive-label">${escapeMarkup(demoContent.archiveLabel)}</span></div>
    <div class="hero-block">
      <div class="hero-copy">
        <span class="journey-label" id="journey-label">${escapeMarkup(demoContent.journeyLabel)}</span>
        <h1 id="journey-title">${escapeMarkup(demoContent.headline)}</h1>
      </div>
    </div>
    <main class="content-journey" aria-label="Demonstração ilustrativa de restaurante e cardápio">
      <svg class="route-layer" viewBox="0 0 1920 1080" aria-hidden="true">
        <path class="route-path" id="route-to-menu"></path>
        <path class="route-path" id="route-to-item"></path>
      </svg>
      <section class="restaurant-context" id="restaurant-context" aria-label="Restaurante DEMO">
        <span class="step-label">01 · RESTAURANTES</span>
        ${renderRestaurantMark()}
        <h2 id="restaurant-name">${escapeMarkup(demoContent.restaurant.name)}</h2>
        <p id="restaurant-category">${escapeMarkup(demoContent.restaurant.category)}</p>
      </section>
      <section class="menu-panel" id="menu-panel" aria-label="Cardápio DEMO">
        <div class="menu-heading-row">
          <h2 id="menu-heading">${escapeMarkup(demoContent.menuTitle)}</h2>
          <span class="step-label">02 · ITENS</span>
        </div>
        <div class="menu-rows">${renderMenuItems()}</div>
      </section>
      <section class="item-focus" id="item-focus" aria-label="Item em foco, dados DEMO">
        <span class="focus-label">${escapeMarkup(demoContent.featuredLabel)}</span>
        <span class="focus-plate" id="focus-anchor" data-entity-id="${escapeMarkup(demoContent.featuredItemId)}">${renderPlateMark()}</span>
        <h2 id="focus-name">${escapeMarkup(featuredItem.name)}</h2>
        <p id="focus-description">${escapeMarkup(featuredItem.description)}</p>
      </section>
    </main>
    <footer class="footer-row">
      <span class="footer-label">${escapeMarkup(demoContent.brandName)}</span>
      <span class="footer-label" id="demo-label">${escapeMarkup(demoContent.demoLabel)}</span>
    </footer>
  </div>`;
  return renderProductSurface({ id: "product-surface", label: "Apetitivo · jornada ilustrativa de cardápio", children: body });
}

function setRoute(path, startSelector, endSelector, stageElement) {
  const start = measureTarget(stageElement, startSelector).center;
  const end = measureTarget(stageElement, endSelector).center;
  const startX = start.x;
  const startY = start.y;
  const endX = end.x;
  const endY = end.y;
  const curve = Math.max(56, Math.abs(endX - startX) * 0.18);
  path.setAttribute("d", `M ${startX} ${startY} C ${startX + curve} ${startY - 82}, ${endX - curve} ${endY + 82}, ${endX} ${endY}`);
  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length}`;
  return length;
}

function buildTimeline({ timeline, stage: productStage }) {
  const routeToMenu = productStage.querySelector("#route-to-menu");
  const routeToItem = productStage.querySelector("#route-to-item");
  setRoute(routeToMenu, "#restaurant-anchor", "#menu-item-anchor", productStage);
  setRoute(routeToItem, "#menu-item-anchor", "#focus-anchor", productStage);

  timeline.fromTo("#journey-title", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" }, 0.25);
  timeline.fromTo("#journey-label", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0.2);
  timeline.fromTo("#restaurant-context", { x: -26, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.45);
  timeline.fromTo("#restaurant-anchor", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: "power3.out" }, 0.72);
  timeline.to(routeToMenu, { strokeDashoffset: 0, duration: 0.86, ease: "power2.out" }, 2.38);
  timeline.fromTo("#menu-panel", { x: 32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.58, ease: "power3.out" }, 2.86);
  timeline.to(routeToItem, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, 5.62);
  timeline.fromTo("#item-focus", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.54, ease: "power3.out" }, 6.38);
  timeline.fromTo("#focus-anchor", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.62, ease: "power3.out" }, 6.58);
  timeline.fromTo("#focus-name", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48, ease: "power3.out" }, 7.0);
  timeline.fromTo("#focus-description", { opacity: 0 }, { opacity: 1, duration: 0.48, ease: "power1.out" }, 7.18);
}

export async function buildComposition() {
  applyBrandTokens(stage, brandTokens);
  return initializeComposition({ stage, renderBody: renderContent, buildTimeline });
}

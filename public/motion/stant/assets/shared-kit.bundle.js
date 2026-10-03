(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // control/portfolio/motion/portfolio-20261001/shared/product-components.js
  var product_components_exports = {};
  __export(product_components_exports, {
    animateEntityHandoff: () => animateEntityHandoff,
    animateMeasuredAction: () => animateMeasuredAction,
    applyBrandTokens: () => applyBrandTokens,
    createExclusiveSurfaceTransition: () => createExclusiveSurfaceTransition,
    renderProductButton: () => renderProductButton,
    renderProductCard: () => renderProductCard,
    renderProductHeader: () => renderProductHeader,
    renderProductSurface: () => renderProductSurface
  });
  var escapeMarkup = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
  var colorProperties = {
    background: "--brand-background",
    ink: "--brand-ink",
    accent: "--brand-accent",
    secondary: "--brand-secondary",
    surface: "--brand-surface",
    muted: "--brand-muted",
    line: "--brand-line",
    supportSoft: "--brand-support-soft",
    windowPage: "--brand-window-page",
    windowPanel: "--brand-window-panel"
  };
  function applyBrandTokens(root, tokens) {
    for (const [key, property] of Object.entries(colorProperties)) {
      root.style.setProperty(property, tokens.colors[key]);
    }
    root.style.setProperty("--brand-font", `${tokens.fontFamily}, sans-serif`);
  }
  function renderProductHeader({ label, status = "DEMO" }) {
    return `<header class="pm-header app-topline"><span class="app-topline__label">${escapeMarkup(label)}</span><span class="demo-chip">${escapeMarkup(status)}</span></header>`;
  }
  function renderProductButton({ id, label }) {
    return `<button class="pm-button product-button" id="${escapeMarkup(id)}" type="button"><span>${escapeMarkup(label)}</span><span class="product-button__arrow" aria-hidden="true">\u2192</span></button>`;
  }
  function renderProductCard({ id, entityId, title, metadata, artwork, detail = false }) {
    const summary = detail && metadata.summary ? `<p class="detail-summary">${escapeMarkup(metadata.summary)}</p>` : "";
    return `<article class="pm-card building-card${detail ? " detail-hero" : ""}"${id ? ` id="${escapeMarkup(id)}"` : ""} data-building-entity="${escapeMarkup(entityId)}">
    <div class="building-card__art">${artwork}</div>
    <div class="building-card__body">
      <h2 class="building-card__title">${escapeMarkup(title)}</h2>
      <p class="building-meta">${escapeMarkup(metadata.location)} <span aria-hidden="true">\xB7</span> ${escapeMarkup(metadata.type)}</p>
      ${summary}
    </div>
    ${detail ? "" : '<span class="building-card__action" aria-hidden="true">\u203A</span>'}
  </article>`;
  }
  function renderProductSurface({ id, label, children }) {
    return `<section class="product-screen pm-surface" id="${escapeMarkup(id)}" aria-label="${escapeMarkup(label)}"><div class="screen-content">${children}</div></section>`;
  }
  function animateMeasuredAction({ timeline, cursor, focusContainer, focusGlyph, target, startCenter, targetCenter, action }) {
    if (action.id === "open-portfolio") {
      timeline.set(cursor, { left: startCenter.x, top: startCenter.y, autoAlpha: 0 }, 0);
    }
    timeline.to(cursor, {
      left: targetCenter.x,
      top: targetCenter.y,
      autoAlpha: 1,
      duration: action.contact - action.approachStart,
      ease: "power3.out"
    }, action.approachStart);
    timeline.set(focusContainer, {
      left: targetCenter.x,
      top: targetCenter.y,
      autoAlpha: 1
    }, action.press.start);
    timeline.set(focusGlyph, {
      opacity: action.pressure.opacity,
      scale: action.pressure.ringScale
    }, action.press.start);
    timeline.to(focusGlyph, {
      scale: 1,
      duration: action.press.riseDuration,
      ease: "power1.out"
    }, action.press.start);
    timeline.to(focusGlyph, {
      opacity: 0,
      scale: action.pressure.releaseScale,
      duration: action.press.releaseDuration,
      ease: "power1.out"
    }, action.contact + action.press.holdDuration);
    timeline.to(focusContainer, {
      autoAlpha: 0,
      duration: action.press.releaseDuration,
      ease: "none"
    }, action.contact + action.press.holdDuration);
    timeline.to(target, {
      scale: action.pressure.targetScale,
      duration: action.press.feedbackDuration,
      yoyo: true,
      repeat: 1,
      transformOrigin: "50% 50%",
      ease: "power1.out"
    }, action.contact);
    return {
      contact: action.contact,
      pressStart: action.press.start,
      releaseStart: action.contact + action.press.holdDuration,
      center: targetCenter
    };
  }
  function createExclusiveSurfaceTransition({ timeline, from, to, start, duration }) {
    const midpoint = start + duration / 2;
    const end = start + duration;
    timeline.set(from, { autoAlpha: 0 }, midpoint);
    timeline.set(to, { autoAlpha: 1 }, midpoint);
    return { midpoint, end, mode: "exclusive-opaque-surface-swap" };
  }
  function animateEntityHandoff({ timeline, flight, source, destination, sourceBox, destinationBox, start, duration }) {
    const end = start + duration;
    timeline.set(flight, {
      left: sourceBox.x,
      top: sourceBox.y,
      width: sourceBox.width,
      height: sourceBox.height,
      autoAlpha: 1
    }, start);
    timeline.set(source, { autoAlpha: 0 }, start);
    timeline.to(flight, {
      left: destinationBox.x,
      top: destinationBox.y,
      width: destinationBox.width,
      height: destinationBox.height,
      duration,
      ease: "power2.inOut"
    }, start);
    timeline.set(flight, { autoAlpha: 0 }, end);
    timeline.set(destination, { autoAlpha: 1 }, end);
    return { start, end, sourceBox, destinationBox };
  }

  // control/portfolio/motion/portfolio-20261001/shared/measured-action.js
  var measured_action_exports = {};
  __export(measured_action_exports, {
    measureTarget: () => measureTarget,
    placeActionMarkers: () => placeActionMarkers,
    waitForStableAssets: () => waitForStableAssets
  });
  async function waitForStableAssets(root) {
    await document.fonts.ready;
    const images = [...root.querySelectorAll("img")];
    await Promise.all(images.map((image) => image.decode().catch(() => void 0)));
  }
  function measureTarget(stage, selector) {
    const target = stage.querySelector(selector);
    if (!target) throw new Error(`Missing measured action target: ${selector}`);
    const stageBox = stage.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    const center = {
      x: targetBox.left - stageBox.left + targetBox.width / 2,
      y: targetBox.top - stageBox.top + targetBox.height / 2
    };
    return {
      target,
      center,
      targetBox: {
        x: targetBox.left - stageBox.left,
        y: targetBox.top - stageBox.top,
        width: targetBox.width,
        height: targetBox.height
      }
    };
  }
  function placeActionMarkers(cursor, focusRing, center) {
    cursor.style.left = `${center.x}px`;
    cursor.style.top = `${center.y}px`;
    focusRing.style.left = `${center.x}px`;
    focusRing.style.top = `${center.y}px`;
    return {
      cursorTip: { ...center },
      focusCenter: { ...center }
    };
  }

  // control/portfolio/motion/portfolio-20261001/products/stant/scripts/shared-kit-entry.js
  window.StantProductKit = { ...product_components_exports, ...measured_action_exports };
})();

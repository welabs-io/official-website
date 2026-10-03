/* API global intencional para colar ou importar em uma composicao HyperFrames. */
(() => {
  "use strict";

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);
  const easeOutCubic = (value) => 1 - (1 - value) ** 3;
  const interpolate = (from, to, progress) => from + (to - from) * progress;
  const progressBetween = (time, start, end) =>
    easeOutCubic(clamp((time - start) / (end - start), 0, 1));

  const setStyle = (element, name, value) =>
    element.style.setProperty(name, value);

  /** Renderiza um estado puro; chamar com o mesmo tempo sempre produz o mesmo quadro. */
  const renderBrowserPage = (element, time) => {
    const safeTime = Math.max(0, Number(time) || 0);
    const duration = Math.max(0.1, Number(element.dataset.fvpDuration) || 3);
    const stage = element.dataset.fvpStage ?? "transition";
    const normalizedTime = (safeTime * 3) / duration;
    const resolvedTime =
      stage === "wireframe" ? 0 : stage === "content" ? 3 : normalizedTime;
    const collapse = progressBetween(resolvedTime, 0.55, 1.3);
    const reveal = progressBetween(resolvedTime, 1.1, 1.95);

    setStyle(
      element,
      "--fvp-sidebar-width",
      `${interpolate(25, 8.5, collapse)}%`,
    );
    setStyle(
      element,
      "--fvp-sidebar-label-opacity",
      String(1 - clamp(collapse * 1.35, 0, 1)),
    );
    setStyle(element, "--fvp-content-opacity", String(reveal));
    setStyle(element, "--fvp-content-y", `${interpolate(42, 0, reveal)}px`);
    element.dataset.fvpTime = String(safeTime);
  };

  /** Cria um alvo GSAP cujo setter renderiza inclusive em seek com callbacks suprimidos. */
  const createClock = (element) => {
    let time = Number(element.dataset.fvpTime) || 0;

    return Object.defineProperty({}, "time", {
      get: () => time,
      set: (value) => {
        time = Math.max(0, Number(value) || 0);
        renderBrowserPage(element, time);
      },
    });
  };

  /** Atualiza textos, abas e paleta sem acoplar o asset a um produto. */
  const configureBrowserPage = (element, options = {}) => {
    const labels = {
      address: options.address ?? "workspace.example",
      avatar: options.avatar ?? "AP",
      title: options.title ?? "Project overview",
      heading: options.heading ?? "Working details",
      copy:
        options.copy ?? "This content is available throughout the workspace.",
      primaryField: options.primaryField ?? "Reference",
      primaryValue: options.primaryValue ?? "FY-2026",
      secondaryField: options.secondaryField ?? "Project title",
      secondaryValue: options.secondaryValue ?? "A clear content transition",
      tabs: options.tabs ?? ["Workspace · Editor", "Review · Team"],
    };

    const text = (selector, value) => {
      const target = element.querySelector(selector);
      if (target) target.textContent = value;
    };

    text("[data-fvp-address]", labels.address);
    text("[data-fvp-avatar]", labels.avatar);
    text("[data-fvp-title]", labels.title);
    text("[data-fvp-heading]", labels.heading);
    text("[data-fvp-copy]", labels.copy);
    text("[data-fvp-primary-field]", labels.primaryField);
    text("[data-fvp-primary-value]", labels.primaryValue);
    text("[data-fvp-secondary-field]", labels.secondaryField);
    text("[data-fvp-secondary-value]", labels.secondaryValue);
    element.querySelectorAll("[data-fvp-tab]").forEach((tab, index) => {
      tab.textContent = labels.tabs[index] ?? labels.tabs[0] ?? "Untitled";
      tab
        .closest(".fvp-browser__tab")
        ?.setAttribute(
          "aria-selected",
          String(index === (options.activeTab ?? 0)),
        );
    });

    const duration = Math.max(0.1, Number(options.duration) || 3);
    element.dataset.fvpDuration = String(duration);
    element.dataset.fvpStage = options.stage ?? "transition";

    const wireframe = element.querySelector(".fvp-browser__wireframe");
    if (wireframe) {
      wireframe.hidden = options.wireframe === false;
    }

    const content = element.querySelector(".fvp-browser__content");
    if (content && options.content?.type === "html") {
      content.innerHTML = options.content.html;
    }
    if (content && options.content?.type === "capture") {
      const capture = document.createElement("img");
      capture.className = "fvp-browser__capture";
      capture.src = options.content.src;
      capture.alt = options.content.alt ?? "";
      content.replaceChildren(capture);
    }

    for (const [name, value] of Object.entries(options.palette ?? {})) {
      setStyle(element, `--fvp-${name}`, value);
    }

    renderBrowserPage(element, 0);
  };

  window.FeatureVideoBrowserPage = {
    configure: configureBrowserPage,
    createClock,
    render: renderBrowserPage,
  };
})();

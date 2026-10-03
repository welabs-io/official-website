export const compositionId = "central-esg-collection-demo";

export const brandTokens = {
  fontFamily: "Inter",
  colors: {
    background: "#e9ece7",
    ink: "#20342f",
    accent: "#426f5d",
    secondary: "#9f6b45",
    surface: "#ffffff",
    muted: "#65756d",
    line: "#d9e1da",
    supportSoft: "#e4eee8",
    windowPage: "#f7f8f5",
    windowPanel: "#ffffff",
  },
};

export const contentData = {
  organization: "Grupo Report",
  collection: "Coleta DEMO",
  indicator: "Indicador DEMO 01",
  status: "Em andamento",
  demoLabel: "DEMO · reconstrução conceitual",
  fields: ["Campo de resposta DEMO", "Observação DEMO"],
};

export const action = {
  id: "open-demo-indicator",
  target: "#indicator-row",
  approachStart: 1.8,
  contact: 2.72,
  cursorStart: { x: 1530, y: 284 },
  press: {
    start: 2.64,
    holdDuration: 0.12,
    riseDuration: 0.08,
    releaseDuration: 0.16,
    feedbackDuration: 0.1,
  },
  pressure: {
    opacity: 0.9,
    ringScale: 0.68,
    releaseScale: 1.2,
    targetScale: 0.992,
  },
  transition: { start: 3.05, duration: 0.58 },
};

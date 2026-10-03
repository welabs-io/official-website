export const brandTokens = {
  fontFamily: "Arial",
  colors: {
    background: "#eaf0ef",
    ink: "#183238",
    accent: "#21836e",
    secondary: "#45646a",
    surface: "#ffffff",
    muted: "#536b68",
    line: "#d6e1df",
    supportSoft: "#e1f1eb",
    windowPage: "#f4f7f6",
    windowPanel: "#ffffff",
  },
};

export const contentData = {
  processNumber: "PI-DEMO-041",
  initialStatus: "Aprovado",
  nextStatus: "Em trânsito",
  actionLabel: "Iniciar trânsito",
  demoLabel: "DEMO · reconstrução ilustrativa",
};

export const action = {
  id: "start-transit",
  target: "#transit-button",
  approachStart: 4.05,
  contact: 4.92,
  response: 5.48,
  statusSwapTime: 5.62,
  cursorStart: { x: 1382, y: 871 },
  press: {
    start: 4.88,
    holdDuration: 0.18,
    releaseDuration: 0.24,
    riseDuration: 0.11,
    feedbackDuration: 0.09,
  },
  pressure: {
    opacity: 0.9,
    ringScale: 0.8,
    releaseScale: 1.12,
    targetScale: 0.975,
  },
};

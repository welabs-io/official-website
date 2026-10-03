export const contentData = {
  documentName: "acordo-demo.pdf",
  signerEmail: "assinante-01@exemplo.invalid",
  demoLabel: "DEMO · arquivo e dados fictícios",
};

export const brandTokens = {
  fontFamily: "Montserrat",
  colors: {
    background: "#eaf1f8",
    ink: "#253544",
    accent: "#007bff",
    secondary: "#4a4a4a",
    surface: "#ffffff",
    muted: "#607487",
    line: "#d4e0eb",
    supportSoft: "#e8f3ff",
    windowPage: "#eaf1f8",
    windowPanel: "#ffffff",
  },
};

export const action = {
  id: "continue-to-signers",
  target: "#next-button",
  cursorStart: { x: 1010, y: 886 },
  approachStart: 2.45,
  contact: 3.24,
  press: {
    start: 3.08,
    holdDuration: 0.1,
    riseDuration: 0.14,
    releaseDuration: 0.2,
    feedbackDuration: 0.14,
  },
  pressure: {
    opacity: 0.76,
    ringScale: 0.74,
    releaseScale: 1.24,
    targetScale: 0.975,
  },
  transition: { start: 4.26, duration: 0.58 },
};

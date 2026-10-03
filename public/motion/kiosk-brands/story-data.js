// DADOS DEMO DA CAMPANHA
export const brandTokens = {
  fontFamily: "Inter",
  colors: {
    background: "#14161d",
    ink: "#f2f3f7",
    accent: "#696ff0",
    secondary: "#777c8c",
    surface: "#1e2029",
    muted: "#a5a8b4",
    line: "#383b48",
    supportSoft: "#25283a",
    windowPage: "#171922",
    windowPanel: "#1d2029",
  },
};

export const contentData = {
  productName: "Kiosk Brands",
  organization: "Rede Aurora · DEMO",
  benefit: "Vantagem de demonstração",
  campaignName: "Campanha de demonstração",
  startDate: "01/11/2026",
  endDate: "30/11/2026",
  demoLabel: "DEMO · PRÉVIA",
  campaignEntityId: "campaign-demo-01",
};

export const actions = [
  {
    id: "choose-company",
    target: "#company-field",
    approachStart: 0.75,
    contact: 1.3,
    transitionTimes: [1.52, 1.8],
  },
  {
    id: "choose-company-option",
    target: "#company-option",
    approachStart: 1.64,
    contact: 2.05,
    transitionTimes: [2.25, 2.65],
  },
  {
    id: "open-benefit-options",
    target: "#benefit-field",
    approachStart: 2.8,
    contact: 3.3,
    transitionTimes: [3.65],
  },
  {
    id: "choose-benefit-option",
    target: "#benefit-option",
    approachStart: 3.65,
    contact: 4.15,
    transitionTimes: [4.35, 4.7],
  },
  {
    id: "focus-campaign-name",
    target: "#campaign-name",
    approachStart: 5.2,
    contact: 5.75,
    transitionTimes: [5.93, 7.28],
  },
];

// AÇÃO MEDIDA DA JORNADA
export const measuredActions = {
  openRequest: {
    id: "open-request",
    targetSelector: "#open-record",
    cursorSelector: "#gesture-cursor",
    cursorTipOffset: { x: 0, y: 0 },
    ringContainerSelector: "#click-origin",
    ringSelector: "#focus-ring",
    approachStart: 3.8,
    contact: 4.6,
    pressEnd: 4.72,
    ringProbe: 4.68,
    panelStart: 4.92,
    transitionTimes: [4.95, 5.25, 5.5, 5.86],
    rest: 8.2,
  },
};


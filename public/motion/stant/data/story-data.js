export const storyData = {
  contractVersion: 3,
  duration: 22,
  entityId: "DEMO-FICHA-0421",
  actions: [
    {
      id: "open-service-form",
      target: "#activity-before-control",
      cursorStart: { x: 960, y: 320 },
      approachStart: 2.62,
      contact: 3.12,
      responseEnd: 4.15,
      press: { start: 3.07, riseDuration: 0.08, holdDuration: 0.24, releaseDuration: 0.12, feedbackDuration: 0.08 },
      pressure: { ringScale: 0.9, releaseScale: 1.2, opacity: 1, targetScale: 0.985 },
      transition: { from: "#visit-before", to: "#inspection-open", start: 3.17, duration: 0.5 },
      entityHandoff: { from: "#activity-before", to: "#activity-open", start: 3.42, duration: 0.5 }
    },
    {
      id: "open-finish-confirmation",
      target: "#finish-button .product-button__arrow",
      cursorStart: { x: 960, y: 320 },
      approachStart: 6.02,
      contact: 6.5,
      responseEnd: 7.45,
      press: { start: 6.45, riseDuration: 0.08, holdDuration: 0.24, releaseDuration: 0.12, feedbackDuration: 0.08 },
      pressure: { ringScale: 0.9, releaseScale: 1.2, opacity: 1, targetScale: 0.985 },
      transition: { from: "#inspection-open", to: "#finish-confirmation", start: 6.8, duration: 0.46 }
    },
    {
      id: "open-date-picker",
      target: "#date-field > span:last-child",
      cursorStart: { x: 960, y: 320 },
      approachStart: 8.67,
      contact: 9.13,
      responseEnd: 10.0,
      press: { start: 9.08, riseDuration: 0.08, holdDuration: 0.24, releaseDuration: 0.12, feedbackDuration: 0.08 },
      pressure: { ringScale: 0.9, releaseScale: 1.2, opacity: 1, targetScale: 0.985 },
      transition: { from: "#finish-confirmation", to: "#date-picker", start: 9.42, duration: 0.46 }
    },
    {
      id: "choose-demo-date",
      target: "#demo-date-option > span:first-child",
      cursorStart: { x: 960, y: 320 },
      approachStart: 10.25,
      contact: 10.72,
      responseEnd: 11.75,
      press: { start: 10.67, riseDuration: 0.08, holdDuration: 0.24, releaseDuration: 0.12, feedbackDuration: 0.08 },
      pressure: { ringScale: 0.9, releaseScale: 1.2, opacity: 1, targetScale: 0.985 },
      transition: { from: "#date-picker", to: "#finish-date-selected", start: 11.04, duration: 0.46 }
    },
    {
      id: "save-finished-form",
      target: "#save-button .product-button__arrow",
      cursorStart: { x: 960, y: 320 },
      approachStart: 13.0,
      contact: 13.48,
      responseEnd: 14.75,
      press: { start: 13.43, riseDuration: 0.08, holdDuration: 0.24, releaseDuration: 0.12, feedbackDuration: 0.08 },
      pressure: { ringScale: 0.9, releaseScale: 1.2, opacity: 1, targetScale: 0.985 },
      transition: { from: "#finish-date-selected", to: "#inspection-completed", start: 13.82, duration: 0.5 },
      revealEntity: "#activity-done-form"
    }
  ],
  returnTransition: {
    from: "#inspection-completed",
    to: "#visit-after",
    surfaceStart: 16.5,
    start: 16.8,
    duration: 0.6,
    entityFrom: "#activity-done-form",
    entityTo: "#activity-after"
  },
  proofTimes: {
    opening: 0.5,
    openFormContact: 3.12,
    formRest: 5.4,
    finishContact: 6.5,
    datePickerRest: 10.0,
    selectedDateRest: 12.2,
    saveContact: 13.48,
    completedRest: 15.8,
    returnedVisit: 18.0,
    ending: 21.8
  }
};

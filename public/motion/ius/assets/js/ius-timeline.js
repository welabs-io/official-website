import { iusContent } from "./ius-content.js";
import { iusEntityAnchors } from "./ius-anchors.js";

// TIMELINE DA TRANSFORMAÇÃO DE ESTADO
export function buildIusTimeline({ timeline, gsap, stage }) {
  const phases = iusContent.phases.map(({ id }) => stage.querySelector(`#phase-${id}`));
  const recordStates = iusContent.phases.map(({ id }) => stage.querySelector(`#record-state-${id}`));
  const railSteps = iusContent.phases.map(({ id }) => stage.querySelector(`#rail-${id}`));
  const progress = stage.querySelector("#journey-progress");
  const record = stage.querySelector(iusEntityAnchors.examRecord);

  timeline.set(phases, { autoAlpha: 0, x: -18 }, 0);
  timeline.set(recordStates, { autoAlpha: 0, x: 12 }, 0);
  timeline.set(railSteps, { color: "#75847D" }, 0);
  timeline.set(progress, { scaleX: 0 }, 0);
  timeline.set(phases[0], { autoAlpha: 1, x: 0 }, 0);
  timeline.set(recordStates[0], { autoAlpha: 1, x: 0 }, 0);
  timeline.set(railSteps[0], { color: "#197278" }, 0);
  timeline.fromTo("#ius-title", { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: "power3.out" }, 0.15);
  timeline.fromTo(record, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out" }, 0.45);
  timeline.fromTo(".journey-rail__step", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.08, ease: "power3.out" }, 0.8);

  const transitions = [2.35, 5.25, 7.75];
  for (let index = 1; index < iusContent.phases.length; index += 1) {
    const start = transitions[index - 1];
    timeline.to(phases[index - 1], { autoAlpha: 0, x: 14, duration: 0.24, ease: "power2.in" }, start);
    timeline.fromTo(phases[index], { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.42, ease: "power3.out" }, start + 0.2);
    timeline.to(recordStates[index - 1], { autoAlpha: 0, x: -10, duration: 0.2, ease: "power2.in" }, start + 0.1);
    timeline.fromTo(recordStates[index], { autoAlpha: 0, x: 12 }, { autoAlpha: 1, x: 0, duration: 0.38, ease: "power3.out" }, start + 0.28);
    timeline.to(railSteps[index], { color: "#197278", duration: 0.3, ease: "none" }, start + 0.32);
    timeline.to(progress, { scaleX: index / (iusContent.phases.length - 1), duration: 0.65, ease: "power2.inOut" }, start + 0.2);
  }

  timeline.fromTo(".record-mark", { scale: 0.65, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.36, ease: "power3.out" }, 8.35);
}

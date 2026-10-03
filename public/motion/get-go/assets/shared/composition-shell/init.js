import { waitForStableAssets } from "../measured-action.js";

export async function initializeComposition({ stage, renderBody, buildTimeline }) {
  if (!stage || stage.id !== "product-stage") throw new Error("Missing product-stage composition root.");
  stage.innerHTML = renderBody();
  await waitForStableAssets(stage);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const timeline = window.gsap.timeline({ paused: true });
  await buildTimeline({ gsap: window.gsap, timeline, stage });
  return { timeline };
}

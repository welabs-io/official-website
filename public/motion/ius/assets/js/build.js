import { initializeComposition } from "../shared/composition-shell/init.js";
import { applyBrandTokens } from "../shared/product-components.js";
import { renderIusSurface } from "./ius-view.js";
import { buildIusTimeline } from "./ius-timeline.js";
import { iusTokens } from "./ius-tokens.js";

// MONTAGEM DA COMPOSIÇÃO IUS
export async function buildComposition() {
  const stage = document.querySelector("#product-stage");
  applyBrandTokens(stage, iusTokens);
  return initializeComposition({
    stage,
    renderBody: renderIusSurface,
    buildTimeline: async ({ timeline, gsap, stage: productStage }) => {
      buildIusTimeline({ timeline, gsap, stage: productStage });
    },
  });
}

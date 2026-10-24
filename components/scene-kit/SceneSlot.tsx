// ENCAIXE DE CENA DO KIT NO SITE
// The one way a kit scene enters a page of the site: the slot renders the scene of an id from the catalog below, and the
// scene's own frame (Scene.tsx) keeps its continuity there (it plays only on screen, pauses off screen with no timer
// running, and shows its settled frame under reduced motion and on the server). The lab reads the same catalog
// (LabStage.tsx), so a scene approved at /lab/scenes/<id> is the very one the site mounts.
// The holder marks where the drawn interface starts and ends (`data-kit` ... `data-kit-end`): its words are product
// screen, out of the word budget of the page, but still read by the copy rules (site.test.tsx, check-portfolio.mjs).
// i18n: the steps of a scene depend on its text (a phrase types in at 18 ms per character), so the catalog gives them as
// a function of the dictionary of the page, and each carousel builds its clock from the same text it draws.
import type { ComponentType } from "react";
import type { Messages } from "@/lib/i18n/types";
import type { SceneStep } from "./Scene";
import type { SceneTimeline } from "./timeline";
import type { SceneId } from "./registry";
import { domusSteps, DomusCarousel } from "./scenes/domus-carousel";
import { HOME_MESSAGE_STEPS, HomeMessageScene } from "./scenes/home-message";
import { knowlySteps, KnowlyCarousel } from "./scenes/knowly-carousel";
import { magnetoSteps, MagnetoCarousel } from "./scenes/magneto-carousel";
import { rellooSteps, RellooCarousel } from "./scenes/relloo-carousel";
import { tunerSteps, TunerCarousel } from "./scenes/tuner-carousel";

export type SceneEntry = {
  // The clock of the scene, from the dictionary of the page
  steps: (m: Messages) => readonly SceneStep[];
  Component: ComponentType<{ timeline?: SceneTimeline }>;
  // The step a simulated human take of the lab jumps to
  takeFrom: string;
};

// CATÁLOGO DAS CENAS
export const SCENES: Record<SceneId, SceneEntry> = {
  "relloo-carousel": {
    steps: (m) => rellooSteps(m.scenes.relloo),
    Component: RellooCarousel,
    takeFrom: "f2-reply",
  },
  "domus-carousel": {
    steps: (m) => domusSteps(m.scenes.domus),
    Component: DomusCarousel,
    takeFrom: "type",
  },
  "magneto-carousel": {
    steps: (m) => magnetoSteps(m.scenes.magneto),
    Component: MagnetoCarousel,
    takeFrom: "check",
  },
  "tuner-carousel": {
    steps: (m) => tunerSteps(m.scenes.tuner),
    Component: TunerCarousel,
    takeFrom: "fanout",
  },
  "knowly-carousel": {
    steps: (m) => knowlySteps(m.scenes.knowly),
    Component: KnowlyCarousel,
    // v4: the memory graph plays from frame 3 (knowly-carousel.tsx)
    takeFrom: "f3-subjects",
  },
  // Lab only (outside the i18n): its text is Portuguese and its clock does not depend on the dictionary
  "home-message": {
    steps: () => HOME_MESSAGE_STEPS,
    Component: HomeMessageScene,
    takeFrom: "tuner",
  },
};

// ENCAIXE
export function SceneSlot({
  id,
  className,
}: {
  id: SceneId;
  className?: string;
}) {
  const { Component } = SCENES[id];
  return (
    <div className={className} data-kit={id}>
      <Component />
      <span data-kit-end="" hidden />
    </div>
  );
}

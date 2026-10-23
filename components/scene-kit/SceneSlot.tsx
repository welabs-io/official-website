// ENCAIXE DE CENA DO KIT NO SITE
// The one way a kit scene enters a page of the site: the slot renders the scene of an id from the catalog below, and the
// scene's own frame (Scene.tsx) keeps its continuity there (it plays only on screen, pauses off screen with no timer
// running, and shows its settled frame under reduced motion and on the server). The lab reads the same catalog
// (LabStage.tsx), so a scene approved at /lab/scenes/<id> is the very one the site mounts.
// The holder marks where the drawn interface starts and ends (`data-kit` ... `data-kit-end`): its words are product
// screen, out of the word budget of the page, but still read by the copy rules (site.test.tsx, check-portfolio.mjs).
import type { ComponentType } from "react";
import type { SceneStep } from "./Scene";
import type { SceneTimeline } from "./timeline";
import type { SceneId } from "./registry";
import { DOMUS_CAROUSEL_STEPS, DomusCarousel } from "./scenes/domus-carousel";
import { HOME_MESSAGE_STEPS, HomeMessageScene } from "./scenes/home-message";
import {
  KNOWLY_CAROUSEL_STEPS,
  KnowlyCarousel,
} from "./scenes/knowly-carousel";
import {
  MAGNETO_CAROUSEL_STEPS,
  MagnetoCarousel,
} from "./scenes/magneto-carousel";
import {
  RELLOO_CAROUSEL_STEPS,
  RellooCarousel,
} from "./scenes/relloo-carousel";
import { TUNER_CAROUSEL_STEPS, TunerCarousel } from "./scenes/tuner-carousel";

export type SceneEntry = {
  steps: readonly SceneStep[];
  Component: ComponentType<{ timeline?: SceneTimeline }>;
  // The step a simulated human take of the lab jumps to
  takeFrom: string;
};

// CATÁLOGO DAS CENAS
export const SCENES: Record<SceneId, SceneEntry> = {
  "relloo-carousel": {
    steps: RELLOO_CAROUSEL_STEPS,
    Component: RellooCarousel,
    takeFrom: "f2-reply",
  },
  "domus-carousel": {
    steps: DOMUS_CAROUSEL_STEPS,
    Component: DomusCarousel,
    takeFrom: "type",
  },
  "magneto-carousel": {
    steps: MAGNETO_CAROUSEL_STEPS,
    Component: MagnetoCarousel,
    takeFrom: "check",
  },
  "tuner-carousel": {
    steps: TUNER_CAROUSEL_STEPS,
    Component: TunerCarousel,
    takeFrom: "fanout",
  },
  "knowly-carousel": {
    steps: KNOWLY_CAROUSEL_STEPS,
    Component: KnowlyCarousel,
    takeFrom: "answer",
  },
  "home-message": {
    steps: HOME_MESSAGE_STEPS,
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

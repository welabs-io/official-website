"use client";
// PALCO DO LAB DE CENAS
// One kit scene alone, with a toolbar that drives its clock from outside: replay from the first step, or simulate a
// human take (the same `take` a scene control calls). The lab is a workbench, so the toolbar is allowed here and only
// here (the site has no pause or replay control: scripts/check-portfolio.mjs).
import type { ComponentType } from "react";
import { Play, RefreshCw } from "lucide-react";
import { ActionButton } from "@/components/lib/ui";
import { useSceneTimeline, type SceneStep } from "./Scene";
import type { SceneTimeline } from "./timeline";
import type { SceneId } from "./registry";
import { DOMUS_MODULES_STEPS, DomusModules } from "./scenes/domus-modules";
import { HOME_MESSAGE_STEPS, HomeMessageScene } from "./scenes/home-message";
import { KNOWLY_ANSWER_STEPS, KnowlyAnswer } from "./scenes/knowly-answer";
import { MAGNETO_CAROUSEL_STEPS, MagnetoCarousel } from "./scenes/magneto-carousel";
import { RELLOO_INBOX_STEPS, RellooInbox } from "./scenes/relloo-inbox";
import { TUNER_ROUTING_STEPS, TunerRouting } from "./scenes/tuner-routing";
import k from "./lab.module.css";

type Entry = {
  steps: readonly SceneStep[];
  Component: ComponentType<{ timeline?: SceneTimeline }>;
  // The step a simulated human take jumps to
  takeFrom: string;
};

const SCENES: Record<SceneId, Entry> = {
  "relloo-inbox": {
    steps: RELLOO_INBOX_STEPS,
    Component: RellooInbox,
    takeFrom: "email",
  },
  "domus-modules": {
    steps: DOMUS_MODULES_STEPS,
    Component: DomusModules,
    takeFrom: "born",
  },
  "magneto-carousel": {
    steps: MAGNETO_CAROUSEL_STEPS,
    Component: MagnetoCarousel,
    takeFrom: "check",
  },
  "tuner-routing": {
    steps: TUNER_ROUTING_STEPS,
    Component: TunerRouting,
    takeFrom: "ring",
  },
  "knowly-answer": {
    steps: KNOWLY_ANSWER_STEPS,
    Component: KnowlyAnswer,
    takeFrom: "profile",
  },
  "home-message": {
    steps: HOME_MESSAGE_STEPS,
    Component: HomeMessageScene,
    takeFrom: "tuner",
  },
};

export function LabStage({ id }: { id: SceneId }) {
  const entry = SCENES[id];
  const timeline = useSceneTimeline(entry.steps);
  const { Component } = entry;
  return (
    <div className={k.stage}>
      <div className={k.toolbar} data-theme="welabs">
        <span className={k.name}>{id}</span>
        {/* The lib's Button with its icon (components-button--with-icon): neutral outline at md, the label beside the
            icon; the Domus glyphs, RefreshCw (its Auto Repeat) to replay and Play (its flow's start) for a take */}
        <ActionButton icon={<RefreshCw />} emphasis="outline" size="md" onClick={timeline.restart}>
          Recomeçar
        </ActionButton>
        <ActionButton
          icon={<Play />}
          emphasis="outline"
          size="md"
          data-lab="take"
          onClick={() => timeline.take(entry.takeFrom)}
        >
          Simular gesto
        </ActionButton>
      </div>
      <Component timeline={timeline} />
    </div>
  );
}

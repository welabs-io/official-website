"use client";
// PALCO DO LAB DE CENAS
// One kit scene alone, with a toolbar that drives its clock from outside: replay from the first step, or simulate a
// human take (the same `take` a scene control calls). The lab is a workbench, so the toolbar is allowed here and only
// here (the site has no pause or replay control: scripts/check-portfolio.mjs).
import type { ComponentType } from "react";
import { MousePointerClick, RotateCcw } from "lucide-react";
import { ActionButton } from "@/components/lib/ui";
import { useSceneTimeline, type SceneStep } from "./Scene";
import type { SceneTimeline } from "./timeline";
import type { SceneId } from "./registry";
import { DOMUS_MODULES_STEPS, DomusModules } from "./scenes/domus-modules";
import { MAGNETO_APPROVAL_STEPS, MagnetoApproval } from "./scenes/magneto-approval";
import { RELLOO_INBOX_STEPS, RellooInbox } from "./scenes/relloo-inbox";
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
  "magneto-approval": {
    steps: MAGNETO_APPROVAL_STEPS,
    Component: MagnetoApproval,
    takeFrom: "high",
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
        <ActionButton icon={<RotateCcw />} onClick={timeline.restart}>
          Recomeçar
        </ActionButton>
        <ActionButton
          icon={<MousePointerClick />}
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

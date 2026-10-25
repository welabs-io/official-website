"use client";
// PALCO DO LAB DE CENAS
// One kit scene alone, with a toolbar that drives its clock from outside: replay from the first step, or simulate a
// human take (the same `take` a scene control calls). The lab is a workbench, so the toolbar is allowed here and only
// here (the site has no pause or replay control: scripts/check-portfolio.mjs). The scenes come from the catalog the
// site mounts (SceneSlot.tsx), so the lab and the site show the same scene.
import { Play, RefreshCw } from "lucide-react";
import { ActionButton } from "@/components/lib/ui";
import { useMessages } from "@/lib/i18n/provider";
import { useSceneTimeline } from "./Scene";
import type { SceneId } from "./registry";
import { SCENES } from "./SceneSlot";
import k from "./lab.module.css";

export function LabStage({ id }: { id: SceneId }) {
  const entry = SCENES[id];
  // The lab is outside the i18n and in Portuguese (app/lab/layout.tsx provides pt-BR); the clock still reads the text
  const timeline = useSceneTimeline(entry.steps(useMessages()));
  const { Component } = entry;
  return (
    <div className={k.stage}>
      <div className={k.toolbar} data-theme="welabs">
        <span className={k.name}>{id}</span>
        {/* The lib's Button with its icon (components-button--with-icon): neutral outline at md, the label beside the
            icon; the Domus glyphs, RefreshCw (its Auto Repeat) to replay and Play (its flow's start) for a take */}
        <ActionButton
          icon={<RefreshCw />}
          emphasis="outline"
          size="md"
          onClick={timeline.restart}
        >
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

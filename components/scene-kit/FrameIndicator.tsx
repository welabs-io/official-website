"use client";
// INDICADOR DE QUADRO DE UM CARROSSEL
// The one frame indicator of the kit's carousels (brief-v3-carousel, 2026-10-22), drawn in the chrome bar of the
// scene (the `tools` slot of Scene.tsx): the lib's SegmentedControl at its own md size (40 px), one numbered option per
// frame, the frame on screen chosen. It is the visitor's gesture: choosing a number plays the scene from that frame's
// first step (the kit's take holds the end and gives the loop back), and a click on the chosen number plays it again.
// The frame on screen is the one whose steps hold the live step; its number is on `data-frame-indicator` for the specs
// (e2e/scene-kit-scenes.spec.ts reads the chosen radio itself).
// v4 (Stage.dc.html, 2026-10-23): with `names` each option is the name of its moment ("Passa a vez") instead of its
// number, the frames already run carry the green check, and the chosen one stays the black pill; a phone (under
// 768 px) keeps the numbers, so the four tabs fit the chrome bar. The accessible name is "Momento 2: Passa a vez".
import type { MouseEvent } from "react";
import { Check } from "lucide-react";
import { SegmentedControl } from "@/components/lib/scene";
import type { SceneApi } from "./Scene";
import f from "./frame-indicator.module.css";

export function FrameIndicator({
  scene,
  frames,
  label = "Momentos",
  option = "Momento",
  names,
}: {
  scene: SceneApi;
  // The step ids of each frame, in order (the first one is where a choice plays from)
  frames: readonly (readonly string[])[];
  // Accessible name of the group, and the word read before each number ("Momento 2")
  label?: string;
  option?: string;
  // The name of each moment, shown in place of its number from 768 px up (v4 stage tabs)
  names?: readonly string[];
}) {
  const current = Math.max(
    0,
    frames.findIndex((steps) => steps.includes(scene.id)),
  );
  const value = String(current + 1);
  const playFrom = (n: number) => scene.take(frames[n]?.[0]);
  // The lib calls onValueChange only on a change: a click on the chosen option replays its frame
  const replay = (e: MouseEvent<HTMLElement>) => {
    const item = (e.target as HTMLElement).closest('[data-slot="segmented-control-item"]');
    if (item?.getAttribute("data-state") === "active") playFrom(current);
  };
  return (
    <span
      className={f.indicator}
      data-frame-indicator={value}
      data-named={names ? "" : undefined}
      onClick={replay}
    >
      <SegmentedControl
        aria-label={label}
        value={value}
        onValueChange={(v) => playFrom(Number(v) - 1)}
        items={frames.map((_, i) => ({
          value: String(i + 1),
          label: names ? (
            // Named tab: read as "Momento 2: Passa a vez"; the number shows on a phone, the name from 768 px up
            <>
              <span className="sr-only">
                {option} {i + 1}: {names[i]}
              </span>
              <span className={f.tab} aria-hidden="true">
                {i < current ? <Check className={f.done} data-done="" /> : null}
                <span className={f.num}>{i + 1}</span>
                <span className={f.name}>{names[i]}</span>
              </span>
            </>
          ) : (
            <>
              <span className="sr-only">{option} </span>
              {i + 1}
            </>
          ),
        }))}
      />
    </span>
  );
}

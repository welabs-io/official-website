"use client";
// MODELO DE CENA DO KIT (COPIE ESTE ARQUIVO)
// Copy to components/scene-kit/scenes/<product>-<idea>.tsx, rename, write the steps and render from `scene`. Then add
// the id to registry.ts and the entry to LabStage.tsx, open /lab/scenes/<id> and approve it alone before mounting it in
// the site (one line: <MyScene />).
// What the kit does for you (never redo it here): autoplay when in view, loop with a ~1 s hold on the last step, human
// take and give-back (sequence complete or 8 s idle), no timer and no CSS animation off-screen, the last step static
// under reduced motion, the window (Card + chrome bar) with the height of the settled frame, the easing tokens.
// Rules of a scene: render ONLY from `scene` (no useState/useEffect/setTimeout of your own); every control calls
// `scene.take(stepId)`; pieces come from the lib (components/lib/ui.tsx, components/lib/scene.tsx), every button and
// field is a site primitive (ActionButton, IconButton, RowButton, TextField) with its required icon, icons from
// lucide-react; colours only from the lib's welabs role tokens (--background, --card, --foreground, --muted,
// --muted-foreground, --border, --primary, --primary-soft), never the site's cream/sand; amber (--primary) only for
// what happened or is active; no person, name, face, initial or vendor.
// Proof: copy e2e/scene-kit.spec.ts for the new id (loop + take, reduced motion, icon/text axis within 1 px).
import { Check, RotateCcw } from "lucide-react";
import { ActionButton, Badge } from "@/components/lib/ui";
import { AnimatedList } from "@/components/lib/scene";
import { Scene, type SceneStep } from "./Scene";
import type { SceneTimeline } from "./timeline";

// ROTEIRO
// One entry per beat: `hold` in ms (or `at` from the start of the loop); the last one is the settled frame. Keep each
// step at 400-1200 ms and the cycle at 6-10 s; give the last step ~0.5 s more than its transitions so it holds ~1 s.
export const TEMPLATE_STEPS: readonly SceneStep[] = [
  { id: "start", hold: 1000 },
  { id: "first", hold: 1000 },
  { id: "second", hold: 1000 },
  { id: "done", hold: 1500 },
];

const ITEMS = [
  { step: "first", text: "Primeiro efeito" },
  { step: "second", text: "Segundo efeito" },
];

export function TemplateScene({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="template"
      label="Produto: o que a cena mostra, numa frase"
      product="Produto"
      title="Tela / Área"
      steps={TEMPLATE_STEPS}
      timeline={timeline}
    >
      {(scene) => (
        <div>
          {/* A control: a human event takes over from this step */}
          <ActionButton icon={<RotateCcw />} onClick={() => scene.take("first")}>
            Repetir
          </ActionButton>
          {/* Items that arrive: keyed, filtered by the step reached */}
          <AnimatedList>
            {ITEMS.filter((item) => scene.reached(item.step)).map((item) => (
              <p key={item.step}>{item.text}</p>
            ))}
          </AnimatedList>
          {scene.reached("done") ? (
            <Badge variant="primary" appearance="soft">
              <Check size={14} aria-hidden="true" />
              Feito
            </Badge>
          ) : null}
        </div>
      )}
    </Scene>
  );
}

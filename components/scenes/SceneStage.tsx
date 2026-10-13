// PALCO DAS CENAS DA CADEIA (SERVIDOR)
// Replaces the ring of videos under the overview of the home. One tile per scene of the script
// (lib/scenes/script.ts), each a native product screen (SceneBody), in the same circular swap of positions: the centre
// plays, the previous and the next neighbours are the same scenes standing still. All server markup; SceneDriver (the only
// client piece, it renders nothing) starts the runner when the stage is on screen. Without script, or under reduced
// motion, every scene shows its settled frame. The scene is an illustration: the tile is an image with the sentence of
// the step as its name, and the screen content is hidden from assistive technology so nothing is read twice.
import { MANIFEST } from "@/lib/manifest";
import {
  SCRIPT,
  cycleSeconds,
  sceneSeconds,
  type SceneScript,
} from "@/lib/scenes/script";
import { placeOf, ringPosition } from "@/components/ring/positions";
import { SceneBody } from "./SceneBody";
import { SceneDriver } from "./SceneDriver";
import "./fx.css";
import styles from "./scene-stage.module.css";

export function SceneStage({
  id,
  label,
  tone = "light",
  scenes = SCRIPT,
}: {
  id: string;
  label: string;
  tone?: "dark" | "light";
  // The scenes the stage plays: the whole script on the home, the ones a product takes part in on its page
  scenes?: readonly SceneScript[];
}) {
  const steps = MANIFEST.chain.steps;
  const data = {
    version: 1,
    cycle: cycleSeconds(scenes),
    scenes: scenes.map((scene) => sceneSeconds(scene)),
    steps: scenes.map((scene) => scene.step),
  };
  return (
    <div
      id={id}
      className={styles.screen}
      data-tone={tone}
      role="region"
      aria-label={label}
    >
      <div className={styles.stage} data-ring="chain" data-scenes>
        {scenes.map((scene, i) => {
          const position = ringPosition(i, 0, scenes.length);
          return (
            <div
              key={scene.id}
              className={styles.tile}
              data-pos={placeOf(position)}
              data-tile={scene.id}
              role="img"
              aria-label={steps[scene.step].detail.srLabel}
              aria-hidden={position === 0 ? undefined : true}
            >
              <div className={styles.tileFrame} aria-hidden="true">
                <SceneBody scene={scene} />
              </div>
            </div>
          );
        })}
      </div>
      {/* What the runner plays, so the lazy chunk reads the DOM instead of importing the script */}
      <script
        type="application/json"
        data-scene-data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, "\\u003c"),
        }}
      />
      <SceneDriver rootId={id} />
    </div>
  );
}

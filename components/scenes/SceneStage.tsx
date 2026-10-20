// PALCO DAS CENAS NATIVAS (SERVIDOR)
// Live product screens at the opening of a product page: one tile per capability scene of the product
// (lib/scenes/capabilities.ts), with the short names of the scenes under it, the one on screen lit.
// v2.1: no carousel. Measured on 2e98392, each scene acted for under a second and the rest of the time was the ring
// turning ("só o carrossel girando, sem função"); now the scene on screen plays its action, holds the result, and the
// next one crossfades in place (scene-stage.module.css), so what moves is always the product doing something. All
// server markup;
// SceneDriver (the only client piece, it renders nothing) starts the runner when the stage is on screen. Without script,
// or under reduced motion, every scene shows its settled frame. The scene is an illustration: the tile is an image named
// by its short name, and the screen content is hidden from assistive technology so nothing is read twice.
import { PRODUCT_PAGE } from "@/lib/content";
import { capabilityScenes } from "@/lib/scenes/capabilities";
import { SWAP_SECONDS, cycleSeconds, sceneSeconds } from "@/lib/scenes/script";
import type { ProductSlug } from "@/lib/products";
import { placeOf, ringPosition } from "@/components/ring/positions";
import { CapabilityBody } from "./CapabilityBody";
import { SceneDriver } from "./SceneDriver";
import "./fx.css";
import styles from "./scene-stage.module.css";

// Seconds the settled frame of a scene stays on top of its own hold, before the next scene (or the same one again)
export const HOLD_EXTRA = 2.2;

export function CapabilityStage({
  id,
  label,
  slug,
}: {
  id: string;
  label: string;
  slug: ProductSlug;
}) {
  const scenes = capabilityScenes(slug);
  const names = PRODUCT_PAGE[slug].scenes.map((s) => s.name);
  const data = {
    version: 1,
    cycle: cycleSeconds(scenes) + HOLD_EXTRA * scenes.length,
    swap: SWAP_SECONDS,
    // v2.1: each scene holds its settled frame a while longer before the next one, so the action reads before the swap
    scenes: scenes.map((scene) => sceneSeconds(scene) + HOLD_EXTRA),
  };
  return (
    <div
      id={id}
      className={styles.screen}
      data-tone="light"
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
              aria-label={names[i]}
              aria-hidden={position === 0 ? undefined : true}
            >
              <div className={styles.tileFrame} aria-hidden="true">
                <CapabilityBody scene={scene} />
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
      {names.length > 1 && (
        <ol className={styles.names}>
          {names.map((name, i) => (
            <li key={name} data-cap={i} data-on={i === 0 ? "true" : "false"}>
              {name}
            </li>
          ))}
        </ol>
      )}
      <SceneDriver rootId={id} />
    </div>
  );
}

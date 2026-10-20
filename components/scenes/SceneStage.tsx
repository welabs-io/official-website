// PALCO DAS CENAS NATIVAS (SERVIDOR)
// Live product screens in a circular carousel at the opening of a product page: one tile per capability scene of the
// product (lib/scenes/capabilities.ts), in a circular swap of positions (the centre plays, the neighbours are the same
// scenes standing still), with the short names of the scenes under it, the one on screen lit. All server markup;
// SceneDriver (the only client piece, it renders nothing) starts the runner when the stage is on screen. Without script,
// or under reduced motion, every scene shows its settled frame. The scene is an illustration: the tile is an image named
// by its short name, and the screen content is hidden from assistive technology so nothing is read twice.
import { PRODUCT_PAGE } from "@/lib/content";
import { capabilityScenes } from "@/lib/scenes/capabilities";
import { SWAP_SECONDS, cycleSeconds, sceneSeconds } from "@/lib/scenes/script";
import type { ProductSlug } from "@/lib/products";
import { placeOf, ringPosition } from "@/components/ring/positions";
import "@/components/ring/rotation.css";
import { CapabilityBody } from "./CapabilityBody";
import { SceneDriver } from "./SceneDriver";
import "./fx.css";
import styles from "./scene-stage.module.css";

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
    cycle: cycleSeconds(scenes),
    swap: SWAP_SECONDS,
    scenes: scenes.map((scene) => sceneSeconds(scene)),
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

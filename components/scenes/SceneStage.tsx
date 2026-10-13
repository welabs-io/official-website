// PALCO DAS CENAS NATIVAS (SERVIDOR)
// Live product screens in a circular carousel. One tile per scene, in a circular swap of positions: the
// centre plays, the previous and the next neighbours are the same scenes standing still. Three stages share the markup:
// SceneStage plays the chain (lib/scenes/script.ts) under the overview of the home or of a product page; CapabilityStage
// plays the three capability scenes of a product (lib/scenes/capabilities.ts) at the opening of its page, with the names
// of the capabilities and the caption of the active one under it; ProductsStage plays one capability scene per product
// in the products section of the home and lights the card of the product on screen. All server markup; SceneDriver (the only client piece,
// it renders nothing) starts the runner when the stage is on screen. Without script, or under reduced motion, every scene
// shows its settled frame. The scene is an illustration: the tile is an image with a sentence as its name, and the
// screen content is hidden from assistive technology so nothing is read twice.
import type { ReactNode } from "react";
import { MANIFEST } from "@/lib/manifest";
import { capabilityOf, capabilityScenes } from "@/lib/scenes/capabilities";
import {
  SCRIPT,
  SWAP_SECONDS,
  cycleSeconds,
  sceneSeconds,
  type SceneScript,
  type TimedScene,
} from "@/lib/scenes/script";
import { homeProductScenes } from "@/lib/scenes/home-products";
import { productBySlug, type ProductSlug } from "@/lib/products";
import { placeOf, ringPosition } from "@/components/ring/positions";
import "@/components/ring/rotation.css";
import { CapabilityBody } from "./CapabilityBody";
import { SceneBody } from "./SceneBody";
import { SceneDriver } from "./SceneDriver";
import "./fx.css";
import styles from "./scene-stage.module.css";

type Tile = { scene: TimedScene; label: string; body: ReactNode };

// The stage itself: the tiles, the data the runner reads and the driver; `children` goes under the stage (the names and
// the caption of the capability stage)
function Stage({
  id,
  label,
  tone,
  tiles,
  steps,
  captions,
  lit,
  children,
}: {
  id: string;
  label: string;
  tone: "dark" | "light";
  tiles: readonly Tile[];
  // The step of the chain each scene plays (the overview follows it); none on a stage without an overview
  steps?: readonly number[];
  // The caption of each scene, rewritten by the runner on every swap
  captions?: readonly string[];
  // The product card each scene lights in its section (the products carousel of the home)
  lit?: readonly string[];
  children?: ReactNode;
}) {
  const scenes = tiles.map((tile) => tile.scene);
  const data = {
    version: 1,
    cycle: cycleSeconds(scenes),
    swap: SWAP_SECONDS,
    scenes: scenes.map((scene) => sceneSeconds(scene)),
    ...(steps ? { steps } : {}),
    ...(captions ? { captions } : {}),
    ...(lit ? { lit } : {}),
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
        {tiles.map((tile, i) => {
          const position = ringPosition(i, 0, tiles.length);
          return (
            <div
              key={tile.scene.id}
              className={styles.tile}
              data-pos={placeOf(position)}
              data-tile={tile.scene.id}
              role="img"
              aria-label={tile.label}
              aria-hidden={position === 0 ? undefined : true}
            >
              <div className={styles.tileFrame} aria-hidden="true">
                {tile.body}
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
      {children}
      <SceneDriver rootId={id} />
    </div>
  );
}

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
  return (
    <Stage
      id={id}
      label={label}
      tone={tone}
      steps={scenes.map((scene) => scene.step)}
      tiles={scenes.map((scene) => ({
        scene,
        label: steps[scene.step].detail.srLabel,
        body: <SceneBody scene={scene} />,
      }))}
    />
  );
}

// PALCO DAS CAPACIDADES (ABERTURA DA PÁGINA DE PRODUTO)
// The three capability scenes of the product, then the names of the three capabilities (the one on screen lit, rewritten
// by the runner as `data-on`) and the sentence of the page about it. The caption is plain text, not a live region: a
// carousel that changes by itself must not talk over the reader; each tile is named by the same sentence.
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
  const caps = scenes.map(capabilityOf);
  return (
    <Stage
      id={id}
      label={label}
      tone="light"
      captions={caps.map((cap) => cap.detail)}
      tiles={scenes.map((scene, i) => ({
        scene,
        label: `${caps[i].name}: ${caps[i].detail}`,
        body: <CapabilityBody scene={scene} />,
      }))}
    >
      <div className={styles.legend}>
        <ol className={styles.names}>
          {caps.map((cap, i) => (
            <li
              key={cap.name}
              data-cap={i}
              data-on={i === 0 ? "true" : "false"}
            >
              {cap.name}
            </li>
          ))}
        </ol>
        <p className={styles.caption} data-caption>
          {caps[0].detail}
        </p>
      </div>
    </Stage>
  );
}

// PALCO DOS PRODUTOS (HOME)
// The carousel of the products section of the home: one capability scene per product (lib/scenes/home-products.ts), the
// logo of the product in the bar of its window, in the same turn and at the same pace as the chain. The five cards under
// it are the legend: the runner lights the card of the product on screen (`lit`), and each card leads to its page.
export function ProductsStage({ id, label }: { id: string; label: string }) {
  const scenes = homeProductScenes();
  return (
    <Stage
      id={id}
      label={label}
      tone="light"
      lit={scenes.map((scene) => scene.product)}
      tiles={scenes.map((scene) => {
        const cap = capabilityOf(scene);
        return {
          scene,
          label: `${productBySlug(scene.product)!.name}, ${cap.name}: ${cap.detail}`,
          body: <CapabilityBody scene={scene} />,
        };
      })}
    />
  );
}

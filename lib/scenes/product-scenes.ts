// CENAS DE UM PRODUTO NA CADEIA
// The product page replays the native chain, narrowed to the scenes the product takes part in: the scenes it stars in
// (`products` of the script) and the ones where it is an end of the connection of the step (`connection.from` /
// `connection.to` of lib/chain.ts). Order is the plot's. A product with a single scene gets a stage of one.
import { CHAIN_STEPS } from "@/lib/chain";
import type { ProductSlug } from "@/lib/products";
import { SCRIPT, cycleSeconds, type SceneScript } from "./script";

// A stage of one or two short scenes would replay every few seconds, and the motion of each replay (swap, connector pulse,
// token) weighs too much in the cycle: measured at 64% still for a single scene of 7.1 s. The last scene of a short cycle
// holds longer, up to this many seconds in all. 6 s is the same 34% of the home's cycle (17.6 s at the 2x pace) that
// 12 s was of the previous 34 s, so a product page keeps the proportion; it is the one place where a hold goes past 1 s.
export const PRODUCT_MIN_CYCLE = 6;

export function scenesOfProduct(slug: ProductSlug): SceneScript[] {
  const own = SCRIPT.filter((scene) => {
    const { connection } = CHAIN_STEPS[scene.step];
    return (
      scene.products.includes(slug) ||
      connection.from === slug ||
      connection.to === slug
    );
  });
  const short = PRODUCT_MIN_CYCLE - cycleSeconds(own);
  if (short <= 0) return own;
  // The last scene stays longer; the others are the script's own
  return own.map((scene, i) =>
    i === own.length - 1 ? { ...scene, hold: scene.hold + short } : scene,
  );
}

// Index of the step of the first scene of the product: where its overview starts
export const firstStepOf = (slug: ProductSlug) => scenesOfProduct(slug)[0].step;

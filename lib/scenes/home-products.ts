// CENAS DOS PRODUTOS NA HOME
// The products carousel of the home plays one native scene per product, in the order of the site (Domus, Relloo,
// Magneto, Tuner, Knowly). Each is the strongest of the three capability scenes of its product page
// (lib/scenes/capabilities.ts), picked for what the product is at first sight: the money of the Domus settling itself,
// the campaign of the Relloo that brings the sale back, the flow of the Magneto running with its branch, the unified
// inbox of the Tuner and the answer of the Knowly with its sources. The clock is the scene's own script (about 5 s, a
// hold of 1.8 s, the swap of 0.7 s), so the home and the product page play the very same screen at the very same pace.
import { PRODUCTS, type ProductSlug } from "@/lib/products";
import {
  CAPABILITY_SCRIPT,
  type CapabilitySceneId,
  type CapabilityScript,
} from "./capabilities";

export const HOME_PRODUCT_SCENE: Record<ProductSlug, CapabilitySceneId> = {
  domus: "domus-cash",
  relloo: "relloo-campaign",
  magneto: "magneto-canvas",
  tuner: "tuner-site",
  knowly: "knowly-answer",
};

// The scenes of the carousel, one per product, in the order of PRODUCTS
export const homeProductScenes = (): CapabilityScript[] =>
  PRODUCTS.map(({ slug }) =>
    CAPABILITY_SCRIPT[slug].find((s) => s.id === HOME_PRODUCT_SCENE[slug])!,
  );

// Index of the capability each product's scene shows (PRODUCT_CONTENT[slug].capabilities); the card of the product marks
// it while the scene is on screen
export const HOME_SHOWN_CAPABILITY = Object.fromEntries(
  homeProductScenes().map((scene) => [scene.product, scene.cap]),
) as Record<ProductSlug, number>;

// SELETORES DO MANIFESTO
// Pure functions over a parsed manifest: which chain steps a product takes part in, and the four ties of the connector
// block (the seam of the core and the three rails) with the label of each.
import type { ChainStep, Manifest, ProductSlug } from "./types";

// Steps of the chain, in order; with `only` just the ones that show that product
export const chainSteps = (
  manifest: Manifest,
  only?: ProductSlug,
): ChainStep[] =>
  manifest.chain.steps.filter((step) => !only || step.products.includes(only));

export type Tie = {
  a: ProductSlug;
  b: ProductSlug;
  label: string;
  // The seam joins the two products of the core; a rail joins a rail product to the core
  place: "seam" | "rail";
};

const CORE: readonly ProductSlug[] = ["domus", "relloo"];
const RAILS: readonly ProductSlug[] = ["magneto", "tuner", "knowly"];

// The label of the connection between two products (the same unordered pair always carries the same one)
function labelOf(
  manifest: Manifest,
  a: ProductSlug,
  b: ProductSlug,
): string | undefined {
  return manifest.chain.steps.find(
    (s) =>
      (s.connection.from === a && s.connection.to === b) ||
      (s.connection.from === b && s.connection.to === a),
  )?.connection.label;
}

// The seam and one tie per rail product, to the core product the manifest connects it to
export function ties(manifest: Manifest): Tie[] {
  const result: Tie[] = [];
  const seam = labelOf(manifest, "domus", "relloo");
  if (seam)
    result.push({ a: "domus", b: "relloo", label: seam, place: "seam" });
  for (const rail of RAILS) {
    for (const core of CORE) {
      const label = labelOf(manifest, rail, core);
      if (label) {
        result.push({ a: rail, b: core, label, place: "rail" });
        break;
      }
    }
  }
  return result;
}

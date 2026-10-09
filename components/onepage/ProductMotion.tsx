// MOVIMENTO POR PRODUTO
// The motion of each product, shared by the home and the product pages.
import type { ProductSlug } from "@/lib/products";
import { DomusMotion } from "./DomusMotion";
import { KnowlyMotion } from "./KnowlyMotion";
import { MagnetoMotion } from "./MagnetoMotion";
import { RellooMotion } from "./RellooMotion";
import { TunerMotion } from "./TunerMotion";

export const PRODUCT_MOTION: Record<ProductSlug, () => React.JSX.Element> = {
  domus: DomusMotion,
  relloo: RellooMotion,
  magneto: MagnetoMotion,
  tuner: TunerMotion,
  knowly: KnowlyMotion,
};

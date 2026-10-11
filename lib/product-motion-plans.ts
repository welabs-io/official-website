// CONTRATO DOS ROTEIROS DE MOTION
// Motion production owns this manifest; functional capability data stays independent of its sources and clock.
import plans from "./product-motion-plans.json";
import type { ProductSlug } from "./products";

export type ProductMotionSegment = {
  pieceId: string;
  start: number;
  end: number;
  rate: number;
  holdAfter: number;
  poster: string;
};

export type ProductMotionChapter = {
  key: string;
  title: string;
  body: string;
  scenario: string;
  segments: readonly ProductMotionSegment[];
};

export type ProductMotionPlan = {
  id: string;
  title: string;
  description: string;
  chapters: readonly ProductMotionChapter[];
};

export const PRODUCT_MOTION_PLANS = plans as Record<
  ProductSlug,
  ProductMotionPlan
>;

export function getProductMotionPlan(slug: ProductSlug): ProductMotionPlan {
  return PRODUCT_MOTION_PLANS[slug];
}

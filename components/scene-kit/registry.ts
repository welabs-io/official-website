// CATÁLOGO DE CENAS DO KIT
// The ids of the kit scenes, server-safe (the lab page validates its route against it). The components live in
// LabStage.tsx, a client module, keyed by the same ids.
// The v3 carousels (brief-v3-carousel, 2026-10-22) replace the single-screen scenes, one per product
export const SCENE_IDS = ["relloo-carousel", "domus-carousel", "magneto-carousel", "tuner-carousel", "knowly-carousel", "home-message"] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export const isSceneId = (id: string): id is SceneId =>
  (SCENE_IDS as readonly string[]).includes(id);

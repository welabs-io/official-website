// CATÁLOGO DE CENAS DO KIT
// The ids of the kit scenes, server-safe (the lab page validates its route against it). The components live in
// LabStage.tsx, a client module, keyed by the same ids.
// domus-carousel replaced domus-modules (brief-v3-carousel, 2026-10-22)
export const SCENE_IDS = ["relloo-inbox", "domus-carousel", "magneto-approval", "tuner-routing", "knowly-answer", "home-message"] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export const isSceneId = (id: string): id is SceneId =>
  (SCENE_IDS as readonly string[]).includes(id);

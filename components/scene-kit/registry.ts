// CATÁLOGO DE CENAS DO KIT
// The ids of the kit scenes, server-safe (the lab page validates its route against it). The components live in
// LabStage.tsx, a client module, keyed by the same ids.
// v3 carousel (2026-10-22): tuner-carousel replaces tuner-routing
export const SCENE_IDS = ["relloo-inbox", "domus-modules", "magneto-approval", "tuner-carousel", "knowly-answer", "home-message"] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export const isSceneId = (id: string): id is SceneId =>
  (SCENE_IDS as readonly string[]).includes(id);

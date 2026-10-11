// PROJEÇÃO DO CONTEÚDO NO SITE
// Crop only the useful film area; identity openings always retain their complete native frame.
export const FILM_CROP = { x: 120, y: 180, width: 1680, height: 700 } as const;
export const NATIVE_FRAME = { width: 1920, height: 1080 } as const;
export type MotionPhase = "intro" | "film";
export type ProjectionCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function cropOf(id = ""): ProjectionCrop {
  if (id.startsWith("welabs-chain-journey"))
    return { x: 64, y: 140, width: 1792, height: 740 };
  if (id.startsWith("channels-"))
    return { x: 64, y: 180, width: 1792, height: 700 };
  if (id.startsWith("crm-")) return { x: 48, y: 150, width: 1824, height: 730 };
  if (id.startsWith("hub-")) return { x: 48, y: 170, width: 1824, height: 710 };
  if (id.startsWith("kb-")) return { x: 64, y: 140, width: 1792, height: 740 };
  return FILM_CROP;
}

export const motionPhase = (id: string): MotionPhase =>
  id.includes("intro") ? "intro" : "film";

// Keep the crop proportional inside a 16:9 tile instead of stretching the composition.
export function filmProjection(crop: ProjectionCrop = FILM_CROP) {
  const visibleHeight =
    (crop.height / crop.width) * (NATIVE_FRAME.width / NATIVE_FRAME.height);
  return {
    viewportHeight: visibleHeight * 100,
    viewportTop: ((1 - visibleHeight) / 2) * 100,
    contentWidth: (NATIVE_FRAME.width / crop.width) * 100,
    contentHeight: (NATIVE_FRAME.height / crop.height) * 100,
    contentLeft: (-crop.x / crop.width) * 100,
    contentTop: (-crop.y / crop.height) * 100,
  };
}

export function projectionVariables(id = ""): Record<string, string> {
  const projection = filmProjection(cropOf(id));
  return {
    "--crop-height": `${projection.viewportHeight}%`,
    "--crop-top": `${projection.viewportTop}%`,
    "--content-width": `${projection.contentWidth}%`,
    "--content-height": `${projection.contentHeight}%`,
    "--content-left": `${projection.contentLeft}%`,
    "--content-top": `${projection.contentTop}%`,
  };
}

// GEOMETRIA COMPARTILHADA DOS GESTOS
export async function waitForStableAssets(root) {
  await document.fonts.ready;
  const images = [...root.querySelectorAll("img")];
  await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
}

export function measureTarget(stage, selector) {
  const target = stage.querySelector(selector);
  if (!target) throw new Error(`Missing measured action target: ${selector}`);
  const stageBox = stage.getBoundingClientRect();
  const targetBox = target.getBoundingClientRect();
  const center = {
    x: targetBox.left - stageBox.left + targetBox.width / 2,
    y: targetBox.top - stageBox.top + targetBox.height / 2,
  };

  return {
    target,
    center,
    targetBox: {
      x: targetBox.left - stageBox.left,
      y: targetBox.top - stageBox.top,
      width: targetBox.width,
      height: targetBox.height,
    },
  };
}

export function placeActionMarkers(cursor, focusRing, center) {
  cursor.style.left = `${center.x}px`;
  cursor.style.top = `${center.y}px`;
  focusRing.style.left = `${center.x}px`;
  focusRing.style.top = `${center.y}px`;
  return {
    cursorTip: { ...center },
    focusCenter: { ...center },
  };
}

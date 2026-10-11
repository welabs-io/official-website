// ENQUADRAMENTO DA ESCOLHA MANUAL
// Measure the actual fixed header and pinned page navigation; automatic playback never calls this helper.
export function revealSelectedMotion(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>("[data-motion-viewport]");
  if (!viewport || typeof window.scrollTo !== "function") return;
  let occlusion = 0;
  const pinned = [...document.querySelectorAll<HTMLElement>("header, nav")]
    .filter((element) => {
      const position = getComputedStyle(element).position;
      return position === "fixed" || position === "sticky";
    })
    .map((element) => element.getBoundingClientRect())
    .sort((a, b) => a.top - b.top);
  for (const bounds of pinned)
    if (bounds.width > 0 && bounds.top <= occlusion + 1 && bounds.bottom > 0)
      occlusion = Math.max(occlusion, bounds.bottom);
  const bounds = viewport.getBoundingClientRect();
  const top = occlusion + 16;
  if (bounds.top >= top && bounds.bottom <= window.innerHeight) return;
  window.scrollTo({
    top: Math.max(0, window.scrollY + bounds.top - top),
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

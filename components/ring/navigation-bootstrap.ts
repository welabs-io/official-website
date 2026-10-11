// PRIMEIRA INTENÇÃO DE NAVEGAÇÃO
// Capture content intentions while the small controller chunk loads; media visibility never gates selection.
import type { RingController } from "./ring-run";

export function bootstrapNavigation(root: HTMLElement, request: () => void) {
  let controller: RingController | null = null;
  let queuedIndex: number | null = null;
  const count = root.querySelectorAll("[data-tile]").length;
  const selectable = root.dataset.navigation === "true" && count > 1;

  const choose = (index: number) => {
    queuedIndex = ((index % count) + count) % count;
    request();
  };
  const captureClick = (event: MouseEvent) => {
    if (controller || !(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLElement>(
      "[data-step], [data-select], [data-product]",
    );
    if (!button || !root.contains(button)) return;
    const current = queuedIndex ?? Number(root.dataset.active ?? 0);
    if (button.dataset.step) choose(current + Number(button.dataset.step));
    else if (button.dataset.select !== undefined)
      choose(Number(button.dataset.select));
    else if (button.dataset.product) {
      const index = [
        ...root.querySelectorAll<HTMLElement>("[data-product]"),
      ].findIndex(
        (selector) => selector.dataset.product === button.dataset.product,
      );
      if (index >= 0) choose(index);
    }
  };
  const captureKey = (event: KeyboardEvent) => {
    if (
      controller ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      (event.target instanceof Element &&
        event.target.closest(
          'input, textarea, select, [contenteditable="true"]',
        ))
    )
      return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    choose(
      (queuedIndex ?? Number(root.dataset.active ?? 0)) +
        (event.key === "ArrowRight" ? 1 : -1),
    );
  };
  if (selectable) {
    root.addEventListener("click", captureClick, true);
    root.addEventListener("keydown", captureKey, true);
  }
  return {
    flush: (ready: RingController) => {
      controller = ready;
      if (queuedIndex !== null) {
        ready.select(queuedIndex);
        queuedIndex = null;
      }
    },
    destroy: () => {
      root.removeEventListener("click", captureClick, true);
      root.removeEventListener("keydown", captureKey, true);
      queuedIndex = null;
      controller = null;
    },
  };
}

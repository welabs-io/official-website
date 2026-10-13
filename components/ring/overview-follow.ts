// SEGUE O ANEL: BLOCO DE CIMA DA CADEIA
// Bound by ring-run to the chain ring. The overview (components/template/ChainOverview) has no clock of its own: it
// listens to the `ring:swap` event the ring dispatches on every scene change and rewrites, in the same task, the lit
// nodes, the caption, the path of the token and the reach of the connector. Everything lives in the DOM (data
// attributes and custom properties); the server wrote the steps next to the block, so nothing is imported from the
// manifest. `follow` returns the function that puts the block back on its first step.
import { stepVars } from "@/lib/overview-geometry";
import type { OverviewData } from "@/lib/overview-data";

// Detail of the event ring-run dispatches
export type RingSwapDetail = {
  ring: string;
  from: number;
  to: number;
  index: number;
};

// `base` is the step the block rests on (0 on the home; the first step of the product on a product page)
export function follow(ringId: string, section: Element | null, base = 0) {
  const overview = section?.querySelector<HTMLElement>("[data-overview]");
  const source = overview?.querySelector(
    "script[data-overview-data]",
  )?.textContent;
  if (!overview || !source) return Object.assign(() => {}, { begin: () => {} });
  const data = JSON.parse(source) as OverviewData;
  const count = data.order.length;
  const cols = [...overview.querySelectorAll<HTMLElement>("[data-col]")];
  const legend = overview.querySelector<HTMLElement>("[data-legend]");

  // Flips an attribute between "a" and "b" (two identical keyframes with different names) so an animation restarts
  const flip = (el: HTMLElement, name: "token" | "pulse" | "swap") => {
    el.dataset[name] = el.dataset[name] === "a" ? "b" : "a";
  };

  // `label` is false when the block is only put back (stop): the caption text is written by a swap or by `begin`, never by
  // a reset
  const apply = (index: number, animate: boolean, label = true) => {
    const step = data.steps[index];
    if (!step) return;
    for (const [name, value] of Object.entries(stepVars(step, count)))
      overview.style.setProperty(name, value);
    for (const el of cols) {
      const col = Number(el.dataset.col);
      if (el.matches("i[data-col]"))
        el.dataset.on = step.nodes.includes(col) ? "true" : "false";
      else
        el.dataset.state = step.nodes.includes(col)
          ? "on"
          : col === step.from || col === step.to
            ? "touch"
            : "off";
    }
    if (legend) {
      if (label) legend.textContent = step.label;
      if (animate) flip(legend, "swap");
      else legend.dataset.swap = "idle";
    }
    if (animate) {
      flip(overview, "token");
      flip(overview, "pulse");
    } else {
      overview.dataset.token = "idle";
      overview.dataset.pulse = "idle";
    }
  };

  const onSwap = (event: Event) => {
    const detail = (event as CustomEvent<RingSwapDetail>).detail;
    if (detail?.ring === ringId) apply(detail.index, true);
  };
  window.addEventListener("ring:swap", onSwap);
  const stop = () => {
    window.removeEventListener("ring:swap", onSwap);
    apply(base, false, false);
  };
  // The first scene starts with no swap (the ring is already on it): `begin` plays its token when the playback starts
  return Object.assign(stop, { begin: () => apply(base, true) });
}

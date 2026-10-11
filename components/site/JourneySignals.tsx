"use client";

// ETAPAS DA MESMA JORNADA
// Highlight the current task without replacing the person, order or contextual anchor that connects the scenes.
import type { ReactNode } from "react";

const attachJourney = (root: HTMLDivElement | null) => {
  if (!root) return;
  const update = (event: Event) => {
    const detail = (event as CustomEvent<{ ring: string; toIndex: number }>)
      .detail;
    if (detail?.ring !== "journey-ring") return;
    root
      .querySelectorAll<HTMLElement>("[data-journey-step]")
      .forEach((step, index) => {
        step.dataset.active = String(index === detail.toIndex);
        if (index === detail.toIndex) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
    // Native task text mirrors the current source chapter without claiming a later approval state.
    root
      .querySelectorAll<HTMLElement>("[data-journey-detail]")
      .forEach((panel, index) => {
        panel.hidden = index !== detail.toIndex;
      });
  };
  window.addEventListener("ring:swap", update);
  return () => window.removeEventListener("ring:swap", update);
};

export function JourneySignals({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div ref={attachJourney} className={className}>
      {children}
    </div>
  );
}

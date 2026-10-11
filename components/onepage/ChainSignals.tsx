"use client";

// SINAIS DA CADEIA NO MAPA
// Playback events illuminate the products present in a cut without restarting the composition or rendering React state.
import type { ReactNode } from "react";

const attachSignals = (root: HTMLDivElement | null) => {
  if (!root) return;
  const paint = (products: readonly string[]) => {
    root
      .querySelectorAll<HTMLElement>("[data-chain-product]")
      .forEach((node) => {
        node.dataset.active = String(
          products.includes(node.dataset.chainProduct ?? ""),
        );
      });
  };
  const onSwap = (event: Event) => {
    const detail = (event as CustomEvent<{ ring: string; products?: string[] }>)
      .detail;
    if (detail.ring === "chain-ring" && detail.products) paint(detail.products);
  };
  paint(["tuner"]);
  window.addEventListener("ring:swap", onSwap);
  return () => window.removeEventListener("ring:swap", onSwap);
};

export function ChainSignals({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div
      ref={attachSignals}
      className={className}
      role="group"
      aria-label="Domus e Relloo no núcleo; Magneto, Tuner e Knowly nos trilhos"
    >
      {children}
    </div>
  );
}

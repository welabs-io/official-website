"use client";
// OBSERVADOR DE MOVIMENTO
// One IntersectionObserver for every CSS-only animation of the page. Elements marked `data-live` are server markup; this
// piece (it renders nothing) sets their `data-on` to "true" while they are on screen and "false" otherwise, and the CSS
// runs the animation only under `data-on="true"`. Nothing animates off screen; the observer is rebuilt on every route, since the
// one-page layout keeps the frame and only the slot of the product changes.
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function LiveObserver() {
  // The frame stays mounted across routes (the one-page layout): a new route brings new bands, so observe again
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries)
        (entry.target as HTMLElement).dataset.on = entry.isIntersecting
          ? "true"
          : "false";
    });
    document.querySelectorAll("[data-live]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}

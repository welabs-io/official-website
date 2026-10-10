"use client";
// OBSERVADOR DE MOVIMENTO
// One IntersectionObserver for every CSS-only animation of the page. Elements marked `data-live` are server markup; this
// piece (it renders nothing) sets their `data-on` to "true" while they are on screen and "false" otherwise, and the CSS
// runs the animation only under `data-on="true"`. Nothing animates off screen and the observer dies with the page.
import { useEffect } from "react";

export function LiveObserver() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries)
        (entry.target as HTMLElement).dataset.on = entry.isIntersecting
          ? "true"
          : "false";
    });
    document.querySelectorAll("[data-live]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

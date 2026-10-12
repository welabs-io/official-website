// EXECUÇÃO DO CARROSSEL NO NAVEGADOR
// Loaded on demand by RingDriver. Binds a server-rendered stage (RingStage) to a Playback: the slide list of the kind
// decides the segments, and the "active" state lives in the DOM only (`data-pos` of each tile, `data-on` of each logo),
// so React never re-renders. On every swap it also fills the bus of the row of logos and restarts the pulse of the
// thread of the section (see `pulse` below). Only the active tile plays and the next one is parked, ready; every other tile is a cover
// image. `run` returns the function that releases everything (players, timers) and puts the ring back on its first tile.
import {
  CHAIN_CONNECTIONS,
  activeSpan,
  connectionSpan,
} from "@/lib/chain-connections";
import {
  MONTAGE_SLIDES,
  PRODUCT_SLIDES,
  productFilms,
  type Slide,
} from "@/lib/motion-slides";
import type { ProductSlug } from "@/lib/products";
import { ensurePlayer } from "./player";
import { Playback, flatten } from "./ring-playback";
import { isNear, placeOf, ringPosition } from "./positions";
import type { RingKind } from "./RingDriver";

// Download the player script ahead of the first play
export const warm = () => {
  ensurePlayer().catch(() => {});
};

const slidesOf = (kind: RingKind, slug?: string): Slide[] =>
  kind === "chain"
    ? MONTAGE_SLIDES
    : kind === "products"
      ? PRODUCT_SLIDES
      : kind === "films"
        ? productFilms(slug as ProductSlug)
        : PRODUCT_SLIDES.filter((slide) => slide.slug === slug);

export function run(root: HTMLElement, kind: RingKind, slug?: string) {
  const stage = root.querySelector<HTMLElement>("[data-ring]");
  if (!stage) return () => {};
  const tiles = [...stage.children] as HTMLElement[];
  const layers = tiles.map((tile) =>
    tile.querySelector<HTMLElement>("[data-layers]"),
  );
  const logos = [...root.querySelectorAll<HTMLElement>("[data-slug]")];
  const slides = slidesOf(kind, slug);
  const flat = flatten(slides);
  // The chain has one tile per cut; the other kinds have one tile per slide (opening tail and film share a tile)
  const perCut = kind === "chain";
  const cutProducts = slides.flatMap((slide) =>
    slide.segments.map((segment) => segment.products ?? []),
  );

  // Moves the ring to `active`: tile positions, accessibility and the lit logos
  const show = (active: number) => {
    tiles.forEach((tile, i) => {
      const position = ringPosition(i, active, tiles.length);
      tile.dataset.pos = String(placeOf(position));
      if (isNear(position)) tile.dataset.near = "";
      else delete tile.dataset.near;
      if (position === 0) tile.removeAttribute("aria-hidden");
      else tile.setAttribute("aria-hidden", "true");
    });
    const lit: readonly string[] = perCut
      ? (cutProducts[active] ?? [])
      : [slides[active]?.slug ?? ""];
    for (const logo of logos)
      logo.dataset.on = lit.includes(logo.dataset.slug ?? "")
        ? "true"
        : "false";
  };

  // On every swap: fill the stretch of the bus of the row of logos that belongs to the new tile (the connection of the
  // cut on the chain, the active product up to the axis on the products) and restart the pulse that goes down the thread
  // of the section. Both restart by flipping an attribute between "a" and "b" (two identical keyframes with different
  // names); the stretch is plain percentages of the five equal columns, so nothing here reads the layout.
  const row = root.querySelector<HTMLElement>("[data-row]");
  const fill = row?.querySelector<HTMLElement>("[data-fill]");
  const rail = root
    .closest("section")
    ?.querySelector<HTMLElement>(":scope > [data-rail]");
  const flip = (el: HTMLElement | null | undefined, name: "fill" | "pulse") => {
    if (el) el.dataset[name] = el.dataset[name] === "a" ? "b" : "a";
  };
  const writeSpan = (active: number) => {
    if (!row) return;
    const slug = slides[active]?.slug;
    const span = perCut
      ? connectionSpan(CHAIN_CONNECTIONS[active] ?? null)
      : activeSpan(slug as ProductSlug);
    row.style.setProperty("--lo", String(span.lo));
    row.style.setProperty("--hi", String(span.hi));
    row.style.setProperty(
      "--origin",
      span.origin === "left" ? "0 50%" : "100% 50%",
    );
  };
  const pulse = (active: number) => {
    if (fill) {
      writeSpan(active);
      flip(fill, "fill");
    }
    flip(rail, "pulse");
  };
  // Back to the first state (the one the server drew): the first tile's stretch, no animation
  const idle = () => {
    writeSpan(0);
    if (fill) fill.dataset.fill = "idle";
    if (rail) rail.dataset.pulse = "idle";
  };

  let dead = false;
  let playback: Playback | null = null;
  let restart = 0;
  const begin = () => {
    playback = new Playback({
      flat,
      layers: () => layers,
      start: 0,
      ahead: 1,
      single: true,
      tiles: true,
      tileBySlide: !perCut,
      onSlide: () => {},
      onSwap: (info) => {
        // A single-slide ring (the opening of a product page) loops: start over once the film has held its last frame
        if (slides.length === 1) {
          // The blend from the tail into the film is the only other handoff; the wrap-around is the one that restarts
          if (info.toIndex !== 0) return;
          window.clearTimeout(restart);
          restart = window.setTimeout(() => {
            if (dead) return;
            playback?.destroy();
            begin();
          }, 0);
          return;
        }
        // The opening tail blending into its film is not a rotation
        if (!perCut && info.from === info.to) return;
        root.style.setProperty("--swap-time", `${info.duration}s`);
        const active = perCut ? info.toIndex : info.to;
        show(active);
        pulse(active);
        window.dispatchEvent(
          new CustomEvent("ring:swap", {
            detail: { ring: root.id, from: info.from, to: info.to },
          }),
        );
      },
    });
    playback.start();
  };

  ensurePlayer().then(
    () => {
      if (!dead) begin();
    },
    () => {},
  );

  return () => {
    dead = true;
    window.clearTimeout(restart);
    playback?.destroy();
    playback = null;
    // The next run starts over on the first tile
    show(0);
    idle();
  };
}

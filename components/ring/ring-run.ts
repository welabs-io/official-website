// EXECUÇÃO DO CARROSSEL NO NAVEGADOR
// Loaded on demand by RingDriver. Binds a server-rendered stage (RingStage) to a Playback: the segments, the products
// each tile lights, the stretch of the bus and the label of the connection come from the JSON the server wrote next to
// the stage (lib/ring-data.ts), and the "active" state lives in the DOM only (`data-pos` of each tile, `data-on` of each
// logo), so React never re-renders. On every swap it also fills the bus of the row of logos, changes the label of the
// connection and restarts the pulse of the thread of the section (see `pulse` below). Only the active tile plays and
// the next one is parked, ready; every other tile is a cover image. `run` returns the function that releases
// everything (players, timers) and puts the ring back on its first tile.
import type { RingData } from "@/lib/ring-data";
import { ensurePlayer } from "./player";
import { Playback, flatten } from "./ring-playback";
import { coverShown, isNear, placeOf, ringPosition } from "./positions";
import type { RingKind } from "./RingDriver";

// Download the player script ahead of the first play
export const warm = () => {
  ensurePlayer().catch(() => {});
};

export function run(root: HTMLElement, kind: RingKind) {
  const stage = root.querySelector<HTMLElement>("[data-ring]");
  // The server wrote what to play next to the stage (RingStage); nothing is imported from the manifest
  const source = root.querySelector("script[data-ring-data]")?.textContent;
  if (!stage || !source) return () => {};
  const data = JSON.parse(source) as RingData;
  const tiles = [...stage.children] as HTMLElement[];
  const layers = tiles.map((tile) =>
    tile.querySelector<HTMLElement>("[data-layers]"),
  );
  const logos = [...root.querySelectorAll<HTMLElement>("[data-slug]")];
  // Product cards of the same section (the home), lit like the logos; and the live caption under the ring
  const cards = [
    ...(root.closest("section")?.querySelectorAll<HTMLElement>("[data-card]") ??
      []),
  ];
  const caption = root.querySelector<HTMLElement>("[data-caption]");
  const flat = flatten(data.slides);
  // The chain has one tile per cut; the other kinds have one tile per slide (opening and film share a tile)
  const perCut = kind === "chain";

  // Moves the ring to `active`: tile positions, accessibility and the lit logos
  const show = (active: number) => {
    tiles.forEach((tile, i) => {
      const position = ringPosition(i, active, tiles.length);
      tile.dataset.pos = String(placeOf(position));
      if (isNear(position)) tile.dataset.near = "";
      else delete tile.dataset.near;
      // The cover on display at this place loads now, not when the browser's lazy distance says so
      const covers = [
        ...tile.querySelectorAll<HTMLImageElement>("[data-cover]"),
      ];
      const hasEnd = covers.some((img) => img.dataset.cover === "end");
      for (const img of covers)
        if (coverShown(position, img.dataset.cover as "start" | "end", hasEnd))
          img.loading = "eager";
      if (position === 0) tile.removeAttribute("aria-hidden");
      else tile.setAttribute("aria-hidden", "true");
    });
    const lit: readonly string[] = data.lit[active] ?? [];
    for (const logo of logos)
      logo.dataset.on = lit.includes(logo.dataset.slug ?? "")
        ? "true"
        : "false";
    for (const card of cards)
      card.dataset.on = lit.includes(card.dataset.card ?? "")
        ? "true"
        : "false";
    // The caption changes with the scene (aria-live="polite" announces it)
    if (caption && data.captions?.[active])
      caption.textContent = data.captions[active];
  };

  // On every swap: fill the stretch of the bus of the row of logos that belongs to the new tile (the connection of the
  // cut on the chain, the active product up to the axis on the products), cross-fade the label of the connection and
  // restart the pulse that goes down the thread of the section. Each restarts by flipping an attribute between "a" and
  // "b" (two identical keyframes with different names); the stretch is plain numbers of the five equal columns, so
  // nothing here reads the layout.
  const row = root.querySelector<HTMLElement>("[data-row]");
  const fill = row?.querySelector<HTMLElement>("[data-fill]");
  const label = row?.querySelector<HTMLElement>("[data-label]");
  const rail = root
    .closest("section")
    ?.querySelector<HTMLElement>(":scope > [data-rail]");
  const flip = (
    el: HTMLElement | null | undefined,
    name: "fill" | "pulse" | "swap",
  ) => {
    if (el) el.dataset[name] = el.dataset[name] === "a" ? "b" : "a";
  };
  const writeRow = (active: number) => {
    if (!row) return;
    const span = data.spans[active];
    if (span) {
      row.style.setProperty("--lo", String(span.lo));
      row.style.setProperty("--hi", String(span.hi));
      row.style.setProperty(
        "--origin",
        span.origin === "left" ? "0 50%" : "100% 50%",
      );
    }
    if (label) label.textContent = data.labels[active] ?? "";
  };
  const pulse = (active: number) => {
    if (row) {
      writeRow(active);
      flip(fill, "fill");
      flip(label, "swap");
    }
    flip(rail, "pulse");
  };
  // Back to the first state (the one the server drew): the first tile's stretch and label, no animation
  const idle = () => {
    writeRow(0);
    if (fill) fill.dataset.fill = "idle";
    if (label) label.dataset.swap = "idle";
    if (rail) rail.dataset.pulse = "idle";
  };

  let dead = false;
  let playback: Playback | null = null;
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
      // An opening blending into its film inside one tile is not a rotation
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

  ensurePlayer().then(
    () => {
      if (!dead) playback?.start();
    },
    () => {},
  );

  return () => {
    dead = true;
    playback?.destroy();
    playback = null;
    // The next run starts over on the first tile
    show(0);
    idle();
  };
}

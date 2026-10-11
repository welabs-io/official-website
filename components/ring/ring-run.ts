// EXECUÇÃO DO CARROSSEL NO NAVEGADOR
// Navigation owns the active preview independently of the player. Visibility suspends playback in place; reduced
// motion and unavailable compositions retain the same buttons, captions and detail links.
import {
  MONTAGE_SLIDES,
  PRODUCT_SLIDES,
  productFilms,
  type Slide,
} from "@/lib/motion-slides";
import { PRODUCTS, type ProductSlug } from "@/lib/products";
import { ensurePlayer } from "./player";
import { Playback, flatten } from "./ring-playback";
import { isNear, placeOf, ringPosition } from "./positions";
import type { RingKind } from "./RingDriver";

export const ROTATION_SECONDS = 0.7;
const COVER_HOLD_MS = 4400;

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

export type RingController = {
  play: () => void;
  pause: () => void;
  destroy: () => void;
};

export function run(
  root: HTMLElement,
  kind: RingKind,
  slug?: string,
): RingController {
  const stage = root.querySelector<HTMLElement>("[data-ring]");
  if (!stage) return { play: () => {}, pause: () => {}, destroy: () => {} };
  const tiles = [...stage.querySelectorAll<HTMLElement>("[data-tile]")];
  const layers = tiles.map((tile) =>
    tile.querySelector<HTMLElement>("[data-layers]"),
  );
  const logos = [...root.querySelectorAll<HTMLElement>("[data-slug]")];
  const captions = [...root.querySelectorAll<HTMLElement>("[data-caption]")];
  const announcement = root.querySelector<HTMLElement>("[data-announcement]");
  const slides = slidesOf(kind, slug);
  const flat = flatten(slides);
  // The chain has one tile per cut; the other kinds have one tile per slide (opening tail and film share a tile)
  const perCut = kind === "chain";
  const singlePane = perCut && root.dataset.presentation === "single";
  const posters = tiles.map((tile) =>
    tile.querySelector<HTMLImageElement>("[data-poster]"),
  );
  const posterSources = posters.map((poster) => poster?.getAttribute("src"));
  const cutProducts = slides.flatMap((slide) =>
    slide.segments.map((segment) => segment.products ?? []),
  );

  const navigable = root.dataset.navigation === "true";
  let focusedCaption = Boolean(
    document.activeElement?.closest("[data-caption]") &&
    root.contains(document.activeElement),
  );
  let active = 0;
  let dead = false;
  let wanted = false;
  let generation = 0;
  let unavailable = false;
  let playback: Playback | null = null;
  let restart = 0;
  let coverTimer = 0;
  let gesture: { x: number; y: number } | null = null;
  let suppressClickUntil = 0;

  // SINALIZAÇÃO DO CONTEÚDO ATIVO
  const show = (index: number, announce = false) => {
    const previous = active;
    active = ((index % tiles.length) + tiles.length) % tiles.length;
    root.dataset.active = String(active);
    tiles.forEach((tile, i) => {
      const position = ringPosition(i, singlePane ? 0 : active, tiles.length);
      tile.dataset.pos = String(placeOf(position));
      if (isNear(position)) tile.dataset.near = "";
      else delete tile.dataset.near;
      if (position === 0) tile.removeAttribute("aria-hidden");
      else tile.setAttribute("aria-hidden", "true");
    });
    const cover = posterSources[active];
    if (singlePane && posters[0] && cover) {
      // One visible pane follows the narrative; cached covers never depend on a previously changed image source.
      posters[0].setAttribute("src", cover);
    }
    const lit: readonly string[] = perCut
      ? (cutProducts[active] ?? [])
      : [slides[active]?.slug ?? ""];
    for (const logo of logos) {
      const selected = lit.includes(logo.dataset.slug ?? "");
      logo.dataset.on = String(selected);
      logo
        .querySelector("button")
        ?.setAttribute("aria-pressed", String(selected));
    }
    for (const caption of captions)
      caption.hidden = caption.dataset.caption !== lit[0];
    if (announce && announcement) {
      const product = PRODUCTS.find((item) => item.slug === lit[0]);
      announcement.textContent = product
        ? `${product.name}. ${product.line}.`
        : `Filme ${active + 1} de ${tiles.length}.`;
    }
    window.dispatchEvent(
      new CustomEvent("ring:swap", {
        detail: {
          ring: root.id,
          from: perCut ? flat[previous]?.slide : previous,
          to: perCut ? flat[active]?.slide : active,
          fromIndex: previous,
          toIndex: active,
          products: lit,
        },
      }),
    );
  };

  // REPRODUÇÃO E CONTINGÊNCIA
  const scheduleCovers = () => {
    window.clearTimeout(coverTimer);
    if (!wanted || focusedCaption || dead || tiles.length < 2) return;
    coverTimer = window.setTimeout(() => {
      show(active + 1);
      scheduleCovers();
    }, COVER_HOLD_MS);
  };
  const fallback = () => {
    if (dead) return;
    unavailable = true;
    root.dataset.playback = "covers";
    playback?.destroy();
    playback = null;
    scheduleCovers();
  };
  const begin = () => {
    const start = perCut
      ? active
      : flat.findIndex((segment) => segment.slide === active);
    playback = new Playback({
      flat,
      layers: () => (singlePane ? slides.map(() => layers[0]) : layers),
      start: Math.max(0, start),
      ahead: 1,
      single: true,
      // The chain retains its authored horizontal/vertical pushes in one shared frame.
      tiles: !singlePane,
      tileBySlide: !perCut && !singlePane,
      onSlide: () => {},
      onUnavailable: fallback,
      onSwap: (info) => {
        // A single-slide ring (the opening of a product page) loops: start over once the film has held its last frame
        if (tiles.length === 1) {
          // The blend from the tail into the film is the only other handoff; the wrap-around is the one that restarts
          if (info.toIndex !== 0) return;
          window.clearTimeout(restart);
          restart = window.setTimeout(() => {
            if (dead) return;
            playback?.destroy();
            begin();
            if (!wanted) playback?.pause();
          }, 0);
          return;
        }
        // The opening tail blending into its film is not a rotation
        if (!perCut && info.from === info.to) return;
        // Ring choreography has its own duration; the original film overlap remains untouched.
        root.style.setProperty("--swap-time", `${ROTATION_SECONDS}s`);
        show(perCut ? info.toIndex : info.to);
      },
    });
    root.dataset.playback = "films";
    playback.start();
  };

  const play = () => {
    wanted = true;
    if (dead || focusedCaption) return;
    if (unavailable) return scheduleCovers();
    if (playback) {
      playback.resume();
      show(active);
      return;
    }
    const request = ++generation;
    ensurePlayer().then(
      () => {
        if (
          !dead &&
          wanted &&
          !focusedCaption &&
          request === generation &&
          !playback
        )
          begin();
      },
      () => {
        if (!dead && request === generation) fallback();
      },
    );
  };
  const pause = () => {
    wanted = false;
    generation++;
    window.clearTimeout(coverTimer);
    playback?.pause();
  };

  // NAVEGAÇÃO POR CONTEÚDO
  const select = (index: number) => {
    const next = ((index % tiles.length) + tiles.length) % tiles.length;
    if (next === active) return;
    generation++;
    window.clearTimeout(restart);
    window.clearTimeout(coverTimer);
    playback?.destroy();
    playback = null;
    root.style.setProperty("--swap-time", `${ROTATION_SECONDS}s`);
    const restoreCaptionFocus = focusedCaption;
    show(next, true);
    if (restoreCaptionFocus)
      captions
        .find((caption) => !caption.hidden)
        ?.querySelector<HTMLAnchorElement>("a")
        ?.focus();
    if (wanted) play();
  };
  const focusin = (event: FocusEvent) => {
    if (
      !(event.target instanceof Element) ||
      !event.target.closest("[data-caption]")
    )
      return;
    // A disappearing detail link must keep its caption and keyboard focus until the user leaves it.
    focusedCaption = true;
    generation++;
    window.clearTimeout(coverTimer);
    playback?.pause();
  };
  const focusout = (event: FocusEvent) => {
    if (!focusedCaption) return;
    if (
      event.relatedTarget instanceof Element &&
      root.contains(event.relatedTarget) &&
      event.relatedTarget.closest("[data-caption]")
    )
      return;
    focusedCaption = false;
    if (wanted) play();
  };
  const click = (event: MouseEvent) => {
    if (
      performance.now() < suppressClickUntil ||
      !(event.target instanceof Element)
    )
      return;
    const button = event.target.closest<HTMLElement>(
      "[data-step], [data-select], [data-product]",
    );
    if (!button || !root.contains(button)) return;
    if (button.dataset.step) select(active + Number(button.dataset.step));
    else if (button.dataset.select) select(Number(button.dataset.select));
    else if (button.dataset.product)
      select(
        slides.findIndex((slide) => slide.slug === button.dataset.product),
      );
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    if (
      event.target instanceof Element &&
      event.target.closest('input, textarea, select, [contenteditable="true"]')
    )
      return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    select(active + (event.key === "ArrowRight" ? 1 : -1));
  };
  const pointerdown = (event: PointerEvent) => {
    if (event.pointerType === "mouse") return;
    gesture = { x: event.clientX, y: event.clientY };
  };
  const pointerup = (event: PointerEvent) => {
    if (!gesture) return;
    const x = event.clientX - gesture.x;
    const y = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(x) < 40 || Math.abs(x) < Math.abs(y) * 1.25) return;
    suppressClickUntil = performance.now() + 500;
    select(active + (x < 0 ? 1 : -1));
  };
  const pointercancel = () => {
    gesture = null;
  };
  if (navigable) {
    root.addEventListener("click", click);
    root.addEventListener("keydown", keydown);
    stage.addEventListener("pointerdown", pointerdown);
    stage.addEventListener("pointerup", pointerup);
    stage.addEventListener("pointercancel", pointercancel);
  }
  if (captions.length > 0) {
    root.addEventListener("focusin", focusin);
    root.addEventListener("focusout", focusout);
  }
  show(active);
  return {
    play,
    pause,
    destroy: () => {
      dead = true;
      pause();
      window.clearTimeout(restart);
      playback?.destroy();
      playback = null;
      root.removeEventListener("click", click);
      root.removeEventListener("keydown", keydown);
      root.removeEventListener("focusin", focusin);
      root.removeEventListener("focusout", focusout);
      stage.removeEventListener("pointerdown", pointerdown);
      stage.removeEventListener("pointerup", pointerup);
      stage.removeEventListener("pointercancel", pointercancel);
    },
  };
}

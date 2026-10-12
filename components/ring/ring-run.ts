// EXECUÇÃO DO CARROSSEL NO NAVEGADOR
// Navigation owns the active preview independently of the player. Visibility suspends playback in place; reduced
// motion and unavailable compositions retain the same buttons, captions and detail links.
import {
  MONTAGE_SLIDES,
  PRODUCT_SLIDES,
  heroSlides,
  previewSlides,
  productFilms,
  productStorySlides,
  productOverviewSlides,
  type Slide,
} from "@/lib/motion-slides";
import { PRODUCTS, type ProductSlug } from "@/lib/products";
import { ensurePlayer } from "./player";
import { Playback, flatten } from "./ring-playback";
import { isNear, placeOf, ringPosition } from "./positions";
import type { RingKind } from "./RingDriver";
import { motionPhase, projectionVariables } from "./projection";
import { revealSelectedMotion } from "./scroll-selected-motion";

export const ROTATION_SECONDS = 0.55;
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
        : kind === "preview"
          ? previewSlides(slug as ProductSlug)
          : kind === "story"
            ? productStorySlides(slug as ProductSlug)
            : kind === "overview"
              ? productOverviewSlides(slug as ProductSlug)
              : heroSlides(slug as ProductSlug);

export type RingController = {
  play: () => void;
  pause: () => void;
  destroy: () => void;
  select: (index: number) => void;
};

export function run(
  root: HTMLElement,
  kind: RingKind,
  slug?: string,
): RingController {
  const stage = root.querySelector<HTMLElement>("[data-ring]");
  if (!stage)
    return {
      play: () => {},
      pause: () => {},
      destroy: () => {},
      select: () => {},
    };
  const tiles = [...stage.querySelectorAll<HTMLElement>("[data-tile]")];
  const layers = tiles.map((tile) =>
    tile.querySelector<HTMLElement>("[data-layers]"),
  );
  const logos = [...root.querySelectorAll<HTMLElement>("[data-slug]")];
  const captions = [...root.querySelectorAll<HTMLElement>("[data-caption]")];
  const chapters = [
    ...root.querySelectorAll<HTMLElement>("[data-motion-chapter]"),
  ];
  const announcement = root.querySelector<HTMLElement>("[data-announcement]");
  const slides = slidesOf(kind, slug);
  const manualIdentity =
    kind === "products" &&
    root.dataset.rotate === "false" &&
    slides.every(
      (slide) =>
        slide.segments.length === 1 &&
        motionPhase(slide.segments[0].id) === "intro",
    );
  const flat = flatten(slides);
  // The chain has one tile per cut; the other kinds have one tile per slide (opening tail and film share a tile)
  const perCut = kind === "chain";
  const singlePane =
    (perCut || kind === "story") && root.dataset.presentation === "single";
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
  const wrappingTimers = new Set<number>();
  const orbitalAnimations = new Map<
    HTMLElement,
    { animation: Animation; transition: string }
  >();

  // TRAJETÓRIA ORBITAL
  // Native keyframes lift the spatial midpoint above the chord; the end poses remain owned by the responsive CSS.
  const rotateTile = (
    tile: HTMLElement,
    mutate: () => void,
    wrapping: boolean,
  ) => {
    const previous = orbitalAnimations.get(tile);
    const interrupted = previous
      ? {
          transform: getComputedStyle(tile).transform,
          stack: getComputedStyle(tile).zIndex,
        }
      : null;
    if (previous) {
      previous.animation.onfinish = null;
      previous.animation.cancel();
      tile.style.transition = previous.transition;
      orbitalAnimations.delete(tile);
    }
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      wrapping ||
      root.dataset.presentation === "single" ||
      reduced ||
      typeof tile.animate !== "function"
    ) {
      mutate();
      return;
    }
    const initialStyle = getComputedStyle(tile);
    const from = interrupted?.transform ?? initialStyle.transform;
    const fromStack = interrupted?.stack ?? initialStyle.zIndex;
    const transition = tile.style.transition;
    // Exchange depth at the separated midpoint, never as a stack pop at the end of the move.
    tile.style.transition = "opacity var(--swap-time) var(--ease)";
    mutate();
    const to = getComputedStyle(tile).transform;
    const toStack = getComputedStyle(tile).zIndex;
    const middle = new DOMMatrix(from);
    const target = new DOMMatrix(to);
    for (const key of [
      "m11",
      "m12",
      "m13",
      "m14",
      "m21",
      "m22",
      "m23",
      "m24",
      "m31",
      "m32",
      "m33",
      "m34",
      "m41",
      "m42",
      "m43",
      "m44",
    ] as const)
      middle[key] = (middle[key] + target[key]) / 2;
    middle.m42 -= Math.min(36, stage.getBoundingClientRect().width * 0.045);
    const animation = tile.animate(
      [
        { transform: from, zIndex: fromStack, offset: 0 },
        { transform: middle.toString(), zIndex: fromStack, offset: 0.49 },
        { transform: middle.toString(), zIndex: toStack, offset: 0.51 },
        { transform: to, zIndex: toStack, offset: 1 },
      ],
      {
        duration: ROTATION_SECONDS * 1000,
        easing: "cubic-bezier(.22,1,.36,1)",
      },
    );
    orbitalAnimations.set(tile, { animation, transition });
    animation.onfinish = () => {
      tile.style.transition = transition;
      orbitalAnimations.delete(tile);
    };
  };

  // FASE VISÍVEL DA COMPOSIÇÃO
  // Update phase even when an opening and its film share the same tile; each layer owns its own crop during the blend.
  const phaseOf = (segmentIndex: number) => {
    const segment = flat[segmentIndex];
    if (!segment) return;
    const phase = motionPhase(segment.id);
    const tile = tiles[singlePane ? 0 : perCut ? segmentIndex : segment.slide];
    if (tile) tile.dataset.phase = phase;
    root.dataset.phase = phase;
  };

  // SINALIZAÇÃO DO CONTEÚDO ATIVO
  const show = (index: number, announce = false) => {
    const previous = active;
    active = ((index % tiles.length) + tiles.length) % tiles.length;
    root.dataset.active = String(active);
    tiles.forEach((tile, i) => {
      const position = ringPosition(i, singlePane ? 0 : active, tiles.length);
      const oldPosition = Number(tile.dataset.pos);
      // Rear wrap crosses behind the stage while hidden, never through the focal composition.
      const wrapping =
        Math.abs(oldPosition) === 2 &&
        Math.abs(position) === 2 &&
        oldPosition !== position;
      if (wrapping) {
        tile.dataset.wrapping = "true";
        const timer = window.setTimeout(() => {
          wrappingTimers.delete(timer);
          delete tile.dataset.wrapping;
        }, ROTATION_SECONDS * 750);
        wrappingTimers.add(timer);
      }
      const setPosition = () => {
        tile.dataset.pos = String(placeOf(position));
      };
      if (oldPosition !== placeOf(position))
        rotateTile(tile, setPosition, wrapping);
      else setPosition();
      if (isNear(position)) tile.dataset.near = "";
      else delete tile.dataset.near;
      if (position === 0) tile.removeAttribute("aria-hidden");
      else tile.setAttribute("aria-hidden", "true");
    });
    const cover = posterSources[active];
    if (singlePane && posters[0] && cover) {
      // One visible pane follows the narrative; cached covers never depend on a previously changed image source.
      posters[0].setAttribute("src", cover);
      const projection = posters[0].parentElement;
      const source =
        slides[active]?.posterPieceId ?? slides[active]?.segments[0]?.id;
      if (kind === "story" && projection && source) {
        projection.dataset.motionPhase =
          slides[active]?.posterPhase ?? motionPhase(source);
        for (const [name, value] of Object.entries(projectionVariables(source)))
          projection.style.setProperty(name, value);
      }
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
      caption.hidden =
        root.dataset.reducedMotion === "true" && kind === "story"
          ? false
          : caption.dataset.captionIndex === undefined
            ? caption.dataset.caption !== lit[0]
            : Number(caption.dataset.captionIndex) !== active;
    for (const chapter of chapters) {
      // Passive markers follow playback; only legacy interactive controls retain pressed semantics.
      const current =
        Number(chapter.dataset.chapterIndex ?? chapter.dataset.select) ===
        active;
      chapter.dataset.current = String(current);
      if (chapter.dataset.select !== undefined)
        chapter.setAttribute("aria-pressed", String(current));
    }
    if (announce && announcement) {
      const product = PRODUCTS.find((item) => item.slug === lit[0]);
      announcement.textContent =
        kind === "films" || kind === "story"
          ? (slides[active]?.label ?? "")
          : product
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
    if (
      !wanted ||
      focusedCaption ||
      dead ||
      tiles.length < 2 ||
      root.dataset.rotate === "false"
    )
      return;
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
    phaseOf(Math.max(0, start));
    playback = new Playback({
      flat,
      layers: () => (singlePane ? slides.map(() => layers[0]) : layers),
      start: Math.max(0, start),
      ahead: 1,
      single: true,
      // The chain retains its authored horizontal/vertical pushes in one shared frame.
      tiles: !singlePane,
      tileBySlide: !perCut && !singlePane,
      loopFilm: kind === "products" && root.dataset.rotate === "false",
      holdIdentity: manualIdentity,
      onSlide: () => {},
      onUnavailable: fallback,
      onSwap: (info) => {
        phaseOf(info.toIndex);
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
        // The opening-to-film phase still updates, but the shared tile does not rotate.
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
    // Native controls may scroll their own row into view; restore the chosen frame before its opening or chapter plays.
    if (kind === "story" || kind === "products") revealSelectedMotion(root);
    // Selecting the current identity explicitly replays its complete formation.
    if (next === active && !manualIdentity) return;
    generation++;
    window.clearTimeout(restart);
    window.clearTimeout(coverTimer);
    playback?.destroy();
    playback = null;
    root.style.setProperty("--swap-time", `${ROTATION_SECONDS}s`);
    const restoreCaptionFocus = focusedCaption;
    show(next, true);
    phaseOf(
      perCut ? next : flat.findIndex((segment) => segment.slide === next),
    );
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
    if (
      event.pointerType === "mouse" ||
      (event.button !== undefined && event.button !== 0)
    )
      return;
    gesture = { x: event.clientX, y: event.clientY };
    if (
      typeof stage.setPointerCapture === "function" &&
      event.pointerId !== undefined
    )
      stage.setPointerCapture(event.pointerId);
  };
  const pointerup = (event: PointerEvent) => {
    if (!gesture) return;
    const x = event.clientX - gesture.x;
    const y = event.clientY - gesture.y;
    gesture = null;
    if (
      typeof stage.hasPointerCapture === "function" &&
      stage.hasPointerCapture(event.pointerId)
    )
      stage.releasePointerCapture(event.pointerId);
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
    select,
    destroy: () => {
      dead = true;
      pause();
      window.clearTimeout(restart);
      for (const timer of wrappingTimers) window.clearTimeout(timer);
      wrappingTimers.clear();
      for (const [tile, entry] of orbitalAnimations) {
        entry.animation.onfinish = null;
        entry.animation.cancel();
        tile.style.transition = entry.transition;
      }
      orbitalAnimations.clear();
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

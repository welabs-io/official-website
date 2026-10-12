// CARREGAMENTO E ATRIBUTOS DO PLAYER HYPERFRAMES
// The pinned player registers <hyperframes-player> once per page. Every player of the site is created from the same
// attributes and is never shown with controls: the page has no player interface, only the frame. There is no sequential
// player (opening before film): the ring chains segments itself, one player per segment.
import fluid from "@/lib/fluid-motion-pieces.json";

export type PlayerElement = HTMLElement & {
  play: () => void;
  pause: () => void;
  seek: (t: number) => void;
  currentTime: number;
  duration: number;
  paused: boolean;
  playbackRate: number;
  ready?: boolean;
};

export const PLAYER_SRC = "/motion/player.js";
const standaloneIds = new Set(fluid.pieces.map(({ id }) => id));
// Accepted standalone revisions use an isolated brand runtime; identity openings retain their original bundle.
export const piece = (id: string) =>
  `/motion/${standaloneIds.has(id) ? "fluid-system/pieces" : "pieces"}/${id}/index.html`;

// Attributes of every player of the page. `controls` is never part of them (a test guards it). A preloaded player is
// created without `autoplay` and is started by the ring at the handoff.
export function playerAttributes(
  src: string,
  clip?: readonly [number, number] | null,
  autoplay = true,
  rate = 1,
  loop = false,
): Record<string, string> {
  return {
    src,
    width: "1920",
    height: "1080",
    ...(autoplay ? { autoplay: "" } : {}),
    ...(loop ? { loop: "" } : {}),
    muted: "",
    // Clicking the film must not silently pause the content carousel.
    "disable-click-to-play": "",
    tabindex: "-1",
    ...(rate !== 1 ? { "playback-rate": String(rate) } : {}),
    ...(clip
      ? { "range-start": String(clip[0]), "range-end": String(clip[1]) }
      : {}),
  };
}

let load: Promise<void> | null = null;
export function ensurePlayer(): Promise<void> {
  load ??= new Promise<void>((resolve, reject) => {
    if (customElements.get("hyperframes-player")) return resolve();
    const el = document.createElement("script");
    el.src = PLAYER_SRC;
    // A blocked script must return to navigable covers instead of leaving the carousel pending forever.
    const timeout = window.setTimeout(() => failed(), 8000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      el.onload = null;
      el.onerror = null;
    };
    const failed = () => {
      cleanup();
      el.remove();
      reject(new Error(PLAYER_SRC));
    };
    el.onload = () => {
      if (!customElements.get("hyperframes-player")) return failed();
      cleanup();
      resolve();
    };
    el.onerror = failed;
    document.head.appendChild(el);
  }).catch((error) => {
    load = null;
    throw error;
  });
  return load;
}

// ESCONDER O CARREGAMENTO DO PLAYER
// The pinned player draws a "Loading assets" panel inside its shadow root while it prepares; the site never shows it.
// A style rule in the shadow root hides it (the layer is also kept transparent until the first frame is ready).
export function hideLoader(el: HTMLElement) {
  const root = el.shadowRoot;
  if (!root || root.querySelector("style[data-site-loader]")) return;
  const style = document.createElement("style");
  style.dataset.siteLoader = "";
  style.textContent = ".hfp-shader-loader{display:none!important}";
  root.appendChild(style);
}

export function createPlayer(
  src: string,
  clip?: readonly [number, number] | null,
  autoplay = true,
  rate = 1,
  loop = false,
): PlayerElement {
  const el = document.createElement("hyperframes-player");
  for (const [name, value] of Object.entries(
    playerAttributes(src, clip, autoplay, rate, loop),
  ))
    el.setAttribute(name, value);
  el.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block";
  return el as PlayerElement;
}

// CARREGAMENTO E ATRIBUTOS DO PLAYER HYPERFRAMES
// The pinned player registers <hyperframes-player> once per page. Every player of the site is created from the same
// attributes and is never shown with controls: the page has no player interface, only the frame. There is no sequential
// player (opening before film): the ring chains segments itself, one player per segment.

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
export const piece = (id: string) => `/motion/pieces/${id}/index.html`;
export const poster = (id: string) => `/motion/posters/${id}.jpg`;

// Attributes of every player of the page. `controls` is never part of them (a test guards it). A preloaded player is
// created without `autoplay` and is started by the ring at the handoff.
export function playerAttributes(
  src: string,
  clip?: readonly [number, number] | null,
  autoplay = true,
  rate = 1,
): Record<string, string> {
  return {
    src,
    width: "1920",
    height: "1080",
    ...(autoplay ? { autoplay: "" } : {}),
    muted: "",
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
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(PLAYER_SRC));
    document.head.appendChild(el);
  }).catch((error) => {
    load = null;
    throw error;
  });
  return load;
}

export function createPlayer(
  src: string,
  clip?: readonly [number, number] | null,
  autoplay = true,
  rate = 1,
): PlayerElement {
  const el = document.createElement("hyperframes-player");
  for (const [name, value] of Object.entries(
    playerAttributes(src, clip, autoplay, rate),
  ))
    el.setAttribute(name, value);
  el.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block";
  return el as PlayerElement;
}

// CARREGAMENTO E ATRIBUTOS DO PLAYER HYPERFRAMES
// The pinned player registers <hyperframes-player> once per page; the sequence player of the round plays an opening and
// then a film. Neither is ever shown with controls: the page has no player interface, only the frame.

export type PlayerElement = HTMLElement & {
  play: () => void;
  pause: () => void;
  seek: (t: number) => void;
  currentTime: number;
  duration: number;
  paused: boolean;
  ready?: boolean;
};

export type SequenceHandle = {
  state: "loading" | "cover" | "intro" | "film" | "ended";
  introPlayer: PlayerElement;
  filmPlayer: PlayerElement;
  play: () => void;
  pause: () => void;
  reset: () => void;
  destroy: () => void;
};

declare global {
  interface Window {
    SequencePlayer?: {
      mount: (
        container: HTMLElement,
        options: {
          intro: string;
          film: string;
          controls?: boolean;
          cover?: boolean;
          fade?: number;
        },
      ) => SequenceHandle;
    };
  }
}

export const PLAYER_SRC = "/motion/player.js";
export const SEQUENCE_SRC = "/motion/_shared/player/sequence-player.js";
export const piece = (id: string) => `/motion/pieces/${id}/index.html`;
export const poster = (id: string) => `/motion/posters/${id}.jpg`;

// Attributes of every player of the page. `controls` is never part of them (a test guards it).
export function playerAttributes(
  src: string,
  clip?: readonly [number, number] | null,
): Record<string, string> {
  return {
    src,
    width: "1920",
    height: "1080",
    autoplay: "",
    muted: "",
    tabindex: "-1",
    ...(clip
      ? { "range-start": String(clip[0]), "range-end": String(clip[1]) }
      : {}),
  };
}

// The sequence player is mounted with these options (controls off, no cover: the page shows its own poster)
export const SEQUENCE_OPTIONS = { controls: false, cover: false } as const;

let load: Promise<void> | null = null;
function script(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(src));
    document.head.appendChild(el);
  });
}
export function ensurePlayer(): Promise<void> {
  load ??= (
    customElements.get("hyperframes-player")
      ? Promise.resolve()
      : script(PLAYER_SRC)
  )
    .then(() => (window.SequencePlayer ? undefined : script(SEQUENCE_SRC)))
    .catch((error) => {
      load = null;
      throw error;
    });
  return load;
}

export function createPlayer(
  src: string,
  clip?: readonly [number, number] | null,
): PlayerElement {
  const el = document.createElement("hyperframes-player");
  for (const [name, value] of Object.entries(playerAttributes(src, clip)))
    el.setAttribute(name, value);
  el.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block";
  return el as PlayerElement;
}

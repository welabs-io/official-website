"use client";
import {
  createElement,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import motionCatalog from "@/lib/motion-catalog.json";
import { coverFilmOf } from "@/lib/brand-cover";
import styles from "./MotionFilm.module.css";

export type MotionItem = (typeof motionCatalog)[number];
type Kind = "business" | "topology" | "journey" | "intro";

// CARREGAMENTO DO PLAYER HYPERFRAMES
// The pinned player registers the <hyperframes-player> custom element once per page; the sequence player of the
// round (_shared/player/sequence-player.js, copied by sync-motion) plays a film's brand intro and then the film.
let playerLoad: Promise<void> | null = null;
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(src));
    document.head.appendChild(script);
  });
}
function loadPlayer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("hyperframes-player") && window.SequencePlayer)
    return Promise.resolve();
  playerLoad ??= (
    customElements.get("hyperframes-player")
      ? Promise.resolve()
      : loadScript("/motion/player.js")
  )
    .then(() =>
      window.SequencePlayer
        ? undefined
        : loadScript("/motion/_shared/player/sequence-player.js"),
    )
    .catch((error) => {
      playerLoad = null;
      throw error;
    });
  return playerLoad;
}

// CONSULTA DO CATÁLOGO DE FILMES E DOS ROTEIROS POR PRODUTO
// A product has either an approved reel (ordered films) or a business overview plus a journey; pages own topology films.
export function filmFor(product: string, kind: Kind): MotionItem | undefined {
  return motionCatalog.find(
    (item) => item.product === product && item.kind === kind,
  );
}

// All overview films of a product (business first, then topology), excluding journeys.
export function overviewFilms(product: string): MotionItem[] {
  const films = motionCatalog.filter(
    (item) => item.product === product && item.kind !== "journey",
  );
  return [
    ...films.filter((f) => f.kind === "business"),
    ...films.filter((f) => f.kind === "topology"),
  ];
}

// Approved reel of a product, in the operator's order; `also` lets a module page reuse its family's films.
export function reelFilms(product: string): MotionItem[] {
  return motionCatalog.filter(
    (item) =>
      item.reel &&
      (item.product === product || (item.also as string[]).includes(product)),
  );
}

// Card cover and share image: the brand intro mapped in lib/brand-intros.json once accepted
// (Welabs products share the company intro); otherwise the first overview film of the product.
export function coverFilm(
  product: string,
  publisher?: string,
): MotionItem | undefined {
  return coverFilmOf(product, publisher);
}

// Poster rendered from the closing brand frame (scripts/generate-motion-posters.mjs): a film that has a brand intro
// shares the intro's poster, so the catalog names the file.
export function posterSrc(item: Pick<MotionItem, "poster">): string {
  return item.poster;
}

// A film belongs to its own page and to any page listed in `also` (know-how reuses Welabs films).
export function filmsForPage(page: string): MotionItem[] {
  return motionCatalog.filter(
    (item) => item.page === page || (item.also as string[]).includes(page),
  );
}

export function filmsByKind(kind: Kind): MotionItem[] {
  return motionCatalog.filter((item) => item.kind === kind);
}

type PlayerElement = HTMLElement & {
  play: () => void;
  seek: (t: number) => void;
  paused: boolean;
  duration: number;
  ready?: boolean;
};

// SEQUÊNCIA ABERTURA E FILME (player de referência da rodada, _shared/player/sequence-player.js)
type SequenceHandle = {
  state: "loading" | "cover" | "intro" | "film" | "ended";
  introPlayer: PlayerElement;
  filmPlayer: PlayerElement;
  play: () => void;
  destroy: () => void;
};
declare global {
  interface Window {
    SequencePlayer?: {
      mount: (
        container: HTMLElement,
        options: { intro: string; film: string; cover?: boolean },
      ) => SequenceHandle;
    };
  }
}

// A film without a brand intro plays in a single player; the ref lets MotionFilm read its play state.
function SinglePlayer({
  src,
  playerRef,
}: {
  src: string;
  playerRef: RefObject<PlayerElement | null>;
}) {
  return createElement("hyperframes-player", {
    ref: playerRef,
    src,
    width: 1920,
    height: 1080,
    controls: true,
    class: styles.player,
  });
}

export function MotionFilm({
  item,
  title,
  label,
}: {
  item: MotionItem;
  title?: string;
  label?: string;
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(true);
  const player = useRef<PlayerElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const sequence = useRef<SequenceHandle | null>(null);
  useEffect(() => {
    loadPlayer().then(
      () => setReady(true),
      () => setFailed(true),
    );
  }, []);
  // A film with a brand intro: the sequence player owns the stage (intro on top of the film, closing frame of the intro
  // as the cover) and starts the film the moment the intro ends.
  useEffect(() => {
    if (!ready || !item.introSrc || !stage.current) return;
    const handle = window.SequencePlayer?.mount(stage.current, {
      intro: item.introSrc,
      film: item.src,
      cover: true,
    });
    if (!handle) {
      setFailed(true);
      return;
    }
    sequence.current = handle;
    return () => {
      handle.destroy();
      sequence.current = null;
    };
  }, [ready, item.id, item.introSrc, item.src]);
  // The player exposes no reliable play/pause event here, so its state is sampled while mounted.
  useEffect(() => {
    if (!ready) return;
    let posterSet = false;
    const timer = window.setInterval(() => {
      const seq = sequence.current;
      if (seq) {
        const active =
          seq.state === "film" || seq.state === "ended"
            ? seq.filmPlayer
            : seq.introPlayer;
        setPaused(
          seq.state === "cover" ||
            seq.state === "ended" ||
            active.paused !== false,
        );
        return;
      }
      const el = player.current;
      if (!el) return;
      // Frame 0 is often an empty opening; show a mid-film frame as the cover until play.
      if (!posterSet && el.ready && el.duration > 0) {
        el.seek(el.duration * 0.45);
        posterSet = true;
      }
      setPaused(el.paused !== false);
    }, 300);
    return () => window.clearInterval(timer);
  }, [ready]);
  // First play starts from the beginning; later plays resume where the viewer paused.
  const started = useRef(false);
  const start = () => {
    if (sequence.current) {
      sequence.current.play();
      return;
    }
    const el = player.current;
    if (!el) return;
    if (!started.current) {
      el.seek(0);
      started.current = true;
    }
    el.play();
  };
  return (
    <figure className={styles.film} aria-label={title ?? item.title}>
      {label && <span className={styles.label}>{label}</span>}
      {/* The frame opens with a mask reveal when it enters the viewport (MotionLayer) */}
      <div className={styles.frame} data-reveal="mask">
        {failed ? (
          <p className={styles.fallback}>Não foi possível carregar o filme.</p>
        ) : ready ? (
          <div className={styles.stage}>
            {item.introSrc && (
              <div key={item.id} ref={stage} className={styles.player} />
            )}
            {!item.introSrc && (
              <SinglePlayer key={item.id} src={item.src} playerRef={player} />
            )}
            {paused && (
              <button
                type="button"
                className={styles.bigPlay}
                onClick={start}
                aria-label={`Reproduzir ${title ?? item.title}`}
                data-magnetic=""
              >
                <span aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <div className={styles.player} aria-busy="true" />
        )}
      </div>
      <figcaption className={styles.caption}>
        <span>{title ?? item.title}</span>
        <span>{Math.round(item.duration)} s · dados DEMO</span>
      </figcaption>
      {/* Commercial line of the film (sync-motion ROUND2 `description`); the brand intro has none */}
      {item.description && (
        <p className={styles.description}>{item.description}</p>
      )}
    </figure>
  );
}

export function MotionGallery({
  items = motionCatalog,
  label,
}: {
  items?: MotionItem[];
  label?: string;
}) {
  const [active, setActive] = useState(items[0]?.id);
  const item = items.find((film) => film.id === active) ?? items[0];
  if (!item) return null;
  return (
    // A multi-film gallery reads as film + chapter index side by side on wide screens.
    <div
      className={`${styles.gallery} ${items.length > 1 ? styles.withIndex : ""}`}
    >
      <MotionFilm item={item} label={label} />
      {items.length > 1 && (
        <ul className={styles.list} aria-label={label ?? "Filmes"}>
          {items.map((film, index) => (
            <li key={film.id}>
              <button
                type="button"
                aria-pressed={film.id === item.id}
                onClick={() => setActive(film.id)}
              >
                <em aria-hidden="true">{String(index + 1).padStart(2, "0")}</em>
                <strong>{film.title}</strong>
                <span>{Math.round(film.duration)} s</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

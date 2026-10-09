"use client";
// CARROSSEL DE MOTION
// A 16:9 frame (no bar, no button) that plays our own pieces on its own: a list of slides, each one an opening, a film
// clip, or an opening followed by a film clip (the sequence player of the round). When a slide ends the reel asks for
// the next one; with a single slide it runs again. The page controller decides when the frame is live (visible enough,
// at most two at once, never under reduced motion); outside that the frame shows the cover image of the slide.
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { getController } from "./motion-store";
import { SEQUENCE_OPTIONS, createPlayer, ensurePlayer, piece } from "./player";
import type { Slide } from "@/lib/motion-slides";
import styles from "./reel.module.css";

const END_MARGIN = 0.12;

// PLAYER ÚNICO
// One player: an opening alone or a film (clip). `end` fires once, when the piece ends or the clip range closes.
function mountSingle(
  host: HTMLElement,
  slide: Slide,
  end: () => void,
  shown: () => void,
) {
  const src = piece((slide.intro ?? slide.film)!);
  const clip = slide.intro ? null : (slide.clip ?? null);
  const player = createPlayer(src, clip);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    end();
  };
  const onReady = () => {
    shown();
    player.play?.();
  };
  const onTime = () => {
    if (clip && player.currentTime >= clip[1] - END_MARGIN) finish();
  };
  player.addEventListener("ready", onReady);
  player.addEventListener("ended", finish);
  player.addEventListener("timeupdate", onTime);
  host.appendChild(player);
  return () => {
    player.removeEventListener("ready", onReady);
    player.removeEventListener("ended", finish);
    player.removeEventListener("timeupdate", onTime);
  };
}

// SEQUÊNCIA ABERTURA E FILME
// The sequence player stacks the film under the opening and hands over when the opening ends. The film clip range is
// set on the film player; `time` reports the film time (s) while the film plays and -1 during the opening.
function mountSequence(
  host: HTMLElement,
  slide: Slide,
  end: () => void,
  shown: () => void,
  time: (t: number) => void,
) {
  const seq = window.SequencePlayer!.mount(host, {
    intro: piece(slide.intro!),
    film: piece(slide.film!),
    ...SEQUENCE_OPTIONS,
  });
  const clip = slide.clip ?? null;
  if (clip) {
    seq.filmPlayer.setAttribute("range-start", String(clip[0]));
    seq.filmPlayer.setAttribute("range-end", String(clip[1]));
  }
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    end();
  };
  seq.introPlayer.addEventListener("ready", () => {
    shown();
    seq.play();
  });
  host.addEventListener("sequence:ended", finish);
  const timer = window.setInterval(() => {
    const inFilm = seq.state === "film";
    const t = inFilm ? seq.filmPlayer.currentTime : -1;
    time(t);
    if (clip && inFilm && t >= clip[1] - END_MARGIN) finish();
  }, 120);
  return () => {
    window.clearInterval(timer);
    host.removeEventListener("sequence:ended", finish);
    seq.destroy();
  };
}

export function Reel({
  id,
  slides,
  index,
  onIndex,
  onFilmTime,
  eager = false,
  className,
}: {
  id: string;
  slides: readonly Slide[];
  index: number;
  onIndex?: (next: number) => void;
  // Film time (s) while the film plays, -1 during the opening, null when the frame is not playing
  onFilmTime?: (t: number | null) => void;
  eager?: boolean;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [everReady, setEverReady] = useState(false);
  const [run, setRun] = useState(0);
  const slide = slides[index] ?? slides[0];

  // Effect events read the latest props without restarting the playback
  const advance = useEffectEvent(() => {
    if (slides.length > 1) onIndex?.((index + 1) % slides.length);
    else setRun((n) => n + 1);
  });
  const report = useEffectEvent((t: number | null) => onFilmTime?.(t));

  // Register the frame with the page controller; mount/unmount only flip the live flag
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    return getController().register({
      id,
      element,
      mount: () => setLive(true),
      unmount: () => {
        setLive(false);
        setEverReady(false);
      },
      play: () => {},
      pause: () => {},
    });
  }, [id]);

  // Playback of the current slide while the frame is live
  useEffect(() => {
    const element = host.current;
    if (!live || !element) return;
    let dead = false;
    let stop = () => {};
    const shown = () => {
      setReady(true);
      setEverReady(true);
    };
    ensurePlayer().then(
      () => {
        if (dead) return;
        stop =
          slide.intro && slide.film
            ? mountSequence(element, slide, advance, shown, report)
            : mountSingle(element, slide, advance, shown);
      },
      () => {},
    );
    return () => {
      dead = true;
      stop();
      element.innerHTML = "";
      setReady(false);
      report(null);
    };
  }, [live, slide, run]);

  const showPoster = !(live && everReady);
  return (
    <div
      ref={box}
      className={`${styles.stage} ${className ?? ""}`}
      data-stage={id}
      data-live={live ? "true" : "false"}
      aria-hidden="true"
    >
      <img
        className={styles.poster}
        src={slide.poster}
        alt=""
        width={1280}
        height={720}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ opacity: showPoster ? 1 : 0 }}
      />
      <div
        ref={host}
        className={styles.host}
        data-ready={ready ? "true" : "false"}
      />
    </div>
  );
}

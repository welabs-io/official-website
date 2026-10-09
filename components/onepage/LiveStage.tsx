"use client";
// PALCO DE MOTION VIVO
// A 16:9 stage that shows a poster and, while the motion controller allows it, a <hyperframes-player autoplay loop
// muted> without controls on top. The motion is decorative: the stage is aria-hidden and all information lives in text.
import { useCallback, useEffect, useRef, useState } from "react";
import { getController } from "./motion-store";
import styles from "./onepage.module.css";

type PlayerElement = HTMLElement & {
  play?: () => void;
  pause?: () => void;
  seek?: (t: number) => void;
  ready?: boolean;
};

// The pinned HyperFrames player registers its custom element once per page
let playerLoad: Promise<void> | null = null;
export function ensurePlayer(): Promise<void> {
  if (customElements.get("hyperframes-player")) return Promise.resolve();
  playerLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/motion/player.js";
    script.onload = () => resolve();
    script.onerror = () => {
      playerLoad = null;
      reject(new Error("player"));
    };
    document.head.appendChild(script);
  });
  return playerLoad;
}

export type StageProps = {
  id: string;
  src: string;
  poster: string;
  // Clip of a longer film: [start, end] in seconds, played in loop through range-start/range-end
  clip?: readonly [number, number] | null;
  className?: string;
  // Stage hidden by CSS on some viewports never intersects, so the controller never mounts it
  label?: string;
};

export function LiveStage({
  id,
  src,
  poster,
  clip,
  className,
  label,
}: StageProps) {
  const box = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerElement | null>(null);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  // Callback ref keeps the element in a ref for the controller's play/pause without reading it during render
  const setPlayer = useCallback((el: PlayerElement | null) => {
    player.current = el;
  }, []);

  // Register the stage with the page controller; mount/unmount only flip the player on and off
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    return getController().register({
      id,
      element,
      mount: () => {
        void ensurePlayer();
        setLive(true);
      },
      unmount: () => {
        setLive(false);
        setReady(false);
      },
      play: () => player.current?.play?.(),
      pause: () => player.current?.pause?.(),
    });
  }, [id]);

  // The player fades in only once its first frame exists, so the poster never flashes black
  useEffect(() => {
    const el = player.current;
    if (!live || !el) return;
    const done = () => setReady(true);
    if (el.ready) queueMicrotask(done);
    el.addEventListener("ready", done);
    return () => el.removeEventListener("ready", done);
  }, [live]);

  return (
    <div
      ref={box}
      className={`${styles.stage} ${className ?? ""}`}
      data-live={live ? "true" : "false"}
      data-stage={id}
      aria-hidden="true"
    >
      <img
        className={styles.stagePoster}
        src={poster}
        alt=""
        width={1920}
        height={1080}
        loading="lazy"
        decoding="async"
      />
      {live && (
        <hyperframes-player
          ref={setPlayer}
          src={src}
          width={1920}
          height={1080}
          autoplay
          loop
          muted
          range-start={clip?.[0]}
          range-end={clip?.[1]}
          tabIndex={-1}
          title={label ?? ""}
          className={styles.stagePlayer}
          data-ready={ready ? "true" : "false"}
        />
      )}
    </div>
  );
}

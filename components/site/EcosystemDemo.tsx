"use client";

// UMA SOLICITAÇÃO ATRAVESSA A CADEIA
// The composition's real clock owns every chapter; native captions and responsive posters keep the story accessible.
import {
  createPlayer,
  ensurePlayer,
  hideLoader,
  type PlayerElement,
} from "@/components/ring/player";
import {
  ECOSYSTEM_DURATION,
  ECOSYSTEM_PLAYBACK_RATE,
  ECOSYSTEM_PHASES,
  ECOSYSTEM_REQUEST,
  ECOSYSTEM_VARIANTS,
  ecosystemPhaseAt,
  ecosystemPoster,
  ecosystemSource,
} from "@/lib/ecosystem-motion";
import styles from "./ecosystem-demo.module.css";

const attachEcosystem = (root: HTMLDivElement | null) => {
  if (!root) return;
  const viewport = root.querySelector<HTMLElement>("[data-motion-viewport]")!;
  const layers = root.querySelector<HTMLElement>("[data-chain-layer]")!;
  const image = root.querySelector<HTMLImageElement>("[data-chain-poster]")!;
  const mobileImage = root.querySelector<HTMLSourceElement>("source")!;
  const markers = [
    ...root.querySelectorAll<HTMLElement>("[data-chain-marker]"),
  ];
  const captions = [
    ...root.querySelectorAll<HTMLElement>("[data-chain-caption]"),
  ];
  const owner = root.querySelector<HTMLElement>("[data-chain-owner]")!;
  const compact = window.matchMedia("(max-width: 700px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let player: PlayerElement | null = null;
  let visible = false;
  let dead = false;
  let loading = false;
  let generation = 0;
  let phaseIndex = 0;
  let selectedTime = 0;
  let timeout = 0;
  const variant = () =>
    compact.matches ? ECOSYSTEM_VARIANTS.mobile : ECOSYSTEM_VARIANTS.desktop;
  const wantsMotion = () =>
    visible && !document.hidden && !reduced.matches && !dead;

  const show = (index: number) => {
    phaseIndex = index;
    const phase = ECOSYSTEM_PHASES[index];
    root.dataset.chainPhase = phase.key;
    root.dataset.reducedMotion = String(reduced.matches);
    owner.textContent = reduced.matches
      ? "Os cinco produtos em sequência"
      : phase.owner;
    image.src = ecosystemPoster(ECOSYSTEM_VARIANTS.desktop.id, phase.key);
    mobileImage.srcset = ecosystemPoster(
      ECOSYSTEM_VARIANTS.mobile.id,
      phase.key,
    );
    captions.forEach((caption, i) => {
      // A static visit must still explain the complete operation without requiring chapter selection.
      caption.hidden = !reduced.matches && i !== index;
    });
    markers.forEach((marker, i) => {
      marker.dataset.active = String(i === index);
      if (i === index) marker.setAttribute("aria-current", "step");
      else marker.removeAttribute("aria-current");
    });
  };
  const removePlayer = () => {
    generation++;
    loading = false;
    window.clearTimeout(timeout);
    player?.pause();
    player?.remove();
    player = null;
    root.dataset.chainReady = "false";
    delete root.dataset.chainTime;
    delete root.dataset.sourceTime;
  };
  const start = () => {
    if (!wantsMotion()) {
      player?.pause();
      return;
    }
    if (player?.ready) {
      player.play();
      return;
    }
    if (player || loading) return;
    loading = true;
    const request = ++generation;
    ensurePlayer().then(
      () => {
        if (dead || request !== generation || !wantsMotion()) {
          loading = false;
          return;
        }
        loading = false;
        const format = variant();
        const current = createPlayer(
          ecosystemSource(format.id),
          [0, ECOSYSTEM_DURATION],
          false,
          ECOSYSTEM_PLAYBACK_RATE,
        );
        current.setAttribute("width", String(format.width));
        current.setAttribute("height", String(format.height));
        current.setAttribute("aria-hidden", "true");
        current.style.opacity = "0";
        player = current;
        root.dataset.chainVariant = compact.matches ? "mobile" : "desktop";
        let painted = false;
        const ready = () => {
          if (dead || player !== current || painted) return;
          painted = true;
          window.clearTimeout(timeout);
          hideLoader(current);
          current.pause();
          current.seek(selectedTime);
          // The pinned player applies the rate reliably after its source timeline becomes ready.
          current.playbackRate = ECOSYSTEM_PLAYBACK_RATE;
          // Paint the actual composition before removing its operational fallback.
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (dead || player !== current) return;
              current.style.opacity = "1";
              root.dataset.chainReady = "true";
              if (wantsMotion()) current.play();
            }),
          );
        };
        current.addEventListener("ready", ready, { once: true });
        layers.appendChild(current);
        if (current.ready) ready();
        timeout = window.setTimeout(() => {
          if (player === current && !current.ready) {
            removePlayer();
            root.dataset.chainUnavailable = "true";
          }
        }, 8000);
      },
      () => {
        if (request === generation) loading = false;
        root.dataset.chainUnavailable = "true";
      },
    );
  };
  const tick = window.setInterval(() => {
    if (!player?.ready || !wantsMotion()) return;
    const time = player.currentTime;
    root.dataset.chainTime = time.toFixed(3);
    // DOM telemetry records the source timeline rather than assuming that a moving player means a moving scene.
    try {
      const frame = player.shadowRoot?.querySelector("iframe");
      const sourceWindow = frame?.contentWindow as
        | (Window & { __timelines?: Record<string, { time: () => number }> })
        | null;
      const timeline = Object.values(sourceWindow?.__timelines ?? {})[0];
      if (timeline) root.dataset.sourceTime = timeline.time().toFixed(3);
    } catch {
      delete root.dataset.sourceTime;
    }
    const next = ecosystemPhaseAt(time);
    if (next !== phaseIndex) show(next);
    if (time >= ECOSYSTEM_DURATION - 0.06) {
      selectedTime = 0;
      player.seek(0);
      player.play();
      show(0);
    }
  }, 100);
  const visibility = () => start();
  const preference = () => {
    removePlayer();
    show(phaseIndex);
    start();
  };
  const formatChange = () => {
    selectedTime = player?.currentTime ?? selectedTime;
    removePlayer();
    start();
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
      start();
    },
    { threshold: [0, 0.55, 1], rootMargin: "-84px 0px 0px" },
  );
  observer.observe(viewport);
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", preference);
  compact.addEventListener("change", formatChange);
  show(0);
  return () => {
    dead = true;
    observer.disconnect();
    window.clearInterval(tick);
    removePlayer();
    document.removeEventListener("visibilitychange", visibility);
    reduced.removeEventListener("change", preference);
    compact.removeEventListener("change", formatChange);
  };
};

export function EcosystemDemo() {
  return (
    <div
      ref={attachEcosystem}
      className={styles.root}
      data-ecosystem-demo
      data-chain-ready="false"
      data-chain-phase="arrival"
      role="region"
      aria-label="Uma solicitação de Marina atravessa os cinco produtos"
    >
      <div className={styles.header}>
        <span className={styles.customer}>Marina · Pedido 1234</span>
        <div className={styles.example}>
          <span className={styles.owner} data-chain-owner>
            {ECOSYSTEM_PHASES[0].owner}
          </span>
          <span>Demonstração ilustrativa</span>
        </div>
      </div>
      <ol
        className={styles.navigation}
        aria-label="Sequência automática da operação"
      >
        {ECOSYSTEM_PHASES.map((phase, index) => (
          <li key={phase.key}>
            <span
              data-chain-marker={index}
              data-active={index === 0 ? "true" : "false"}
              aria-current={index === 0 ? "step" : undefined}
            >
              {phase.label}
            </span>
          </li>
        ))}
      </ol>
      <div
        className={styles.viewport}
        data-motion-viewport
        aria-hidden="true"
        inert
      >
        <picture className={styles.poster}>
          <source
            media="(max-width: 700px)"
            srcSet={ecosystemPoster(ECOSYSTEM_VARIANTS.mobile.id, "arrival")}
          />
          <img
            src={ecosystemPoster(ECOSYSTEM_VARIANTS.desktop.id, "arrival")}
            data-chain-poster
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
          />
        </picture>
        <div className={styles.layer} data-chain-layer />
      </div>
      <div className={styles.caption}>
        {ECOSYSTEM_PHASES.map((phase, index) => (
          <div
            key={phase.key}
            data-chain-caption={phase.key}
            hidden={index !== 0}
          >
            <h3>{phase.title}</h3>
            <p>{phase.body}</p>
          </div>
        ))}
        <p className={styles.request}>“{ECOSYSTEM_REQUEST}”</p>
      </div>
    </div>
  );
}

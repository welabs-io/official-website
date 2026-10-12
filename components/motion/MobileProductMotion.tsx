"use client";

// NARRATIVA PRÓPRIA PARA A TELA DO CELULAR
// A native portrait composition owns the clock and chapter captions; desktop sources remain independent.
import {
  createPlayer,
  ensurePlayer,
  hideLoader,
  type PlayerElement,
} from "@/components/ring/player";
import { getProductMotionPlan } from "@/lib/product-motion-plans";
import {
  getMobileProductMotion,
  mobileProductPoster,
  mobileProductSource,
} from "@/lib/mobile-product-motion";
import { PRODUCTS, type ProductSlug } from "@/lib/products";
import styles from "./mobile-product-motion.module.css";

function bindMobileStory(root: HTMLDivElement | null) {
  if (!root) return;
  const slug = root.dataset.mobileProductMotion as ProductSlug;
  const mode = root.dataset.mode;
  const source = getMobileProductMotion(slug);
  const chapters =
    mode === "overview" ? source.chapters.slice(0, 1) : source.chapters;
  const end = mode === "overview" ? chapters[0].end : source.duration;
  const viewport = root.querySelector<HTMLElement>("[data-motion-viewport]")!;
  const layers = root.querySelector<HTMLElement>("[data-mobile-layer]")!;
  const poster = root.querySelector<HTMLImageElement>("[data-mobile-poster]")!;
  const captions = [
    ...root.querySelectorAll<HTMLElement>("[data-mobile-caption]"),
  ];
  const markers = [
    ...root.querySelectorAll<HTMLElement>("[data-mobile-marker]"),
  ];
  const compact = window.matchMedia("(max-width: 700px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let player: PlayerElement | null = null;
  let visible = false;
  let dead = false;
  let pending = false;
  let generation = 0;
  let index = 0;
  let clock = 0;
  let timeout = 0;
  const wanted = () =>
    visible && compact.matches && !reduced.matches && !document.hidden && !dead;
  const show = (next: number) => {
    index = next;
    root.dataset.chapter = chapters[index].key;
    root.dataset.reducedMotion = String(reduced.matches);
    poster.src = mobileProductPoster(source.id, chapters[index].key);
    captions.forEach((caption, i) => {
      caption.hidden = !reduced.matches && i !== index;
    });
    markers.forEach((marker, i) => {
      marker.dataset.current = String(i === index);
    });
  };
  const remove = () => {
    generation++;
    pending = false;
    window.clearTimeout(timeout);
    if (player?.ready) clock = player.currentTime;
    player?.pause();
    player?.remove();
    player = null;
    root.dataset.ready = "false";
  };
  const reconcile = () => {
    if (!wanted()) {
      player?.pause();
      return;
    }
    if (player?.ready) {
      player.play();
      return;
    }
    if (player || pending) return;
    pending = true;
    const request = ++generation;
    ensurePlayer().then(
      () => {
        if (dead || request !== generation || !wanted()) {
          pending = false;
          return;
        }
        pending = false;
        // Native range looping prevents an overview from briefly painting the following scenario.
        const current = createPlayer(
          mobileProductSource(source.id),
          [0, end],
          false,
          1,
          true,
        );
        current.setAttribute("width", "1080");
        current.setAttribute("height", "1350");
        current.setAttribute("aria-hidden", "true");
        current.style.opacity = "0";
        player = current;
        let painted = false;
        const ready = () => {
          if (dead || player !== current || painted) return;
          painted = true;
          window.clearTimeout(timeout);
          hideLoader(current);
          current.pause();
          current.seek(Math.min(clock, end - 0.1));
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (dead || player !== current) return;
              current.style.opacity = "1";
              root.dataset.ready = "true";
              if (wanted()) current.play();
            }),
          );
        };
        current.addEventListener("ready", ready, { once: true });
        layers.appendChild(current);
        if (current.ready) ready();
        timeout = window.setTimeout(() => {
          if (player === current && !current.ready) remove();
        }, 8000);
      },
      () => {
        if (request === generation) pending = false;
      },
    );
  };
  const tick = window.setInterval(() => {
    if (!player?.ready || !wanted()) return;
    const time = player.currentTime;
    root.dataset.mobileTime = time.toFixed(3);
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
    const next = Math.max(
      0,
      chapters.findLastIndex((chapter) => time >= chapter.start),
    );
    if (next !== index) show(next);
    if (time >= end - 0.06) {
      clock = 0;
      player.seek(0);
      player.play();
      show(0);
    }
  }, 100);
  const preference = () => {
    remove();
    show(index);
    reconcile();
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
      reconcile();
    },
    { rootMargin: "-84px 0px 0px", threshold: [0, 0.55, 1] },
  );
  observer.observe(viewport);
  compact.addEventListener("change", preference);
  reduced.addEventListener("change", preference);
  document.addEventListener("visibilitychange", reconcile);
  show(0);
  return () => {
    dead = true;
    observer.disconnect();
    window.clearInterval(tick);
    remove();
    compact.removeEventListener("change", preference);
    reduced.removeEventListener("change", preference);
    document.removeEventListener("visibilitychange", reconcile);
  };
}

export function MobileProductMotion({
  slug,
  mode,
}: {
  slug: ProductSlug;
  mode: "overview" | "story";
}) {
  const source = getMobileProductMotion(slug);
  const plan = getProductMotionPlan(slug);
  const chapters =
    mode === "overview" ? plan.chapters.slice(0, 1) : plan.chapters;
  return (
    <div
      ref={bindMobileStory}
      className={styles.root}
      data-mobile-product-motion={slug}
      data-mode={mode}
      data-ready="false"
      role="region"
      aria-label={`${PRODUCTS.find((product) => product.slug === slug)!.name}: demonstração automática para celular`}
    >
      <div
        className={styles.viewport}
        data-motion-viewport
        aria-hidden="true"
        inert
      >
        <img
          className={styles.poster}
          data-mobile-poster
          src={mobileProductPoster(source.id, chapters[0].key)}
          alt=""
          width={1080}
          height={1350}
          loading="lazy"
        />
        <div className={styles.layer} data-mobile-layer />
      </div>
      {mode === "story" && (
        <>
          <div className={styles.progress} aria-hidden="true">
            {chapters.map((chapter, i) => (
              <span
                key={chapter.key}
                data-mobile-marker
                data-current={String(i === 0)}
              />
            ))}
          </div>
          <div className={styles.detail}>
            {chapters.map((chapter, i) => (
              <div
                key={chapter.key}
                data-mobile-caption={chapter.key}
                hidden={i !== 0}
              >
                <span className={styles.sequence}>
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(chapters.length).padStart(2, "0")}
                </span>
                <h3>{chapter.title}</h3>
                <p>{chapter.body}</p>
                <p className={styles.scenario}>{chapter.scenario}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

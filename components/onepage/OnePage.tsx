"use client";
// PÁGINA ÚNICA /new (PRÉVIA)
// Seven sections, one idea per screen, alternating graphite and cream bands. The product moves on its own inside the
// block (see LiveStage and motion-controller); the chain section is driven by scrolling. Copy follows the operator's
// approved structure of 2026-10-09; the only call to action is "Conversar com a Welabs".
import { useEffect, useRef, useSyncExternalStore } from "react";
import { ByWelabs } from "../ByWelabs";
import { imagineContactHref } from "@/lib/sister-site";
import motionData from "@/lib/onepage-motion.json";
import { HubLive } from "./HubLive";
import { LiveStage } from "./LiveStage";
import {
  getPausedServerSnapshot,
  getPausedSnapshot,
  setMotionPaused,
  subscribePaused,
} from "./motion-store";
import styles from "./onepage.module.css";

// Pieces synced by scripts/sync-onepage-motion.mjs
const motion = motionData as unknown as {
  intros: Record<string, { src: string; poster: string }>;
  films: Record<
    string,
    {
      src: string;
      poster: string;
      clip: [number, number];
      beats: number[];
      scrub: [number, number];
      beatPosters: string[];
    }
  >;
};

const CTA_LABEL = "Conversar com a Welabs";
const CTA_SUPPORT =
  "Conte o que sua empresa precisa. A gente mostra como os produtos se encaixam.";

// The contact form belongs to the Imagine site; without it configured the CTA falls back to the closing section
const contactHref = () => imagineContactHref() ?? "#contato";

// CABEÇALHO FIXO
// Logo, anchors, the pause control (WCAG 2.2.2) and the single CTA; a 4 px amber bar shows the scroll progress.
function Header({ paused }: { paused: boolean }) {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.current?.style.setProperty("--p", String(p));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <header className={styles.header}>
      <span ref={bar} className={styles.progress} aria-hidden="true" />
      <div className={styles.headerInner}>
        <a href="#top" className={styles.brand} aria-label="Welabs, início">
          <img
            src="/brands/welabs/welabs-logo-dark.svg"
            alt="Welabs"
            height={26}
          />
        </a>
        <nav className={styles.nav} aria-label="Seções">
          <a href="#domus">Núcleo</a>
          <a href="#trilhos">Trilhos</a>
          <a href="#cadeia">Cadeia</a>
          <a href="#welabs">A Welabs</a>
        </nav>
        <button
          type="button"
          className={styles.pause}
          onClick={() => setMotionPaused(!paused)}
        >
          <span className={styles.pauseIcon} aria-hidden="true">
            {paused ? "▶" : "❚❚"}
          </span>
          <span>{paused ? "Retomar animações" : "Pausar animações"}</span>
        </button>
        <a href={contactHref()} className={styles.cta}>
          {CTA_LABEL}
        </a>
      </div>
    </header>
  );
}

// SEÇÃO 1: ABERTURA COM O HUB
function Hero() {
  return (
    <section
      id="top"
      className={`${styles.band} ${styles.dark} ${styles.hero}`}
    >
      <div className={styles.wrap}>
        <div className={styles.heroText}>
          <h1>Ideias que viram ferramentas de trabalho.</h1>
          <p className={styles.lead}>
            Domus
            <ByWelabs /> define. Os outros dão vida.
          </p>
        </div>
        <HubLive />
      </div>
    </section>
  );
}

// SEÇÕES 2 E 3: NÚCLEO, DOMUS E RELLOO
// Same block for both: text and the product opening on one side, the film clip (desktop only) on the other.
type CoreProps = {
  id: string;
  tone: "light" | "dark";
  flip?: boolean;
  eyebrow: React.ReactNode;
  title: string;
  lead: string;
  intro: { src: string; poster: string };
  clip: { src: string; poster: string; range: readonly [number, number] };
};
function CoreSection({
  id,
  tone,
  flip,
  eyebrow,
  title,
  lead,
  intro,
  clip,
}: CoreProps) {
  return (
    <section
      id={id}
      className={`${styles.band} ${styles[tone]} ${styles.core}`}
    >
      <div
        className={`${styles.wrap} ${styles.coreGrid} ${flip ? styles.flip : ""}`}
      >
        <div className={styles.coreText}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2>{title}</h2>
          <p className={styles.lead}>{lead}</p>
          <LiveStage
            id={`${id}-intro`}
            className={styles.introStage}
            src={intro.src}
            poster={intro.poster}
          />
        </div>
        {/* The clip is too small to read on a phone: the stage is hidden there, so it never mounts */}
        <figure className={styles.clipFigure}>
          <LiveStage
            id={`${id}-clip`}
            src={clip.src}
            poster={clip.poster}
            clip={clip.range}
          />
          <figcaption>Trecho do filme. Os dados são fictícios.</figcaption>
        </figure>
      </div>
    </section>
  );
}

// SEÇÃO 4: TRILHOS
// Magneto, Tuner and Knowly: one row each, the product opening in loop and its phrase as the heading. The amber
// connector on the left runs back to the core and lights up while the row's opening is live.
const RAILS = [
  {
    key: "magneto",
    name: "Magneto",
    title: "Do jeito que você explica, ele automatiza.",
    lead: "Planilha, e-mail e lembrete viram um fluxo em blocos, sem programar.",
  },
  {
    key: "tuner",
    name: "Tuner",
    title: "Todo canal, uma conversa só.",
    lead: "WhatsApp, voz e chat do site chegam do mesmo jeito, prontos para o Relloo.",
  },
  {
    key: "knowly",
    name: "Knowly",
    title: "Não é só memória, é conhecimento.",
    lead: "Documentos, reuniões e tickets viram respostas, com a fonte de cada frase.",
  },
];
function Rails() {
  return (
    <section
      id="trilhos"
      className={`${styles.band} ${styles.light} ${styles.rails}`}
    >
      <div className={styles.wrap}>
        <span className={styles.eyebrow}>Trilhos</span>
        <div className={styles.railList}>
          {RAILS.map((r) => (
            <article key={r.key} className={styles.railRow}>
              <span className={styles.connector} aria-hidden="true" />
              <div className={styles.railText}>
                <span className={styles.eyebrow}>
                  {r.name}
                  <ByWelabs />
                </span>
                <h2>{r.title}</h2>
                <p className={styles.lead}>{r.lead}</p>
              </div>
              <LiveStage
                id={`rail-${r.key}`}
                src={motion.intros[r.key].src}
                poster={motion.intros[r.key].poster}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OnePage() {
  const paused = useSyncExternalStore(
    subscribePaused,
    getPausedSnapshot,
    getPausedServerSnapshot,
  );
  return (
    <div
      id="onepage-root"
      className={styles.page}
      data-motion={paused ? "paused" : "playing"}
    >
      <Header paused={paused} />
      <Hero />
      <CoreSection
        id="domus"
        tone="light"
        eyebrow="Domus"
        title="A empresa inteira numa casa."
        lead="Telas, regras e fluxos nascem do Domus. O que você define uma vez vale para a empresa inteira."
        intro={motion.intros.domus}
        clip={{ ...motion.films.domus, range: motion.films.domus.clip }}
      />
      <CoreSection
        id="relloo"
        tone="dark"
        flip
        eyebrow={
          <>
            Relloo
            <ByWelabs />
          </>
        }
        title="Do primeiro “oi” ao fechamento."
        lead="Atender e vender na mesma conversa. A pessoa chega por qualquer canal e segue com a história inteira, até o fechamento."
        intro={motion.intros.relloo}
        clip={{ ...motion.films.relloo, range: motion.films.relloo.clip }}
      />
      <Rails />
      <p className={styles.support} hidden>
        {CTA_SUPPORT}
      </p>
    </div>
  );
}

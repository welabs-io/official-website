"use client";
// PÁGINA ÚNICA /new (PRÉVIA)
// Seven sections, one idea per screen, alternating graphite and cream bands. The product moves on its own inside the
// block (see LiveStage and motion-controller); the chain section is driven by scrolling. Copy follows the operator's
// approved structure of 2026-10-09; the only call to action is "Conversar com a Welabs".
import { useEffect, useRef, useSyncExternalStore } from "react";
import { ByWelabs } from "../ByWelabs";
import { imagineContactHref } from "@/lib/sister-site";
import { HubLive } from "./HubLive";
import {
  getPausedServerSnapshot,
  getPausedSnapshot,
  setMotionPaused,
  subscribePaused,
} from "./motion-store";
import styles from "./onepage.module.css";

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
      <p className={styles.support} hidden>
        {CTA_SUPPORT}
      </p>
    </div>
  );
}

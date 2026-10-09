"use client";
// MOLDURA DA PÁGINA
// Fixed header (logo, pause control, the single call to action), the closing section with the call to action and the
// footer. The root carries data-motion so CSS-only motion (connectors, marquees) stops when the page is paused.
import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { CTA_LABEL, WELABS_LOGO } from "@/lib/products";
import {
  getPausedServerSnapshot,
  getPausedSnapshot,
  setMotionPaused,
  subscribePaused,
} from "./motion-store";
import styles from "./shell.module.css";

// The contact destination is still to be decided: for now the call to action points to the closing section
const CONTACT_HREF = "#contact";

function Header({ paused, home }: { paused: boolean; home: boolean }) {
  const bar = useRef<HTMLSpanElement>(null);
  // A 4 px amber bar shows the scroll progress
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
        <Link
          href={home ? "#top" : "/"}
          className={styles.brand}
          aria-label="Welabs, início"
        >
          <img src={WELABS_LOGO.dark} alt="Welabs" height={26} />
        </Link>
        <button
          type="button"
          className={styles.pause}
          aria-pressed={paused}
          aria-label={paused ? "Retomar animações" : "Pausar animações"}
          onClick={() => setMotionPaused(!paused)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            {paused ? (
              <path d="M4 2l10 6-10 6z" />
            ) : (
              <path d="M3 2h4v12H3zM9 2h4v12H9z" />
            )}
          </svg>
        </button>
        <a href={CONTACT_HREF} className={styles.cta}>
          {CTA_LABEL}
        </a>
      </div>
    </header>
  );
}

// SEÇÃO 7: CTA E RODAPÉ
function Closing() {
  return (
    <>
      <section
        id="contact"
        className={`${styles.band} ${styles.dark} ${styles.closing}`}
        aria-label="Contato"
      >
        <a href={CONTACT_HREF} className={`${styles.cta} ${styles.ctaBig}`}>
          {CTA_LABEL}
        </a>
      </section>
      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerGrid}`}>
          <img src={WELABS_LOGO.dark} alt="Welabs" height={28} />
          <p>© 2026 Welabs</p>
        </div>
      </footer>
    </>
  );
}

export function PageFrame({
  home = false,
  children,
}: {
  home?: boolean;
  children: React.ReactNode;
}) {
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
      <Header paused={paused} home={home} />
      {children}
      <Closing />
    </div>
  );
}

"use client";
// CARROSSEL DE LOGOS EM PRETO E BRANCO
// A slow marquee that runs only while it is on screen; the second copy of the list exists only to close the loop
// (aria-hidden). Under prefers-reduced-motion CSS turns it into one wrapped row.
import { useEffect, useRef, useState } from "react";
import styles from "./logos.module.css";

type Logo = { name: string; src: string; h: number };

export function Carousel({
  label,
  logos,
  kind,
  tone,
  seconds,
}: {
  label: string;
  logos: readonly Logo[];
  kind: "clients" | "platforms";
  tone: "light" | "dark";
  seconds: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const set = (copy: number) => (
    <ul className={styles.set} aria-hidden={copy > 0 ? true : undefined}>
      {logos.map((l) => (
        <li key={l.name}>
          <img
            src={l.src}
            alt={copy > 0 ? "" : l.name}
            height={l.h}
            style={{ height: l.h }}
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );
  return (
    <div
      ref={ref}
      className={`${styles.carousel} ${styles[kind]} ${styles[tone]}`}
      data-on={on ? "true" : "false"}
      style={{ "--dur": `${seconds}s` } as React.CSSProperties}
      role="region"
      aria-label={label}
    >
      <span className={styles.label}>{label}</span>
      <div className={styles.window}>
        <div className={styles.track}>
          {set(0)}
          {set(1)}
        </div>
      </div>
    </div>
  );
}

// CARROSSEL DE LOGOS EM PRETO E BRANCO
// A slow marquee (white marks on the graphite band, one theme for clients and platforms). Server markup only: it runs
// while `data-on` is "true", which LiveObserver sets for the elements marked `data-live` that are on screen. The second
// copy of the list exists only to close the loop (aria-hidden). Under prefers-reduced-motion CSS turns it into one
// scrollable still strip, keeping the closing compact while every mark remains reachable.
import styles from "./logos.module.css";

type Logo = { name: string; src: string; h: number };

export function Carousel({
  label,
  logos,
  kind,
  seconds,
}: {
  label: string;
  logos: readonly Logo[];
  // "all" is one strip with both kinds of mark, without a visible label
  kind: "clients" | "platforms" | "all";
  seconds: number;
}) {
  const set = (copy: number) => (
    <ul className={styles.set} aria-hidden={copy > 0 ? true : undefined}>
      {logos.map((l) => (
        <li key={l.name}>
          <img
            src={l.src}
            alt={copy > 0 ? "" : l.name}
            height={Math.min(l.h, 34)}
            style={{ height: Math.min(l.h, 34) }}
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className={`${styles.carousel} ${styles[kind]}`}
      data-live
      data-on="false"
      style={{ "--dur": `${seconds}s` } as React.CSSProperties}
      role="region"
      aria-label={label}
    >
      {kind !== "all" && <span className={styles.label}>{label}</span>}
      <div
        className={styles.window}
        tabIndex={0}
        aria-label="Marcas e plataformas, faixa horizontal"
      >
        <div className={styles.track}>
          {set(0)}
          {set(1)}
        </div>
      </div>
    </div>
  );
}

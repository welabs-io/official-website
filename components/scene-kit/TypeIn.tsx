// DIGITAÇÃO DO KIT: TEXTO RESERVADO E INDICADOR "DIGITANDO"
// TypeIn types a phrase the way the reference does (khal-map/mapa.md §2.1, brief-v4): the whole text is in the layout
// from the first frame and what is still to come is invisible, so the bubble that holds it never grows in jerks (its
// box is the same while typing and after). Each character shows ~18 ms after the one before it (--type-char), with a
// caret after the last one shown, which stays for the pause after the phrase (--phrase-pause) and goes. It is CSS
// only (components/scene-kit/type-in.module.css): the kit's off-screen pause stops it, reduced motion shows the phrase
// whole, and the server draws the settled text. To type again, remount it (a new `key`), as a scene does per step.
// TypingIndicator is the "digitando" that comes before a phrase (1 s, TYPING_MS): the lib's TypingDots, named for a
// screen reader, with an optional visible label.
import type { CSSProperties } from "react";
import { TypingDots } from "@/components/lib/scene";
import t from "./type-in.module.css";

export { PHRASE_PAUSE_MS, TYPE_CHAR_MS, TYPING_MS, typeDuration } from "./type-in";

export function TypeIn({
  text,
  delay = 0,
  caret = true,
  className,
}: {
  text: string;
  // Milliseconds before the first character (the scene's own beat, e.g. after the "digitando" indicator)
  delay?: number;
  // The caret after the last character shown
  caret?: boolean;
  className?: string;
}) {
  const chars = Array.from(text);
  return (
    <span
      className={className ? `${t.root} ${className}` : t.root}
      data-type-in=""
      data-caret={caret || undefined}
      style={{ "--type-delay": `${delay}ms` } as CSSProperties}
    >
      {chars.map((ch, i) => (
        <span key={i} className={t.ch} style={{ "--i": i } as CSSProperties}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export function TypingIndicator({
  label = "digitando",
  showLabel = false,
  className,
}: {
  // The name a screen reader hears, and the visible label when `showLabel`
  label?: string;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <span className={className ? `${t.typing} ${className}` : t.typing} data-typing="">
      <TypingDots aria-label={label} />
      {showLabel ? (
        <span className={t.label} aria-hidden="true">
          {label}
        </span>
      ) : null}
    </span>
  );
}

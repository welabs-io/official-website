"use client";
// INDICADOR "DIGITANDO" DO KIT
// The "typing" dots that come before a phrase (1 s, TYPING_MS): the lib's TypingDots, named for a screen reader, with an
// optional visible label. Its own client module because the default name comes from the dictionary of the page
// (common.typing), which only a client piece can read; TypeIn.tsx re-exports it, so a scene imports both from there.
import { TypingDots } from "@/components/lib/scene";
import { useMessages } from "@/lib/i18n/provider";
import t from "./type-in.module.css";

export function TypingIndicator({
  label: labelProp,
  showLabel = false,
  className,
}: {
  // The name a screen reader hears, and the visible label when `showLabel` (default: common.typing of the dictionary)
  label?: string;
  showLabel?: boolean;
  className?: string;
}) {
  const dictionary = useMessages();
  const label = labelProp ?? dictionary.common.typing;
  return (
    <span
      className={className ? `${t.typing} ${className}` : t.typing}
      data-typing=""
    >
      <TypingDots aria-label={label} />
      {showLabel ? (
        <span className={t.label} aria-hidden="true">
          {label}
        </span>
      ) : null}
    </span>
  );
}

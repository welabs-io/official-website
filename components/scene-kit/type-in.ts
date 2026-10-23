// TEMPOS DA DIGITAÇÃO
// The typing of a conversation (brief-v4, measured on the reference, khal-map/mapa.md §2.1): ~18 ms per character, the
// "digitando" indicator for 1 s before a phrase, ~2 s of pause between phrases. The CSS of TypeIn reads --type-char of
// app/lib.css; these mirror the three tokens so a scene can size the hold of its steps (type-in.test.ts holds them
// equal to the tokens).
export const TYPE_CHAR_MS = 18;
export const TYPING_MS = 1000;
export const PHRASE_PAUSE_MS = 2000;

/** Milliseconds TypeIn takes to type `text` (one step per character, as the component splits it) */
export const typeDuration = (text: string) => Array.from(text).length * TYPE_CHAR_MS;

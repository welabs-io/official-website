// PALAVRAS E PROMESSAS PROIBIDAS NO TEXTO
// ONE list, read by lib/content/content.test.ts against the whole dictionary of each locale (pt-BR, en, es). Each entry
// is matched case-insensitively as a whole word or phrase. It is the list the copy phase edits: a promise the code does
// not sustain (a funnel, a coupon, cashback, a process written as a sentence, a social network the product does not
// have) and the words the operator does not want on the site ("SaaS", "Software"). When the redator writes en and es,
// the equivalents of the Portuguese entries go here, in this array and nowhere else.
export const FORBIDDEN_WORDS: readonly string[] = [
  "funil",
  "cupom",
  "cashback",
  "em frase",
  "numa frase",
  "volta num toque",
  "baixa sozinho",
  "Instagram",
  "SaaS",
  "Software",
];

// Known failures, tolerated until the copy phase removes them: the dictionary path that carries the word. The test fails
// when a tolerated entry is gone from every locale, so this list only shrinks: delete the entry when the text is fixed.
export const KNOWN_FORBIDDEN: readonly { word: string; path: string }[] = [
  // The metadata and the title of the home say "software"; the operator forbids the word
  { word: "Software", path: "meta.description" },
  { word: "Software", path: "home.intro.before" },
  // The revised concept of the Relloo uses the funnel (the word the old rule barred): the copy phase decides whether the
  // word leaves the list above or these texts change
  { word: "funil", path: "home.accordion.panels.relloo.points.2" },
  { word: "funil", path: "scenes.relloo.label" },
  { word: "funil", path: "scenes.relloo.moves" },
  { word: "funil", path: "scenes.relloo.funnel" },
  { word: "funil", path: "scenes.relloo.frameNames.3" },
];

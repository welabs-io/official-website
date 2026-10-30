// PALAVRAS E PROMESSAS PROIBIDAS NO TEXTO
// ONE list, read by lib/content/content.test.ts against the whole dictionary of each locale (pt-BR, en, es). Each entry
// is matched case-insensitively as a whole word or phrase, so one entry covers the three languages when they spell it the
// same ("Software", "SaaS", the vendors). It holds a promise the site does not make (a process written as a
// sentence), the words the operator does not want on the site ("SaaS", "Software"), the Brazil-only
// citations and every third-party brand of a channel or a tool, visible text and metadata alike (operator, 2026-10-24).
// Copy review of 2026-10-24: "funil" left the list, because the concept of the Relloo is a funnel run by the Magneto.
// O2.14 (2026-10-30): coupon and cashback left the list; under the impact map §7.4.1 a promise leaves the site only when
// it contradicts the model, never because it does not exist yet, and campaigns, coupon and cashback stay as possibilities.
export const FORBIDDEN_WORDS: readonly string[] = [
  // Promises the site does not make (pt-BR, en, es)
  "em frase",
  "numa frase",
  "in one sentence",
  "en una frase",
  "volta num toque",
  "baixa sozinho",
  // Words the operator bans in the three languages
  "SaaS",
  "Software",
  // Brazil-only citations (operator, 2026-10-24): the category is written instead ("controle fiscal")
  "PIX",
  "NFS-e",
  "NFSe",
  "regra brasileira",
  "regras brasileiras",
  "Brazilian rules",
  "reglas brasileñas",
  // Third-party brands of a channel or a business tool, never named, not even in brackets or in the metadata
  "WhatsApp",
  "Discord",
  "Instagram",
  "Telegram",
  "Messenger",
  "Facebook",
  "Slack",
  "Microsoft Teams",
  "Google Meet",
  "Zoom Meetings",
  "Gmail",
  "Outlook",
  "Google Agenda",
  "Google Calendar",
  "Banco Inter",
  "Asaas",
  "Omie",
];

// Known failures, tolerated until the copy phase removes them: the dictionary path that carries the word. The test fails
// when a tolerated entry is gone from every locale, so this list only shrinks: delete the entry when the text is fixed.
// Copy review of 2026-10-24: empty, every text that carried a forbidden word was rewritten.
export const KNOWN_FORBIDDEN: readonly { word: string; path: string }[] = [];

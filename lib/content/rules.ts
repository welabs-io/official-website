// REGRAS DO TEXTO
// What the visible copy may not contain, shared by the content tests, the tests of the rendered pages and of the chain.
// The lists live in copy-rules.json, the single source also read by scripts/check-portfolio.mjs.
import rules from "./copy-rules.json";

export const words = (text: string) => text.trim().split(/\s+/).length;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Slogan verbs, banned and mechanism words and maturity markers (whole words), then brand-concept and slogan phrases
const WORDS = new RegExp(`\\b(?:${rules.words.map(escape).join("|")})\\b`, "i");
const PHRASES = new RegExp(rules.phrases.map(escape).join("|"), "i");
// The closed list of expressions where "entrega" is the noun of the story, not the slogan verb
const ALLOWED = new RegExp(rules.allowed.map(escape).join("|"), "gi");

// The first banned word or phrase in the text, or null. Quotes around a slogan do not hide it.
export function copyViolation(text: string): string | null {
  const clean = text.replace(ALLOWED, " ");
  return clean.match(WORDS)?.[0] ?? clean.match(PHRASES)?.[0] ?? null;
}

// Same rule as a regex-like object for the callers that only `test`
export const COPY_RULES = {
  test: (text: string) => copyViolation(text) !== null,
};

// REGRAS DO TEXTO
// What the visible copy may not contain, shared by the content tests, the tests of the rendered pages and of the chain.
// The lists live in copy-rules.json, the single source also read by scripts/check-portfolio.mjs.
// v3: plus the names of people and of the internal stack, each with its list of known failures.
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

// PESSOAS E PILHA INTERNA
// Names of people and of the internal stack, matched case-sensitive as whole words. The word edge is any non-letter
// (unicode), since \b treats an accented letter as an edge ("José" would never match). Each list has its known failures
// (copy-rules.json `known`), tolerated until the phase that removes them; the tests check that they are still there.
type Known = { value: string; phase: string; todo: string };
export const KNOWN_PERSONS: readonly Known[] = rules.known.persons;
export const KNOWN_STACK: readonly Known[] = rules.known.stack as Known[];

const listMatcher = (list: readonly string[]) =>
  new RegExp(`(?:^|[^\\p{L}])(${list.map(escape).join("|")})(?=[^\\p{L}]|$)`, "gu");
const PERSONS = listMatcher(rules.persons);
const STACK = listMatcher(rules.stack);

// The first value of the list in the text that is not tolerated, or null
const firstOf = (matcher: RegExp, text: string, tolerated: readonly Known[]) => {
  const skip = new Set(tolerated.map((k) => k.value));
  for (const m of text.matchAll(matcher)) if (!skip.has(m[1])) return m[1];
  return null;
};

// The first person's name in the text, besides the known failures (pass [] to tolerate none)
export const personViolation = (
  text: string,
  tolerated: readonly Known[] = KNOWN_PERSONS,
) => firstOf(PERSONS, text, tolerated);

// The first name of the internal stack in the text, besides the known failures (pass [] to tolerate none)
export const stackViolation = (
  text: string,
  tolerated: readonly Known[] = KNOWN_STACK,
) => firstOf(STACK, text, tolerated);

// MARCAS DE TERCEIROS
// v3 (F1): a third-party brand is allowed on a page only inside brackets, as an example of its category; the first one
// outside brackets, or null. Drawn labels (scenes, plays, brand openings) never name one: `vendorIn` finds any, without
// case, for the sources checked as a whole.
export const VENDORS: readonly string[] = rules.vendors;
const VENDOR = listMatcher(rules.vendors);
export function vendorViolation(text: string): string | null {
  for (const m of text.matchAll(VENDOR)) {
    // The match starts on the edge before the name (it may be the bracket itself)
    const before = text.slice(0, m.index + m[0].length - m[1].length);
    if (before.lastIndexOf("(") <= before.lastIndexOf(")")) return m[1];
  }
  return null;
}
const VENDOR_ANY = new RegExp(
  `(?:^|[^\\p{L}])(${rules.vendors.map(escape).join("|")})(?=[^\\p{L}]|$)`,
  "iu",
);
export const vendorIn = (text: string) => text.match(VENDOR_ANY)?.[1] ?? null;

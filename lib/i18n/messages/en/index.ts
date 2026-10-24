// DICIONÁRIO EN
// en-US, adapted from pt-BR with the glossary of the copy round (control/portfolio/site-redesign/i18n/glossario.md).
// The type `Messages` (lib/i18n/types.ts) makes `tsc` fail on a missing or extra key, and
// lib/i18n/messages.test.ts compares the keys, the placeholders and the structural values of the three dictionaries.
import type { Messages } from "../../types";
import { home } from "./home";
import { products } from "./products";
import { domus } from "./scenes/domus";
import { knowly } from "./scenes/knowly";
import { magneto } from "./scenes/magneto";
import { relloo } from "./scenes/relloo";
import { tuner } from "./scenes/tuner";
import { site } from "./site";

export const en: Messages = {
  ...site,
  products,
  home,
  scenes: { relloo, domus, magneto, tuner, knowly },
};

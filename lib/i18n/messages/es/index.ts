// DICIONÁRIO ES
// TRADUÇÃO PENDENTE: each file of this folder is, for now, a copy of the pt-BR one, to be replaced by the text of this
// language. The type `Messages` (lib/i18n/types.ts) makes `tsc` fail on a missing or extra key, and
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

export const es: Messages = {
  ...site,
  products,
  home,
  scenes: { relloo, domus, magneto, tuner, knowly },
};

// DICIONÁRIO PT-BR
// The source dictionary: it defines the shape (`Messages`, lib/i18n/types.ts) that en and es must follow key for key.
// pt-BR is the default locale, served with no prefix in the address.
import { home } from "./home";
import { openings } from "./openings";
import { products } from "./products";
import { knowly } from "./scenes/knowly";
import { domus } from "./scenes/domus";
import { magneto } from "./scenes/magneto";
import { relloo } from "./scenes/relloo";
import { tuner } from "./scenes/tuner";
import { site } from "./site";

export const ptBR = {
  ...site,
  products,
  home,
  // The words drawn inside the brand opening of each product (components/intro)
  openings,
  // The drawn interface of the carousel of each product (the text inside the scenes of the product pages)
  scenes: { relloo, domus, magneto, tuner, knowly },
} as const;

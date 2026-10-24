// TIPOS DOS DICIONÁRIOS
// pt-BR is the source of the shape: `Messages` is the type of its dictionary with every string widened, so en and es are
// annotated with it and `tsc` fails on a missing or extra key. Dictionaries hold TEXT ONLY (plain strings, arrays and
// objects, so they cross the server/client boundary as props): the structure around the text (product slugs, glyphs,
// the order of the stations) lives in code and reads the text by key. A sentence with a variable carries a `{name}`
// placeholder, filled by `fmt` (lib/i18n/format.ts).
import type { ptBR } from "./messages/pt-BR";

export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : { readonly [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof ptBR>;

// Slices of the dictionary, one per file of a locale folder (lib/i18n/messages/<locale>/*.ts)
export type SiteMessages = Pick<
  Messages,
  "meta" | "common" | "language" | "nav" | "shared" | "closing"
>;
export type ProductsMessages = Messages["products"];
export type HomeMessages = Messages["home"];
export type SceneMessages<K extends keyof Messages["scenes"]> =
  Messages["scenes"][K];

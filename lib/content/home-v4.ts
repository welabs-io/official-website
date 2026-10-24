// ESTRUTURA DA HOME V4
// The three blocks of the v4 home (brief-v4, approved artboards Main, Chain and Accordion of the canvas, 2026-10-23): the
// opening in blades (one frame per product, the word of the title turning with it), the chain that the scroll walks (a
// message crossing the five products into the order in the Domus) and the accordion of the five products. The words
// live in the dictionaries (lib/i18n/messages/<locale>/home.ts); this file keeps the order of the stations, the modules
// of the Domus frame with their icon and kind, and builds the shapes the components read. The words drawn inside a frame
// are labels of a product screen (out of the word budget, still read by the copy rules).
import { fmt } from "../i18n/format";
import type { Messages } from "../i18n/types";
import { PRODUCTS, type ProductSlug } from "../products";

// OS MÓDULOS DO QUADRO DO DOMUS
// The modules of the Domus frame: the standard ones (filled) and the ones made to measure (outlined), the newest last.
// `id` is the key of the module name in `home.domus.modules` (the newest, "inspection", is `home.frames.domus.newModule`).
export type FrameModule = {
  id: string;
  name: string;
  icon: string;
  kind: "standard" | "custom" | "new";
};
const FRAME_MODULES = [
  { id: "sales", icon: "tag", kind: "standard" },
  { id: "purchasing", icon: "bag", kind: "standard" },
  { id: "inventory", icon: "box", kind: "standard" },
  { id: "finance", icon: "coins", kind: "standard" },
  { id: "contracts", icon: "pen", kind: "standard" },
  { id: "people", icon: "users", kind: "standard" },
  { id: "tax", icon: "file", kind: "custom" },
  { id: "banks", icon: "bank", kind: "custom" },
  { id: "tickets", icon: "chat", kind: "custom" },
  { id: "approvals", icon: "check", kind: "custom" },
  { id: "legal", icon: "scale", kind: "custom" },
  { id: "inspection", icon: "clipboard", kind: "new" },
] as const;

// The modules a narrow frame keeps (the accordion panel): two columns of three
export const COMPACT_MODULES: ReadonlySet<string> = new Set([
  "finance",
  "contracts",
  "tax",
  "people",
  "tickets",
  "inspection",
]);

export function domusFrameModules(m: Messages): readonly FrameModule[] {
  const { modules } = m.home.domus;
  return FRAME_MODULES.map((f) => ({
    ...f,
    name:
      f.id === "inspection"
        ? m.home.frames.domus.newModule
        : modules[f.id as keyof typeof modules],
  }));
}

// O QUADRO DO MAGNETO E DO TUNER
// The steps of the proposal done so far (the first one) and the channel that is the fresh message (the first one)
export const MAGNETO_STEPS_DONE = 1;
export const TUNER_FRESH_CHANNEL = 0;

// A CADEIA
// The order the message walks: each station lights in turn until the order settles in the Domus
export const CHAIN_ORDER = [
  "tuner",
  "relloo",
  "knowly",
  "magneto",
  "domus",
] as const satisfies readonly ProductSlug[];

export type ChainStation = {
  product: ProductSlug;
  label: string;
  // The small line of the card before it is reached, while it is the live one, and once it is done
  next: string;
  now: string;
  done: string;
  // The caption typed while the station is the live one (one or two lines) and the chip it leaves once done
  caption: readonly string[];
  chip: string;
};

export function chainStations(m: Messages): readonly ChainStation[] {
  const vars = { order: m.shared.order };
  return CHAIN_ORDER.map((product) => {
    const s = m.home.chain.stations[product];
    return {
      product,
      label: s.label,
      next: s.next,
      now: fmt(s.now, vars),
      done: fmt(s.done, vars),
      caption: s.caption,
      chip: fmt(s.chip, vars),
    };
  });
}

/** The record of the order in the Domus, one line per product that worked on it (the name of the product, what it did) */
export function chainRecord(m: Messages) {
  const { record } = m.home.chain;
  return {
    title: m.shared.order,
    who: m.shared.who,
    tag: record.tag,
    lines: (["tuner", "relloo", "knowly", "magneto"] as const).map(
      (product) => ({
        product: PRODUCTS.find((p) => p.slug === product)!.name,
        text: record.lines[product],
      }),
    ),
  };
}

// O ACORDEÃO
// The five panels in the order of the products: the area of the product on the closed panel, the title and the line of
// the open one, three tags and the question that closes it
export type AccordionPanel = {
  slug: ProductSlug;
  area: string;
  title: string;
  lead: string;
  points: readonly string[];
  question: string;
};

export const accordionPanels = (m: Messages): readonly AccordionPanel[] =>
  PRODUCTS.map(({ slug }) => ({ slug, ...m.home.accordion.panels[slug] }));

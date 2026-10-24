// ESTRUTURA DA HOME E DOS ELEMENTOS COMUNS
// The words of the home live in the dictionaries (lib/i18n/messages/<locale>/home.ts, site.ts); this file holds what
// does not change with the language and builds the shapes the components read: which module is on which floor and with
// which glyph, the turning words in the order of the products, the platform marks. It is server-safe (plain functions
// over a dictionary), so a Server Component and a client piece build the same thing from the same dictionary.
// Copy of the home (v2 of the content, approved on 2026-10-20): each section has at most one short title and one line;
// the rest is motion and interaction. No slogan, no brand-concept phrase.
import type { Messages } from "../i18n/types";
import { PRODUCTS } from "../products";

// OS MÓDULOS DO DOMUS
// The modules of the Domus, as installed in the ERP code (v2.1, control/portfolio/site-redesign/v13-proposta/v2-1/
// modulos-domus.md): the standard floor is the ERPNext and HRMS modules the product image installs
// (erpnext .k8s/Dockerfile.product:53, motor erpnext/modules.txt), the floor made to measure is our own apps (worktrack,
// legal_br, nfse_connector, inter_connector, asaas_connector, omie_connector, data_privacy). A module is its stable id
// (the key of `home.domus.modules`); the name is the dictionary's, the glyph and the floor are here.
export const MODULE_IDS = {
  standard: [
    "sales",
    "purchasing",
    "inventory",
    "production",
    "finance",
    "contracts",
    "projects",
    "people",
    "assets",
    "quality",
  ],
  custom: [
    "tax",
    "banks",
    "legal",
    "tickets",
    "requests",
    "approvals",
    "privacy",
    "import",
  ],
} as const;
export type ModuleId =
  | (typeof MODULE_IDS.standard)[number]
  | (typeof MODULE_IDS.custom)[number];

// Glyph of each module in the shared line set of the scenes (components/scenes/icons.tsx)
const MODULE_GLYPH: Record<ModuleId, string> = {
  sales: "tag",
  purchasing: "bag",
  inventory: "box",
  production: "bolt",
  finance: "coin",
  contracts: "pen",
  projects: "calendar",
  people: "user",
  assets: "truck",
  quality: "search",
  tax: "doc",
  banks: "bank",
  legal: "book",
  tickets: "chat",
  requests: "rule",
  approvals: "check",
  privacy: "lock",
  // Pilot of the lib (2026-10-21): the category only; the block names no third-party product
  import: "refresh",
};

// `tag` is the small attractive detail of a module, never its definition
export type Room = { id: ModuleId; name: string; glyph: string; tag?: string };

/** The modules of the Domus by floor, with their names (and tags) in the language of the dictionary */
export function domusModules(m: Messages): {
  standard: readonly Room[];
  custom: readonly Room[];
} {
  const { modules, tags } = m.home.domus;
  const room = (id: ModuleId): Room => ({
    id,
    name: modules[id],
    glyph: MODULE_GLYPH[id],
    ...(id in tags ? { tag: tags[id as keyof typeof tags] } : {}),
  });
  return {
    standard: MODULE_IDS.standard.map(room),
    custom: MODULE_IDS.custom.map(room),
  };
}

// ABERTURA
/** The words that turn in the title, one per product, in the order of the products (and of the frames of the stage) */
export const introWords = (m: Messages) =>
  PRODUCTS.map(({ slug }) => ({
    product: slug,
    text: m.home.intro.words[slug],
  }));

/** The record of the Domus on the stage: the order, the contact it belongs to and one line per product that wrote on it */
export const introRecord = (m: Messages) => ({
  title: m.shared.order,
  who: m.shared.who,
  lines: m.home.intro.record.lines,
  domus: m.home.intro.record.domus,
});

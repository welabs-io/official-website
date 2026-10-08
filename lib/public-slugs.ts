// URL PÚBLICA DOS PRODUTOS
// Internal catalog ids that must not appear in public URLs get a public slug.
const PUBLIC_SLUG: Record<string, string> = {
  malupe: "ecossistema-monitoramento",
  // Welabs products carry their own names since 2026-10-06; internal ids stay as they are.
  flow: "magneto",
  erp: "domus",
  wekb: "knowly",
  // Renamed Rello -> Relloo on 2026-10-07; the old slug redirects through FORMER_SLUG.
  "welabs-crm": "relloo",
  channels: "tuner",
};
const ID_BY_SLUG = Object.fromEntries(
  Object.entries(PUBLIC_SLUG).map(([id, slug]) => [slug, id]),
);
// Earlier public slugs keep redirecting to the current one.
const FORMER_SLUG: Record<string, string> = {
  "operacao-seguranca": "ecossistema-monitoramento",
  "hub-de-dominio": "domus",
  rello: "relloo",
};

export const publicSlug = (id: string) => PUBLIC_SLUG[id] ?? id;
export const idFromSlug = (slug: string) => ID_BY_SLUG[slug] ?? slug;
export const retiredSlug = (slug: string) =>
  slug in PUBLIC_SLUG ? PUBLIC_SLUG[slug] : (FORMER_SLUG[slug] ?? null);

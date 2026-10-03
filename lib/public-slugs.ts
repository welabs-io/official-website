// URL PÚBLICA DOS PRODUTOS
// Internal catalog ids that must not appear in public URLs get a public slug.
const PUBLIC_SLUG: Record<string, string> = {malupe: 'ecossistema-monitoramento'};
const ID_BY_SLUG = Object.fromEntries(Object.entries(PUBLIC_SLUG).map(([id, slug]) => [slug, id]));
// Earlier public slugs keep redirecting to the current one.
const FORMER_SLUG: Record<string, string> = {'operacao-seguranca': 'ecossistema-monitoramento'};

export const publicSlug = (id: string) => PUBLIC_SLUG[id] ?? id;
export const idFromSlug = (slug: string) => ID_BY_SLUG[slug] ?? slug;
export const retiredSlug = (slug: string) => slug in PUBLIC_SLUG ? PUBLIC_SLUG[slug] : FORMER_SLUG[slug] ?? null;

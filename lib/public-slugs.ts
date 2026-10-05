// URL PÚBLICA DOS PRODUTOS
// Internal catalog ids that must not appear in public URLs get a public slug.
const PUBLIC_SLUG: Record<string, string> = {
  malupe: 'ecossistema-monitoramento',
  // The ERP is presented as the domain hub; SGORS is presented by its full name.
  erp: 'hub-de-dominio',
  sgors: 'gerenciamento-de-residuos',
};
const ID_BY_SLUG = Object.fromEntries(Object.entries(PUBLIC_SLUG).map(([id, slug]) => [slug, id]));
// Earlier public slugs keep redirecting to the current one.
const FORMER_SLUG: Record<string, string> = {'operacao-seguranca': 'ecossistema-monitoramento'};
// Retired products redirect to the page that now carries their content (Kiosk Brands became CRM Campaigns).
// SGICI left the portfolio on 2026-10-05; its old address lands on the portfolio.
const MOVED_PRODUCT: Record<string, string> = {'kiosk-brands': '/welabs/produtos/welabs-crm', sgici: '/portfolio'};

export const publicSlug = (id: string) => PUBLIC_SLUG[id] ?? id;
export const idFromSlug = (slug: string) => ID_BY_SLUG[slug] ?? slug;
export const retiredSlug = (slug: string) => slug in PUBLIC_SLUG ? PUBLIC_SLUG[slug] : FORMER_SLUG[slug] ?? null;
export const movedProduct = (slug: string) => MOVED_PRODUCT[slug] ?? null;

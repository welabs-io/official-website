import presentationCatalog from "./presentation-catalog.json";

// CATÁLOGO VISÍVEL
// Products hidden from the site for now (operator, 2026-10-07: Ecossistema Monitoramento). Nothing is deleted:
// the entry stays in presentation-catalog.json and the films stay accepted in the motion round; a hidden
// product just has no card, no page (its address redirects to /produtos), no film and no navigation link.
export const HIDDEN_PRODUCTS: ReadonlySet<string> = new Set(["malupe"]);

export const isHiddenProduct = (id: string) => HIDDEN_PRODUCTS.has(id);

const catalog = presentationCatalog.filter((p) => !isHiddenProduct(p.id));

export default catalog;

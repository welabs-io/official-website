import brandIntros from "./brand-intros.json";
import motionCatalog from "./motion-catalog.json";

type Film = (typeof motionCatalog)[number];

// CAPA DE MARCA
// The card cover of a product is the closing frame of its brand intro (lib/brand-intros.json);
// a product whose intro is not accepted yet falls back to its first overview film.
export function brandIntroId(
  product: string,
  publisher?: string,
): string | undefined {
  const products = brandIntros.products as Record<string, string>;
  const publishers = brandIntros.publishers as Record<string, string>;
  const brand =
    products[product] ?? (publisher ? publishers[publisher] : undefined);
  return brand
    ? (brandIntros.brands as Record<string, string>)[brand]
    : undefined;
}

export function coverFilmOf(
  product: string,
  publisher?: string,
): Film | undefined {
  const intro = brandIntroId(product, publisher);
  const owns = (f: Film) =>
    f.product === product || (f.also as string[]).includes(product);
  return (
    (intro ? motionCatalog.find((f) => f.id === intro) : undefined) ??
    motionCatalog.find(
      (f) => owns(f) && (f.kind === "business" || f.kind === "topology"),
    )
  );
}

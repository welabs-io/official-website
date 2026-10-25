// DICIONÁRIO EM LISTA DE CAMINHOS
// Flattens a dictionary into [path, value] pairs ("home.intro.words.domus", "products.domus.keywords.0"), the shape the
// tests compare locales on and the copy phase reads gaps from. Arrays use their index as a segment.
export function flatten(
  value: unknown,
  path = "",
  out: [string, string][] = [],
): [string, string][] {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value))
    value.forEach((v, i) => flatten(v, path ? `${path}.${i}` : String(i), out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value))
      flatten(v, path ? `${path}.${k}` : k, out);
  return out;
}

/** The `{name}` placeholders of a sentence, sorted */
export const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

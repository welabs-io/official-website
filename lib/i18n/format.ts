// SUBSTITUIÇÃO DE VARIÁVEIS
// Fills the `{name}` placeholders of a dictionary sentence. A placeholder with no value stays as written, so a missing
// variable is visible instead of silent.
export function fmt(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

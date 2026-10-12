// SLUGS DOS PRODUTOS
// The five product slugs in weight order, on their own so the manifest reader can name them without importing
// lib/products.ts (which reads the manifest for the seal policy). A test keeps this list equal to PRODUCTS.
export const PRODUCT_SLUGS = [
  "domus",
  "relloo",
  "magneto",
  "tuner",
  "knowly",
] as const;

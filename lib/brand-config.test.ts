// TESTES DA POLÍTICA DA FORMA COMPLETA
// Locks the two cases of the rule: the full form only in the identity highlight of each product, and the standalone logo
// and name everywhere else (and always below the legible height). The full name is "Welabs {product}", with no seal line
// (brand 2.0.0, 2026-11-05).
import { describe, expect, it } from "vitest";
import { MIN_FULL_HEIGHT, fullFormPolicy } from "./brand-config";
import { PRODUCTS, productAlt, productFullName, productLogo } from "./products";

describe("fullFormPolicy", () => {
  it("allows the full form on the product page highlight and on the first mention", () => {
    expect(fullFormPolicy("hero", 80)).toBe(true);
    expect(fullFormPolicy("first-mention")).toBe(true);
  });
  it("never allows it on rows or the miniature core", () => {
    expect(fullFormPolicy("row")).toBe(false);
    expect(fullFormPolicy("hub")).toBe(false);
    expect(fullFormPolicy("row", 80)).toBe(false);
  });
  it("never allows it under the legible height, even in the highlight", () => {
    expect(fullFormPolicy("hero", MIN_FULL_HEIGHT - 1)).toBe(false);
    expect(fullFormPolicy("hero", MIN_FULL_HEIGHT)).toBe(true);
  });
});

describe("logo files and names follow the policy", () => {
  it.each(PRODUCTS.map((p) => p.slug))("%s", (slug) => {
    expect(productLogo(slug, "dark", "hero", 80)).toMatch(/-dark-full\.svg$/);
    expect(productLogo(slug, "dark", "hero", 24)).toMatch(/-dark\.svg$/);
    expect(productLogo(slug, "light", "row")).toMatch(/-light\.svg$/);
    expect(productLogo(slug, "dark", "hub")).not.toContain("-full");
    expect(productAlt(slug, "hero")).toBe(productFullName(slug));
    expect(productAlt(slug, "first-mention")).toBe(productFullName(slug));
    expect(productFullName(slug)).toMatch(/^Welabs [A-Z][a-z]+$/);
  });

  it("no name carries the old seal line", () => {
    for (const { slug } of PRODUCTS) {
      expect(productFullName(slug)).not.toContain("by Welabs");
      expect(productAlt(slug, "row")).not.toContain("by Welabs");
    }
  });
});

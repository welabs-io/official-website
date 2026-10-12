// TESTES DA POLÍTICA DO SELO
// Locks the two cases of the operator's decision of 2026-10-12: the seal only in the identity highlight of each product,
// and the standalone logo everywhere else (and always below the legible height).
import { describe, expect, it } from "vitest";
import { MIN_ENDORSED_HEIGHT, endorsePolicy } from "./brand-config";
import { PRODUCTS, productAlt, productLogo } from "./products";

describe("endorsePolicy", () => {
  it("allows the seal on the product page highlight and on the first mention", () => {
    expect(endorsePolicy("hero", 80)).toBe(true);
    expect(endorsePolicy("first-mention")).toBe(true);
  });
  it("never allows it on rows, the miniature core, the connector block", () => {
    expect(endorsePolicy("row")).toBe(false);
    expect(endorsePolicy("hub")).toBe(false);
  });
  it("never allows it under the legible height, even in the highlight", () => {
    expect(endorsePolicy("hero", MIN_ENDORSED_HEIGHT - 1)).toBe(false);
    expect(endorsePolicy("hero", MIN_ENDORSED_HEIGHT)).toBe(true);
  });
});

describe("logo files and names follow the policy", () => {
  it.each(PRODUCTS.map((p) => p.slug))("%s", (slug) => {
    expect(productLogo(slug, "dark", "hero", 80)).toMatch(
      /-dark-endorsed\.svg$/,
    );
    expect(productLogo(slug, "dark", "hero", 24)).toMatch(/-dark\.svg$/);
    expect(productLogo(slug, "light", "row")).toMatch(/-light\.svg$/);
    expect(productLogo(slug, "dark", "hub")).not.toContain("endorsed");
    expect(productAlt(slug, "hero")).toMatch(/ by Welabs$/);
    expect(productAlt(slug, "first-mention")).toMatch(/ by Welabs$/);
    expect(productAlt(slug, "row")).not.toContain("by Welabs");
  });
});

// TESTES DA POLÍTICA DO SELO
// Locks the two cases of the operator's decision of 2026-10-12: the seal only in the identity highlight of each product,
// and the standalone logo everywhere else (and always below the legible height). The default comes from the motion
// manifest (`brand.endorse`, and `endorse` of the opening of each product).
import { describe, expect, it } from "vitest";
import { MIN_ENDORSED_HEIGHT, endorsePolicy } from "./brand-config";
import { MANIFEST } from "./manifest";
import { PRODUCTS, productAlt, productLogo } from "./products";

describe("endorsePolicy", () => {
  it("the manifest default is no seal on small logos", () => {
    expect(MANIFEST.brand.endorse).toBe("off");
  });
  it("allows the seal on the product page highlight and on the first mention", () => {
    expect(endorsePolicy("hero", 80)).toBe(true);
    expect(endorsePolicy("first-mention")).toBe(true);
  });
  it("never allows it on rows, the miniature core, the connector block while the manifest says off", () => {
    expect(endorsePolicy("row")).toBe(false);
    expect(endorsePolicy("hub")).toBe(false);
    expect(endorsePolicy("row", 60)).toBe(false);
  });
  it("brand.endorse on allows it on rows only from the legible height", () => {
    expect(endorsePolicy("row", MIN_ENDORSED_HEIGHT, undefined, "on")).toBe(
      true,
    );
    expect(endorsePolicy("row", MIN_ENDORSED_HEIGHT - 1, undefined, "on")).toBe(
      false,
    );
  });
  it("never allows it under the legible height, even in the highlight", () => {
    expect(endorsePolicy("hero", MIN_ENDORSED_HEIGHT - 1)).toBe(false);
    expect(endorsePolicy("hero", MIN_ENDORSED_HEIGHT)).toBe(true);
  });
  it("the highlight follows the endorse of the opening piece of the product", () => {
    for (const { slug } of PRODUCTS) {
      const piece = MANIFEST.products[slug].intro.piece;
      expect(MANIFEST.pieces[piece].endorse).toBe("on");
      expect(endorsePolicy("hero", 80, slug)).toBe(true);
    }
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

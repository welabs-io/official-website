// CONTRATO DA HISTÓRIA ÚNICA DO SITE
// Narrative chapter boundaries and readable context must agree across independently authored responsive compositions.
import { describe, expect, it } from "vitest";
import {
  ECOSYSTEM_DURATION,
  ECOSYSTEM_PHASES,
  ECOSYSTEM_ROLES,
  ECOSYSTEM_VARIANTS,
  ecosystemPhaseAt,
} from "./ecosystem-motion";
import { PRODUCTS } from "./products";

describe("the five products in one operation", () => {
  it("uses distinct canvases with one shared story clock", () => {
    expect(ECOSYSTEM_VARIANTS.desktop.id).not.toBe(
      ECOSYSTEM_VARIANTS.mobile.id,
    );
    expect(
      ECOSYSTEM_VARIANTS.desktop.width / ECOSYSTEM_VARIANTS.desktop.height,
    ).toBe(16 / 9);
    expect(
      ECOSYSTEM_VARIANTS.mobile.width / ECOSYSTEM_VARIANTS.mobile.height,
    ).toBe(4 / 5);
    expect(ECOSYSTEM_PHASES[0].start).toBe(0);
    expect(ECOSYSTEM_PHASES.at(-1)!.start).toBeLessThan(ECOSYSTEM_DURATION);
  });
  it("retains all products and the original commercial hierarchy in the role map", () => {
    expect(ECOSYSTEM_ROLES.map(({ slug }) => slug)).toEqual(
      PRODUCTS.map(({ slug }) => slug),
    );
    expect(
      new Set(ECOSYSTEM_PHASES.flatMap((phase) => [...phase.products])).size,
    ).toBe(5);
  });
  it.each(ECOSYSTEM_PHASES)(
    "$key follows the actual composition clock at its boundary",
    (phase) => {
      const index = ECOSYSTEM_PHASES.findIndex(({ key }) => key === phase.key);
      expect(ecosystemPhaseAt(phase.start)).toBe(index);
      expect(ecosystemPhaseAt(phase.start + 0.25)).toBe(index);
      if (index) expect(ecosystemPhaseAt(phase.start - 0.01)).toBe(index - 1);
      expect(phase.posterTime).toBeGreaterThan(phase.start);
      expect(phase.posterTime).toBeLessThan(
        ECOSYSTEM_PHASES[index + 1]?.start ?? ECOSYSTEM_DURATION,
      );
    },
  );
});

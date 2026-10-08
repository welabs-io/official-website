import { describe, expect, it } from "vitest";
import { idFromSlug, publicSlug, retiredSlug } from "./public-slugs";

// URL PÚBLICA DOS PRODUTOS
// Product pages live at /produtos/<public slug>; internal ids and former slugs only redirect.
describe("public product slugs", () => {
  it("maps every internal id to its product name", () => {
    expect(publicSlug("flow")).toBe("magneto");
    expect(publicSlug("erp")).toBe("domus");
    expect(publicSlug("wekb")).toBe("knowly");
    expect(publicSlug("welabs-crm")).toBe("relloo");
    expect(publicSlug("channels")).toBe("tuner");
    expect(publicSlug("malupe")).toBe("ecossistema-monitoramento");
  });

  it("resolves a public slug back to the catalog id", () => {
    expect(idFromSlug("relloo")).toBe("welabs-crm");
    expect(idFromSlug("tuner")).toBe("channels");
    expect(idFromSlug("unknown")).toBe("unknown");
  });

  it("redirects internal ids and former slugs to the current slug", () => {
    expect(retiredSlug("erp")).toBe("domus");
    expect(retiredSlug("rello")).toBe("relloo");
    expect(retiredSlug("hub-de-dominio")).toBe("domus");
    expect(retiredSlug("operacao-seguranca")).toBe("ecossistema-monitoramento");
    expect(retiredSlug("domus")).toBeNull();
  });
});

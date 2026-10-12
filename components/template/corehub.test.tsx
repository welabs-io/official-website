// TESTES DO BLOCO DE CONECTORES
// The vertical block of the home: the four labels of the manifest (the seam and one per rail), the five logos as links, no
// loose end (no end-point dots, rails continue as converging rails), and the content of the labels follows the manifest.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MANIFEST } from "@/lib/manifest";
import { ties } from "@/lib/manifest/select";
import { PRODUCTS } from "@/lib/products";
import { HOME_CONFIG } from "@/lib/site-config";
import { CoreHub } from "./CoreHub";
import { Sections } from "./SiteTemplate";

const hub = renderToStaticMarkup(<CoreHub tone="dark" ties={ties(MANIFEST)} />);

describe("core hub", () => {
  it("shows the four labels of the manifest, once each", () => {
    const labels = ties(MANIFEST).map((t) => t.label);
    expect(labels).toHaveLength(4);
    for (const label of labels) expect(hub.split(`>${label}<`)).toHaveLength(2);
  });
  it("links the five products and shows each logo without the seal", () => {
    for (const { slug } of PRODUCTS) {
      expect(hub).toContain(`href="/products/${slug}"`);
      expect(hub).toContain(`${slug}-dark.svg`);
    }
    expect(hub).not.toContain("endorsed");
    expect(hub).not.toContain("aria-current");
  });
  it("has three rails and no SVG with end points", () => {
    expect(hub.match(/data-line/g) ?? []).toHaveLength(3);
    expect(hub).not.toContain("<svg");
    expect(hub).not.toContain("<circle");
  });
  it("is a group for assistive technology and pauses off screen", () => {
    expect(hub).toContain('role="group"');
    expect(hub).toContain("data-live");
  });
  it("on the home, the closing continues the three rails with a dock each on the strip", () => {
    const html = renderToStaticMarkup(<Sections config={HOME_CONFIG} />);
    const connectors = html.slice(
      html.indexOf('id="connectors"'),
      html.indexOf('id="platforms"'),
    );
    expect(connectors).toContain('data-rail="converge"');
    expect(connectors.match(/<b class=/g)).toHaveLength(3);
  });
});

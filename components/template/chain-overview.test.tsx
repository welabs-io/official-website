// TESTES DA VISÃO GERAL DA CADEIA
// The top block of the chain is server markup built from the manifest: the order of the plot, the first step lit, one
// caption per step in the data the browser follows, and a time that is the manifest's own (piece seconds over the rate).
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MANIFEST } from "@/lib/manifest";
import { overviewData } from "@/lib/overview-data";
import { colPercent, stepVars } from "@/lib/overview-geometry";
import { SiteTemplate } from "./SiteTemplate";
import { PRODUCTS } from "@/lib/products";
import { HOME_CONFIG, productConfig } from "@/lib/site-config";
import { ChainOverview } from "./ChainOverview";

const html = renderToStaticMarkup(<ChainOverview tone="dark" />);
const page = renderToStaticMarkup(<SiteTemplate config={HOME_CONFIG} />);

describe("overview data", () => {
  const data = overviewData();
  it("has one step per step of the chain and every column is known", () => {
    expect(data.steps).toHaveLength(MANIFEST.chain.steps.length);
    for (const s of data.steps)
      for (const c of [...s.nodes, s.from, s.to]) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(data.order.length);
      }
  });
  it("the token delay and duration are the manifest's piece seconds over the rate", () => {
    MANIFEST.chain.steps.forEach(({ overview: o, detail: d }, i) => {
      expect(data.steps[i].delay).toBeCloseTo((o.from - d.from) / d.rate, 3);
      expect(data.steps[i].dur).toBeCloseTo((o.to - o.from) / d.rate, 3);
      // The token lands before the scene ends (hold included)
      expect(data.steps[i].delay + data.steps[i].dur).toBeLessThan(
        (d.to - d.from) / d.rate + d.hold,
      );
    });
  });
  it("the bridge of the connector reaches from the farthest lit node to the axis", () => {
    for (const s of data.steps) {
      const v = stepVars(s, data.order.length);
      const lit = s.nodes.map((c) => colPercent(c, data.order.length));
      expect(parseFloat(v["--bl"])).toBeCloseTo(Math.min(50, ...lit), 2);
      expect(parseFloat(v["--br"])).toBeCloseTo(Math.max(50, ...lit), 2);
    }
  });
});

describe("overview markup", () => {
  it("shows the first caption as plain text, the token and a logo per product", () => {
    expect(html).toContain(MANIFEST.chain.steps[0].overview.label);
    // Plain text, not a live region (the carousel changes by itself)
    expect(html).not.toMatch(/aria-live/);
    expect(html).toContain("Pedido 1234");
    for (const slug of Object.keys(MANIFEST.products))
      expect(html).toContain(`${slug}-dark.svg`);
    expect(html).not.toContain("-endorsed");
  });
  it("names each product once, without 'by Welabs' where the file has no seal", () => {
    for (const p of PRODUCTS)
      expect(html.match(new RegExp(`alt="${p.name}"`, "g"))).toHaveLength(1);
    expect(html).not.toMatch(/by Welabs/);
  });
  it("no section of any page reads the product names twice (one row of named logos per chain section)", () => {
    const pages = [
      page,
      ...PRODUCTS.map((p) =>
        renderToStaticMarkup(<SiteTemplate config={productConfig(p.slug)} />),
      ),
    ];
    for (const html of pages) {
      const chain = html.slice(
        html.indexOf('id="chain"'),
        html.indexOf('id="products"') > 0
          ? html.indexOf('id="products"')
          : html.indexOf('id="connectors"'),
      );
      for (const p of PRODUCTS)
        expect(
          chain.match(new RegExp(`alt="${p.name}"`, "g"))?.length ?? 0,
        ).toBeLessThanOrEqual(1);
    }
  });
  it("lights only the nodes of the first step", () => {
    const lit = MANIFEST.chain.steps[0].overview.nodes;
    const on = [...html.matchAll(/<li[^>]*data-state="on"/g)];
    expect(on).toHaveLength(lit.length);
  });
  it("has no video, no player and no controls", () => {
    expect(html).not.toMatch(/<video|hyperframes|controls/);
  });
});

describe("the chain section of the home", () => {
  const chain = page.slice(
    page.indexOf('id="chain"'),
    page.indexOf('id="products"'),
  );
  it("opens with the title and the line of the home, then the overview, then the ring, in that order", () => {
    const at = (s: string) => chain.indexOf(s);
    expect(at("Welabs desenvolve sistemas")).toBeGreaterThan(-1);
    expect(at("data-overview")).toBeGreaterThan(at("Welabs desenvolve"));
    expect(at('id="chain-ring"')).toBeGreaterThan(at("data-overview"));
  });
  it("the old row of logos and the old s5 piece are gone from the chain", () => {
    expect(chain).not.toMatch(/data-row=|chain-value-s5/);
  });
});

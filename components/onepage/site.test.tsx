// TESTES DO CONTEÚDO DA PÁGINA ÚNICA
// The operator's direction of 2026-10-09: no player, no video, little text, no brand-concept slogans. The pages are
// rendered on the server (the same HTML the first paint gets) and checked as text.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { OnePage } from "./OnePage";
import { PageFrame } from "./PageFrame";
import { ProductPageBody } from "./ProductPageBody";

const home = renderToStaticMarkup(<OnePage />);
const productPages = PRODUCTS.map((p) => ({
  slug: p.slug,
  html: renderToStaticMarkup(
    <PageFrame>
      <ProductPageBody slug={p.slug} />
    </PageFrame>,
  ),
}));
const pages = [{ slug: "home", html: home }, ...productPages];

// Text a person reads: no tags, no scripts or styles
const visibleText = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
// Text that only assistive technology gets
const hiddenText = (html: string) =>
  [...html.matchAll(/(?:alt|aria-label)="([^"]*)"/g)]
    .map((m) => m[1])
    .join(" ");

// Brand-concept words and phrases that are only allowed inside chain presentations
const SLOGAN =
  /\b(domina|atende|automatiza|entrega|sabe|define|explica|conecta|transforma|ideias que viram|um só fluxo|ecossistema)\b/i;
// Words the operator ruled out of the site
const BANNED =
  /\b(cliente|clientes|erp|ficha|beta|alpha|mvp|em breve|roadmap)\b/i;

describe("pages carry no player interface", () => {
  it.each(pages)(
    "$slug has no progress bar, no pause button, no controls and no video",
    ({ html }) => {
      expect(html).not.toMatch(/role="progressbar"|<progress\b/i);
      expect(html).not.toMatch(
        /Pausar|Retomar|aria-pressed="(true|false)"[^>]*pause/i,
      );
      expect(html).not.toMatch(/<hyperframes-player[^>]*\bcontrols\b/i);
      expect(html).not.toMatch(/<video|<iframe|<audio/i);
      expect(html).not.toMatch(/\.(mp4|webm|mov)\b/i);
    },
  );
});

describe("pages carry little text and no slogan", () => {
  it.each(pages)("$slug has no slogan or banned word", ({ html }) => {
    const all = `${visibleText(html)} ${hiddenText(html)}`;
    expect(all).not.toMatch(SLOGAN);
    expect(all).not.toMatch(BANNED);
  });

  it("the home stays under the word budget", () => {
    const words = visibleText(home).split(" ").length;
    // Measured at the time of writing: well below 70; the budget guards against text creeping back
    expect(words).toBeLessThanOrEqual(70);
  });

  it("every product line has at most six words", () => {
    for (const p of PRODUCTS)
      expect(p.line.split(" ").length).toBeLessThanOrEqual(6);
  });

  it("the home has its sections and the call to action", () => {
    for (const id of ["top", "logos"]) expect(home).toContain(`id="${id}"`);
    expect(home).toContain('href="/#contact"');
    expect(visibleText(home)).toContain("Conversar com a Welabs");
  });
});

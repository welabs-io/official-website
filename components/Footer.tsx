"use client";
import { useT } from "./LangProvider";
import { useSiteBrand } from "./useSiteBrand";
import Link from "./LangLink";
import { ByWelabs } from "./ByWelabs";
import { publicSlug } from "@/lib/public-slugs";
import { isHiddenProduct } from "@/lib/catalog";
import { imagineHref } from "@/lib/sister-site";

// PRODUTOS DO RODAPÉ
// Official dark logos (sized by height only) with the verb each product plays in the chain
const FOOTER_PRODUCTS: {
  slug: string;
  name: string;
  logo?: string;
  verb: { pt: string; en: string };
}[] = [
  {
    slug: "erp",
    name: "Domus",
    logo: "/brands/welabs/products/domus-dark.svg",
    verb: { pt: "define", en: "defines" },
  },
  {
    slug: "welabs-crm",
    name: "Relloo",
    logo: "/brands/welabs/products/relloo-dark.svg",
    verb: { pt: "atende", en: "engages" },
  },
  {
    slug: "flow",
    name: "Magneto",
    logo: "/brands/welabs/products/magneto-dark.svg",
    // Magneto is named by its function, workflow (operator, 2026-10-08)
    verb: { pt: "workflow", en: "workflow" },
  },
  {
    slug: "channels",
    name: "Tuner",
    logo: "/brands/welabs/products/tuner-dark.svg",
    verb: { pt: "entrega", en: "delivers" },
  },
  {
    slug: "wekb",
    name: "Knowly",
    logo: "/brands/welabs/products/knowly-dark.svg",
    verb: { pt: "explica", en: "explains" },
  },
  {
    slug: "malupe",
    name: "Ecossistema Monitoramento",
    verb: { pt: "monitora", en: "monitors" },
  },
];

export function Footer() {
  const { t, lang } = useT();
  const brand = useSiteBrand();
  // Sister company on its own site; the column is hidden while NEXT_PUBLIC_IMAGINE_URL is not set.
  const imagineHome = imagineHref("/", lang);
  const imaginePortfolio = imagineHref("/portfolio", lang);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid-main">
          <div className="footer-brand">
            <img src={brand.logo} alt="Welabs" className="logo-img" />
            <p className="footer-desc">
              {lang === "en"
                ? "We develop products connecting management, relationships, automation, channels and knowledge."
                : "Desenvolvemos produtos que conectam gestão, relacionamento, automação, canais e conhecimento."}
            </p>
            <p className="footer-motto">
              {/* Brand 1.5.0: the motto can be the first mention of Domus on a page */}
              Domus
              <ByWelabs />{" "}
              {lang === "en"
                ? "defines. The others bring it to life."
                : "define. Os outros dão vida."}
            </p>
          </div>
          <div className="footer-nav-col footer-products">
            <h4>{lang === "en" ? "Our products" : "Nossos produtos"}</h4>
            <ul>
              {/* Weight order of the Welabs products (operator, 2026-10-08); each one by its logo and verb */}
              {FOOTER_PRODUCTS
                // Hidden products (lib/catalog.ts) leave the navigation
                .filter((p) => !isHiddenProduct(p.slug))
                .map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/produtos/${publicSlug(p.slug)}`}
                      className="footer-product"
                    >
                      {p.logo ? (
                        <img
                          src={p.logo}
                          alt={p.name}
                          className="footer-product-logo"
                        />
                      ) : (
                        <span className="footer-product-name">{p.name}</span>
                      )}
                      <span className="footer-product-verb">
                        {lang === "en" ? p.verb.en : p.verb.pt}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          <div className="footer-nav-col">
            <h4>Welabs</h4>
            <ul>
              <li>
                <Link href="/sobre">
                  {lang === "en" ? "About Welabs" : "A Welabs"}
                </Link>
              </li>
              <li>
                <Link href={brand.collection}>
                  {lang === "en" ? "Our ecosystem" : "Nosso ecossistema"}
                </Link>
              </li>
            </ul>
          </div>
          {/* Sister company: the Welabs site links back to the Imagine site */}
          {imagineHome && imaginePortfolio && (
            <div className="footer-nav-col">
              <h4>Imagine Apps</h4>
              <ul>
                <li>
                  <a href={imagineHome}>
                    {lang === "en" ? "Imagine home" : "Início da Imagine"}
                  </a>
                </li>
                <li>
                  <a href={imaginePortfolio}>
                    {lang === "en" ? "Imagine portfolio" : "Portfólio Imagine"}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="footer-bottom">
          <p>
            © 2026 Welabs. <span>{t("footer-rights")}</span>
          </p>
          <a href="#top" className="footer-top">
            {lang === "en" ? "Back to top" : "Voltar ao topo"}{" "}
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

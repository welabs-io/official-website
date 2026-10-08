"use client";
import { useT } from "./LangProvider";
import { useSiteBrand } from "./useSiteBrand";
import Link from "./LangLink";
import { publicSlug } from "@/lib/public-slugs";
import { isHiddenProduct } from "@/lib/catalog";
import { imagineHref } from "@/lib/sister-site";

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
                ? "We develop products connecting management, automation and knowledge."
                : "Desenvolvemos produtos que conectam gestão, automação e conhecimento."}
            </p>
          </div>
          <div className="footer-nav-col">
            <h4>{lang === "en" ? "Our products" : "Nossos produtos"}</h4>
            <ul>
              {/* Weight order of the Welabs products (operator, 2026-10-08) */}
              {[
                ["erp", "Domus"],
                ["welabs-crm", "Relloo"],
                ["flow", "Magneto"],
                ["channels", "Tuner"],
                ["wekb", "Knowly"],
                [
                  "malupe",
                  lang === "en"
                    ? "Monitoring Ecosystem"
                    : "Ecossistema Monitoramento",
                ],
              ]
                // Hidden products (lib/catalog.ts) leave the navigation
                .filter(([slug]) => !isHiddenProduct(slug))
                .map(([slug, name]) => (
                  <li key={slug}>
                    <Link href={`/produtos/${publicSlug(slug)}`}>{name}</Link>
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
        </div>
      </div>
    </footer>
  );
}

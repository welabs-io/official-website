"use client";
import { useState } from "react";
import { NavLink } from "./NavLink";
import { usePathname } from "next/navigation";
import { useT } from "./LangProvider";
import { useSiteBrand } from "./useSiteBrand";
import { imagineHref } from "@/lib/sister-site";
export function Header() {
  const { lang, setLang, switching } = useT();
  const en = lang === "en",
    brand = useSiteBrand();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // The last entry crosses to the sister company's own site (NEXT_PUBLIC_IMAGINE_URL), so each site reaches the other.
  const imagine = imagineHref("/", lang);
  const entries = [
    ["/", en ? "Home" : "Início"],
    ["/produtos", en ? "Products" : "Produtos"],
    ["/solucoes", en ? "Solutions" : "Soluções"],
    ["/sobre", en ? "About Welabs" : "A Welabs"],
    ...(imagine ? [[imagine, "Imagine"]] : []),
  ];
  return (
    <header
      className="header"
      onKeyDown={(event) => {
        if (event.key === "Escape") setMobileOpen(false);
      }}
    >
      <div className="container">
        <NavLink href={brand.home} className="logo">
          <img src={brand.logo} alt={brand.name} className="logo-img" />
        </NavLink>
        <nav
          id="primary-navigation"
          aria-label={en ? "Main navigation" : "Navegação principal"}
          className={`nav${mobileOpen ? " mobile-active" : ""}`}
        >
          <ul className="nav-list">
            {entries.map(([url, label]) => (
              <li key={url}>
                <NavLink
                  href={url}
                  aria-current={pathname === url ? "page" : undefined}
                  className={`nav-link${pathname === url ? " active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                href="/produtos"
                className="nav-link btn-contact"
                onClick={() => setMobileOpen(false)}
              >
                {en ? "Explore products" : "Explorar produtos"}
              </NavLink>
            </li>
            <li className="lang-switcher">
              <button
                className={`lang-btn${en ? " active" : ""}`}
                onClick={() => setLang("en")}
                disabled={switching || en}
                aria-label="English"
              >
                EN
              </button>
              <span aria-hidden="true">|</span>
              <button
                className={`lang-btn${!en ? " active" : ""}`}
                onClick={() => setLang("pt")}
                disabled={switching || !en}
                aria-label="Português"
              >
                PT
              </button>
            </li>
          </ul>
        </nav>
        <button
          className={`menu-toggle${mobileOpen ? " active" : ""}`}
          aria-label={
            mobileOpen
              ? en
                ? "Close menu"
                : "Fechar menu"
              : en
                ? "Open menu"
                : "Abrir menu"
          }
          aria-expanded={mobileOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

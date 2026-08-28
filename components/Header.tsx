'use client';
import { useState, useEffect } from 'react';
import { NavLink } from './NavLink';
import { usePathname } from 'next/navigation';
import { useT } from './LangProvider';

export function Header() {
  const { t, lang, setLang, switching } = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    if (!isHome) return;
    const sections = document.querySelectorAll('section[id]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.getAttribute('id'));
        });
      },
      { threshold: 0.5 },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [isHome]);

  const isActive = (hash: string, home?: boolean) => {
    if (home) return isHome && (activeSection === 'hero' || !activeSection);
    return isHome && activeSection === hash.replace('#', '');
  };

  return (
    <header className="header">
      <div className="container">
        <NavLink href="/" className="logo">
          <img src="/imagine-logo.svg" alt="Imagine Apps" className="logo-img" />
        </NavLink>
        <nav id="primary-navigation" className={`nav${mobileOpen ? ' mobile-active' : ''}`}>
          <ul className="nav-list">
            <li>
              <NavLink href="/" className={`nav-link${isActive('', true) ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                {t('nav-home')}
              </NavLink>
            </li>
            <li>
              <NavLink href="/sobre" className={`nav-link${pathname === '/sobre' ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                {t('nav-about')}
              </NavLink>
            </li>
            <li>
              <NavLink href="/#servicos" className={`nav-link${isActive('#servicos') ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                {t('nav-services')}
              </NavLink>
            </li>
            <li>
              <NavLink href="/#cases" className={`nav-link${isActive('#cases') ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                {t('nav-cases')}
              </NavLink>
            </li>
            <li>
              <NavLink href="/#contato" className={`nav-link btn-contact${isActive('#contato') ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                {t('nav-contact')}
              </NavLink>
            </li>
            <li className="lang-switcher">
              <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')} disabled={switching || lang === 'en'}>EN</button>
              <span>|</span>
              <button className={`lang-btn${lang === 'pt' ? ' active' : ''}`} onClick={() => setLang('pt')} disabled={switching || lang === 'pt'}>PT</button>
            </li>
          </ul>
        </nav>
        <button
          className={`menu-toggle${mobileOpen ? ' active' : ''}`}
          aria-label={t('aria-open-menu')}
          aria-expanded={mobileOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}

'use client';
import { NavLink } from './NavLink';
import { useT } from './LangProvider';

export function Footer() {
  const { t } = useT();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid-main">
          <div className="footer-brand">
            <img src="/imagine-logo.svg" alt="Imagine Apps" className="logo-img" />
            <p className="footer-desc">{t('footer-desc')}</p>
          </div>
          <div className="footer-nav-col">
            <h4>{t('footer-nav-title')}</h4>
            <ul>
              <li><NavLink href="/">{t('footer-nav-home')}</NavLink></li>
              <li><NavLink href="/sobre">{t('footer-nav-about')}</NavLink></li>
              <li><NavLink href="/#servicos">{t('footer-nav-services')}</NavLink></li>
              <li><NavLink href="/#cases">{t('footer-nav-cases')}</NavLink></li>
            </ul>
          </div>
          <div className="footer-nav-col">
            <h4>{t('footer-contact-title')}</h4>
            <ul>
              <li><a href="mailto:contato@imagineapps.com.br">contato@imagineapps.com.br</a></li>
              <li><span>Av. Conselheiro Aguiar, 2738 - Sala 402</span></li>
              <li><span>Boa Viagem - Recife, PE</span></li>
            </ul>
          </div>
          <div className="footer-nav-col">
            <h4>{t('footer-social-title')}</h4>
            <div className="social-icons-footer">
              <a href="https://www.linkedin.com/company/imagine-apps/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://instagram.com/imagineapps.br" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Imagine Apps. CNPJ: 20.511.064/0001-64. <span>{t('footer-rights')}</span></p>
        </div>
      </div>
    </footer>
  );
}

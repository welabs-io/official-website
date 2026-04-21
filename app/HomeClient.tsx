'use client';
import { useT } from '@/components/LangProvider';
import { useDocumentTitle } from '@/components/useDocumentTitle';
import { WorkCarousel } from '@/components/WorkCarousel';
import { CtaSection } from '@/components/CtaSection';

export default function HomePage() {
  const { t } = useT();
  useDocumentTitle('page-title');
  return (
    <>
      <section id="hero" className="hero-engineering">
        <div className="container">
          <div className="hero-wrapper">
            <div className="hero-meta fade-in">
              <span className="meta-tag">{t('hero-tag')}</span>
            </div>
            <div className="hero-main-title">
              <h1 className="fade-in">
                <span className="text-white">{t('hero-title-1')}</span><br />
                <span className="outline-glow">{t('hero-title-2')}</span><br />
                <span className="text-white">{t('hero-title-3')}</span>
              </h1>
            </div>
            <div className="hero-footer fade-in">
              <div className="hero-desc-container">
                <p className="hero-subtext">{t('hero-subtitle')}</p>
              </div>
              <div className="hero-actions">
                <a href="#servicos" className="btn btn-primary">{t('hero-btn-primary')}</a>
                <a href="#contato" className="btn btn-outline">{t('hero-btn-outline')}</a>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-blueprint"></div>
        <div className="bg-scanlines"></div>
        <div className="scroll-indicator">
          <div className="mouse"><div className="wheel"></div></div>
          <span>{t('scroll-text')}</span>
        </div>
      </section>

      <section className="metrics">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-number">1.8Mi+</span>
              <span className="metric-label">{t('metric-people')}</span>
            </div>
            <div className="metric-item">
              <span className="metric-number">20+</span>
              <span className="metric-label">{t('metric-projects')}</span>
            </div>
            <div className="metric-item">
              <span className="metric-number">11+</span>
              <span className="metric-label">{t('metric-years')}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="servicos" className="services section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t('services-tag')}</span>
            <h2 className="section-title">{t('services-title')}</h2>
          </div>
          <div className="services-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="service-card">
                <div className="service-icon">{`0${n}`}</div>
                <h3>{t(`service-${n}-title`)}</h3>
                <p>{t(`service-${n}-desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="processo" className="process section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t('process-tag')}</span>
            <h2 className="section-title">{t('process-title')}</h2>
          </div>
          <div className="process-steps">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="step">
                <span className="step-num">{`0${n}.`}</span>
                <div className="step-content">
                  <h3>{t(`process-${n}-title`)}</h3>
                  <p>{t(`process-${n}-desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cases" className="work section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t('portfolio-tag')}</span>
            <h2 className="section-title">{t('portfolio-title')}</h2>
          </div>
          <WorkCarousel />
        </div>
      </section>

      <section className="partners section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t('partners-tag')}</span>
            <h2 className="section-title">{t('partners-title')}</h2>
          </div>
          <div className="partners-grid">
            {[
              { href: 'https://www.neoenergia.com/', logo: '/brands/neoenergia.png', alt: 'Neoenergia', url: 'neoenergia.com' },
              { href: 'https://www.light.com.br/SitePages/home.aspx', logo: '/brands/light.png', alt: 'Light', url: 'light.com.br' },
              { href: 'https://www.stant.com.br/', logo: '/brands/stant.svg', alt: 'Stant', url: 'stant.com.br' },
              { href: 'https://www.avsibrasil.org.br/', logo: '/brands/avsi.png', alt: 'AVSI Brasil', url: 'avsibrasil.org.br' },
              { href: 'https://licenciamento.ima.al.gov.br/#/requerente/conta/entrar', logo: '/brands/ima.svg', alt: 'IMA', url: 'ima.al.gov.br' },
              { href: 'https://sp.ecoenel.avsi.eco.br/usuarios/login', logo: '/brands/ecoenel.png', alt: 'Ecoenel', url: 'ecoenel.avsi.eco.br' },
              { href: 'https://crm.kioskbrands.com/login', logo: '/brands/kiosk-brands.svg', alt: 'Kiosk Brands', url: 'kioskbrands.com' },
              { href: 'https://centralesg.report/sign-in', logo: '/brands/report.svg', alt: 'Report', url: 'centralesg.report' },
              { href: 'https://tabe.la/', logo: '/brands/tabela.svg', alt: 'Tabela', url: 'tabe.la' },
            ].map((b) => (
              <a key={b.url} href={b.href} target="_blank" rel="noopener noreferrer" className="brand-card">
                <div className="brand-logo"><img src={b.logo} alt={b.alt} /></div>
                <span className="brand-url">{b.url}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <CtaSection formId="direct-contact-form" />
    </>
  );
}

'use client';
import { useT } from '@/components/LangProvider';
import { useDocumentTitle } from '@/components/useDocumentTitle';
import { CtaSection } from '@/components/CtaSection';
import { Trans } from '@/components/Trans';

export default function AboutPage() {
  const { t } = useT();
  useDocumentTitle('about-page-title');
  return (
    <>
      <section id="sobre" className="about-hero-ultra">
        <div className="container">
          <div className="hero-grid-layout">
            <div className="hero-top-meta fade-in">
              <span className="tag-box">{t('about-hero-est')}</span>
              <span className="tag-box">{t('about-hero-tag')}</span>
            </div>
            <div className="hero-main-title">
              <Trans k="about-hero-title" as="h1" className="fade-in" />
            </div>
            <div className="hero-bottom-grid fade-in">
              <div className="hero-stat-mini">
                <span className="blue-line"></span>
                <p>{t('about-hero-stat')}</p>
              </div>
              <div className="hero-manifesto">
                <p>{t('about-hero-manifesto')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-grid-lines"></div>
        <div className="floating-year">2014</div>
        <div className="hero-glow-sphere"></div>
        <div className="scroll-indicator">
          <div className="mouse"><div className="wheel"></div></div>
          <span>{t('scroll-text')}</span>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="about-grid">
            <div className="about-text fade-in">
              <h2 className="section-title">{t('about-who-title')}</h2>
              <p className="large-p">{t('about-who-p1')}</p>
              <p>{t('about-who-p2')}</p>
              <p>{t('about-who-p3')}</p>
            </div>
            <div className="about-stats fade-in">
              <div className="stat-box">
                <span className="stat-num">{t('stat-impact-title')}</span>
                <p>{t('stat-impact-desc')}</p>
              </div>
              <div className="stat-box">
                <span className="stat-num">ESG</span>
                <p>{t('stat-esg-desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding values-section">
        <div className="container">
          <div className="section-header center">
            <span className="section-tag">{t('values-tag')}</span>
            <h2 className="section-title">{t('values-title')}</h2>
          </div>
          <div className="values-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="value-card fade-in">
                <div className="value-icon">{`0${n}`}</div>
                <h3>{t(`value-${n}-title`)}</h3>
                <p>{t(`value-${n}-desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="philosophy-box fade-in">
            <div className="philosophy-content">
              <Trans k="philosophy-title" as="h2" />
              <p>{t('philosophy-desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <CtaSection formId="direct-contact-form-about" />
    </>
  );
}

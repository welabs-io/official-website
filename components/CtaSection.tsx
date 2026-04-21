'use client';
import { useT } from './LangProvider';
import { ContactForm } from './ContactForm';
import { Trans } from './Trans';

export function CtaSection({ formId }: { formId: string }) {
  const { t } = useT();
  return (
    <section id="contato" className="cta-section section-padding">
      <div className="container">
        <div className="cta-wrapper">
          <div className="cta-content-left">
            <span className="section-tag">{t('cta-tag')}</span>
            <Trans k="cta-title" as="h2" className="cta-title" />
            <p className="cta-description">{t('cta-desc')}</p>
          </div>
          <div className="cta-form-right">
            <ContactForm id={formId} />
          </div>
        </div>
      </div>
      <div className="cta-bg-texture"></div>
    </section>
  );
}

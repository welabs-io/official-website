'use client';
import Link from 'next/link';
import { useT } from '@/components/LangProvider';

export default function NotFound() {
  const { t, lang } = useT();
  return (
    <section className="section-padding" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 className="section-title" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}>404</h1>
        <p style={{ marginBottom: '2rem' }}>
          {lang === 'pt' ? 'Página não encontrada.' : 'Page not found.'}
        </p>
        <Link href="/" className="btn btn-primary">{t('nav-home')}</Link>
      </div>
    </section>
  );
}

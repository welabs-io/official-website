'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useT } from './LangProvider';
import { getProject, type ProjectId } from '@/lib/projects';
import { getPortfolioCopy } from '@/lib/portfolio-copy';
import Link from 'next/link';

type Ctx = { open: (id: ProjectId) => void };
const ModalCtx = createContext<Ctx | null>(null);
export function useProjectModal() {
  const c = useContext(ModalCtx);
  if (!c) throw new Error('useProjectModal must be used inside ProjectModalProvider');
  return c;
}

export function ProjectModalProvider({ children }: { children: React.ReactNode }) {
  const { t, lang } = useT();
  const [projectId, setProjectId] = useState<ProjectId | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((id: ProjectId) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setProjectId(id);
  }, []);
  const close = useCallback(() => setProjectId(null), []);

  useEffect(() => {
    if (projectId) {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = sbw ? `${sbw}px` : '';
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => dialogRef.current?.focus());
    } else {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
      triggerRef.current?.focus();
    }
    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    };
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close, projectId]);

  const project = projectId ? getProject(projectId) : null;
  const copy = project ? getPortfolioCopy(project.product, lang === 'en') : null;
  const img = project?.image ?? '';
  const title = project?.product.title ?? '';
  const cat = copy?.sector ?? '';
  const desc = copy?.challenge ?? '';
  const features = copy?.capabilities ?? [];

  return (
    <ModalCtx.Provider value={{ open }}>
      {children}
      <div
        className={`modal${projectId ? ' active' : ''}`}
        aria-hidden={!projectId}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div
          ref={dialogRef}
          className="modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          tabIndex={-1}
        >
          <button className="modal-close" aria-label={t('aria-close-modal')} onClick={close}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div className="modal-body">
            <div className="modal-left">
              {img && <img src={img} alt={`${title} — recriação ilustrativa com dados fictícios`} />}
              <p style={{ fontSize: 11, color: '#899ba5', paddingTop: 12 }}>{lang === 'en' ? 'Illustrative recreation · fictional data' : 'Recriação ilustrativa · dados fictícios'}</p>
            </div>
            <div className="modal-right">
              <div className="modal-header-info">
                <div className="modal-header-left">
                  <span className="section-tag">{cat}</span>
                  <h2 id="project-modal-title">{title}</h2>
                </div>
                <div className="modal-scroll-hint">
                  <div className="mouse-mini"><div className="wheel-mini"></div></div>
                  <span>{t('scroll-text')}</span>
                </div>
              </div>
              <div className="modal-description">{desc}</div>
              <div className="modal-features">
                <h4>{t('modal-features-title')}</h4>
                <ul>
                  {features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              {project && <Link href={`/portfolio-preview/${project.product.slug}`} onClick={close} style={{ display: 'inline-block', marginTop: 24, color: '#0098da' }}>{lang === 'en' ? 'Explore the product →' : 'Conhecer o produto →'}</Link>}
            </div>
          </div>
        </div>
      </div>
    </ModalCtx.Provider>
  );
}

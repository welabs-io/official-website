'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useT } from './LangProvider';
import { getProject, type ProjectId } from '@/lib/projects';

type Ctx = { open: (id: ProjectId) => void };
const ModalCtx = createContext<Ctx | null>(null);
export function useProjectModal() {
  const c = useContext(ModalCtx);
  if (!c) throw new Error('useProjectModal must be used inside ProjectModalProvider');
  return c;
}

export function ProjectModalProvider({ children }: { children: React.ReactNode }) {
  const { t } = useT();
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

  const img = projectId ? getProject(projectId).image : '';
  const title = projectId ? t(`portfolio-${projectId}-title`) : '';
  const cat = projectId ? t(`portfolio-${projectId}-cat`) : '';
  const descKey = projectId ? `modal-${projectId}-desc` : '';
  const desc = projectId ? (t(descKey) !== descKey ? t(descKey) : t('modal-generic-desc')) : '';

  const features: string[] = [];
  if (projectId) {
    const base = t(`modal-${projectId}-f1`) !== `modal-${projectId}-f1` ? projectId : 'generic';
    for (let i = 1; i <= 4; i++) {
      const k = `modal-${base}-f${i}`;
      const v = t(k);
      if (v && v !== k) features.push(v);
    }
  }

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
              {img && <img src={img} alt={title || 'Projeto'} />}
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
            </div>
          </div>
        </div>
      </div>
    </ModalCtx.Provider>
  );
}

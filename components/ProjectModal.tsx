'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useT } from './LangProvider';

const projectImages: Record<string, string> = {
  kiosk: '/portfolio/kiosk-brands.png',
  tabela: '/portfolio/tabela.png',
  avsi: '/portfolio/avsi.png',
  'avsi-acec': '/portfolio/avsi-acec.png',
  'eco-enel': '/portfolio/eco-enel.png',
  ima: '/portfolio/ima.png',
  light: '/portfolio/light.png',
  stant: '/portfolio/stant.png',
  report: '/portfolio/report.png',
  loquei: '/portfolio/loquei.png',
  central: '/portfolio/central.png',
};

type Ctx = { open: (id: string) => void };
const ModalCtx = createContext<Ctx | null>(null);
export function useProjectModal() {
  const c = useContext(ModalCtx);
  if (!c) throw new Error('useProjectModal must be used inside ProjectModalProvider');
  return c;
}

export function ProjectModalProvider({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  const [projectId, setProjectId] = useState<string | null>(null);
  const scrollRef = useRef(0);

  const open = useCallback((id: string) => {
    if (!projectImages[id]) return;
    setProjectId(id);
  }, []);
  const close = useCallback(() => setProjectId(null), []);

  useEffect(() => {
    if (projectId) {
      scrollRef.current = window.pageYOffset;
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = sbw ? `${sbw}px` : '';
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
    } else {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    }
  }, [projectId]);

  const img = projectId ? projectImages[projectId] : '';
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
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div className="modal-content">
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
                  <h2>{title}</h2>
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

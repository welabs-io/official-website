'use client';
import { useEffect, useRef, useState } from 'react';
import { useT } from './LangProvider';
import { useProjectModal } from './ProjectModal';

const projects = [
  { id: 'kiosk', img: '/portfolio/kiosk-brands.png', alt: 'Kiosk Brands' },
  { id: 'tabela', img: '/portfolio/tabela.png', alt: 'Tabela Gestão' },
  { id: 'stant', img: '/portfolio/stant.png', alt: 'Stant' },
  { id: 'report', img: '/portfolio/report.png', alt: 'Report ESG' },
  { id: 'avsi', img: '/portfolio/avsi.png', alt: 'AVSI Brasil' },
  { id: 'eco-enel', img: '/portfolio/eco-enel.png', alt: 'EcoEnel' },
  { id: 'light', img: '/portfolio/light.png', alt: 'Light' },
  { id: 'ima', img: '/portfolio/ima.png', alt: 'IMA Alagoas' },
  { id: 'central', img: '/portfolio/central.png', alt: 'Central ESG' },
  { id: 'loquei', img: '/portfolio/loquei.png', alt: 'Loquei' },
  { id: 'avsi-acec', img: '/portfolio/avsi-acec.png', alt: 'AVSI ACEC' },
];

function getItemsVisible() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth > 1024) return 3;
  if (window.innerWidth > 768) return 2;
  return 1;
}

export function WorkCarousel() {
  const { t } = useT();
  const { open } = useProjectModal();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [visible, setVisible] = useState(3);

  const total = projects.length;

  const apply = (i: number) => {
    const v = getItemsVisible();
    setVisible(v);
    const maxIndex = Math.max(0, total - v);
    let next = i;
    if (next > maxIndex) next = 0;
    if (next < 0) next = maxIndex;
    setIndex(next);
    if (trackRef.current) {
      const itemWidth = 100 / v;
      trackRef.current.style.transform = `translateX(-${next * itemWidth}%)`;
    }
  };

  const next = () => apply(index + 1);
  const prev = () => apply(index - 1);

  const resetAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => { apply(indexRef.current + 1); }, 10000);
  };

  // keep latest index in ref for autoplay closure
  const indexRef = useRef(index);
  useEffect(() => { indexRef.current = index; }, [index]);

  useEffect(() => {
    apply(0);
    resetAutoplay();
    const onResize = () => apply(indexRef.current);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="carousel-container">
      <div className="work-track" ref={trackRef}>
        {projects.map((p) => (
          <div
            key={p.id}
            className="work-card"
            data-project={p.id}
            onClick={(e) => { e.preventDefault(); open(p.id); }}
          >
            <div className="work-img">
              <img loading="lazy" decoding="async" src={p.img} alt={p.alt} />
            </div>
            <div className="work-info">
              <span className="work-category">{t(`portfolio-${p.id}-cat`)}</span>
              <h3>{t(`portfolio-${p.id}-title`)}</h3>
              <p>{t(`portfolio-${p.id}-desc`)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-nav">
        <button className="carousel-btn prev" aria-label={t('aria-prev')} onClick={() => { prev(); resetAutoplay(); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button className="carousel-btn next" aria-label={t('aria-next')} onClick={() => { next(); resetAutoplay(); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <div className="carousel-pagination">
        {Array.from({ length: Math.max(1, total - visible + 1) }).map((_, i) => (
          <div
            key={i}
            className={`dot${i === index ? ' active' : ''}`}
            onClick={() => { apply(i); resetAutoplay(); }}
          />
        ))}
      </div>
    </div>
  );
}

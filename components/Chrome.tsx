'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useT } from './LangProvider';
import { useSiteBrand } from './useSiteBrand';

type NavCtx = { navigate: (href: string) => void };
const NavContext = createContext<NavCtx | null>(null);
export function useNav() {
  const c = useContext(NavContext);
  if (!c) throw new Error('useNav must be used inside PreloaderProvider');
  return c;
}

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const firstLoadRef = useRef(true);
  const navigatingRef = useRef(false);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      const hide = () => setTimeout(() => setLoaded(true), 600);
      if (document.readyState === 'complete') hide();
      else window.addEventListener('load', hide);
      return () => window.removeEventListener('load', hide);
    }
    navigatingRef.current = false;
    const id = setTimeout(() => setLoaded(true), 400);
    return () => clearTimeout(id);
  }, [pathname]);

  const navigate = (href: string) => {
    if (navigatingRef.current) return;
    const [path] = href.split('#');
    if (path === pathname || path === '') {
      router.push(href);
      return;
    }
    navigatingRef.current = true;
    setLoaded(false);
    requestAnimationFrame(() => requestAnimationFrame(() => router.push(href)));
  };

  return (
    <NavContext.Provider value={{ navigate }}>
      <PreloaderView loaded={loaded} />
      {children}
    </NavContext.Provider>
  );
}

function PreloaderView({ loaded }: { loaded: boolean }) {
  const brand = useSiteBrand();
  return (
    <div id="preloader" className={loaded ? 'loaded' : ''}>
      <div className="loader-content">
        <div className="loader-logo">
          <img src={brand.favicon} alt={`${brand.name} Logo`} />
        </div>
        <div className="loader-ring"></div>
      </div>
      <div className="loader-progress">
        <div className="progress-bar"></div>
      </div>
    </div>
  );
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mx = 0, my = 0, fx = 0, fy = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', onMove);

    let raf = 0;
    const tick = () => {
      fx += (mx - fx) * 0.1;
      fy += (my - fy) * 0.1;
      cursor.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      follower.style.transform = `translate3d(${fx}px, ${fy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    const HOVER_SELECTOR = 'a, button, .work-card, .brand-card';
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(HOVER_SELECTOR)) follower.classList.add('hover');
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(HOVER_SELECTOR)) follower.classList.remove('hover');
    };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="cursor"></div>
      <div ref={followerRef} className="cursor-follower"></div>
    </>
  );
}

export function ScrollTop() {
  const { t } = useT();
  const [active, setActive] = useState(false);
  useEffect(() => {
    const onScroll = () => setActive(window.pageYOffset > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`scroll-top${active ? ' active' : ''}`}
      aria-label={t('aria-scroll-top')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
    </button>
  );
}

export function RevealOnScroll() {
  useEffect(() => {
    const reveal = () => {
      document.querySelectorAll('.fade-in, .service-card, .step, .work-card').forEach((el) => {
        if ((el as HTMLElement).getBoundingClientRect().top < window.innerHeight - 150) {
          el.classList.add('active');
        }
      });
    };
    reveal();
    window.addEventListener('scroll', reveal);
    return () => window.removeEventListener('scroll', reveal);
  }, []);
  return null;
}

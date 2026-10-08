'use client';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useT } from './LangProvider';

type NavCtx = { navigate: (href: string) => void };
const NavContext = createContext<NavCtx | null>(null);
export function useNav() {
  const c = useContext(NavContext);
  if (!c) throw new Error('useNav must be used inside PreloaderProvider');
  return c;
}

type TransitionDocument = Document & { startViewTransition?: (update: () => Promise<void>) => unknown };

// NAVEGAÇÃO COM TRANSIÇÃO DE PÁGINA
// Route changes run inside the View Transitions API when available; the previous full-screen
// preloader was removed because it delayed every first paint by at least 600 ms.
export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pending = useRef<(() => void) | null>(null);

  // The new route has committed: let the browser capture the incoming snapshot.
  useLayoutEffect(() => {
    pending.current?.();
    pending.current = null;
  }, [pathname]);

  const navigate = useCallback((href: string) => {
    const [path] = href.split(/[?#]/);
    const doc = document as TransitionDocument;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (path === pathname || path === '' || !doc.startViewTransition || reduced) {
      router.push(href);
      return;
    }
    doc.startViewTransition(() => new Promise<void>((resolve) => {
      pending.current = resolve;
      router.push(href);
      // Never hold the page frozen if the route does not commit (e.g. a redirect).
      window.setTimeout(resolve, 1500);
    }));
  }, [pathname, router]);

  const value = useMemo(() => ({ navigate }), [navigate]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function ScrollTop() {
  const { t } = useT();
  const [active, setActive] = useState(false);
  useEffect(() => {
    const onScroll = () => setActive(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`scroll-top${active ? ' active' : ''}`}
      aria-label={t('aria-scroll-top')}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>
    </button>
  );
}

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { translations, type Lang } from '@/lib/translations';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  switching: boolean;
};

const LangContext = createContext<Ctx | null>(null);

function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const list = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || 'en'];
  for (const l of list) {
    const code = (l || '').toLowerCase().split('-')[0];
    if (code === 'pt') return 'pt';
    if (code === 'en') return 'en';
  }
  return 'en';
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('pt');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('lang');
    const saved = localStorage.getItem('preferredLang');
    const initial = query === 'pt' || query === 'en'
      ? query
      : saved === 'pt' || saved === 'en'
        ? saved
        : detectBrowserLang();
    queueMicrotask(() => {
      setLangState(initial);
      document.documentElement.lang = initial === 'pt' ? 'pt-BR' : 'en';
    });
  }, []);

  const switchingRef = useRef(false);
  const setLang = useCallback((l: Lang) => {
    if (switchingRef.current) return;
    switchingRef.current = true;
    setSwitching(true);
    document.body.classList.add('lang-switching');
    setTimeout(() => {
      setLangState(l);
      localStorage.setItem('preferredLang', l);
      document.documentElement.lang = l === 'pt' ? 'pt-BR' : 'en';
      setTimeout(() => {
        document.body.classList.remove('lang-switching');
        switchingRef.current = false;
        setSwitching(false);
      }, 100);
    }, 150);
  }, []);

  const t = useCallback((key: string) => translations[lang][key] ?? key, [lang]);
  const value = useMemo(() => ({ lang, setLang, t, switching }), [lang, setLang, t, switching]);

  return (
    <LangContext.Provider value={value}>{children}</LangContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useT must be used inside LangProvider');
  return ctx;
}

'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  const [lang, setLangState] = useState<Lang>('en');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('preferredLang') as Lang | null;
    const initial = saved === 'pt' || saved === 'en' ? saved : detectBrowserLang();
    setLangState(initial);
    document.documentElement.lang = initial === 'pt' ? 'pt-BR' : 'en';
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

  return (
    <LangContext.Provider value={{ lang, setLang, t, switching }}>{children}</LangContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useT must be used inside LangProvider');
  return ctx;
}

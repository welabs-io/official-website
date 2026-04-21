'use client';
import { useEffect } from 'react';
import { useT } from './LangProvider';

export function useDocumentTitle(key: string) {
  const { t, lang } = useT();
  useEffect(() => {
    document.title = t(key);
  }, [t, lang, key]);
}

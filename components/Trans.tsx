'use client';
import type { ElementType } from 'react';
import { useT } from './LangProvider';

export function Trans({ k, as: Tag = 'span', className }: { k: string; as?: ElementType; className?: string }) {
  const { t } = useT();
  const value = t(k);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: value }} />;
}

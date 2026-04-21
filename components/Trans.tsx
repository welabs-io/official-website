'use client';
import { useT } from './LangProvider';

export function Trans({ k, as: Tag = 'span', className }: { k: string; as?: keyof JSX.IntrinsicElements; className?: string }) {
  const { t } = useT();
  const value = t(k);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: value }} />;
}

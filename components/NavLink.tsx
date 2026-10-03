'use client';
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { useNav } from './Chrome';
import {localizedHref,useT} from './LangProvider';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export const NavLink = forwardRef<HTMLAnchorElement, Props>(function NavLink(
  { href, onClick, children, ...rest },
  ref,
) {
  const { navigate } = useNav();
  const {lang}=useT();
  const destination=localizedHref(href,lang);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target && rest.target !== '_self') return;
    if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    e.preventDefault();
    navigate(destination);
  };

  return (
    <a ref={ref} href={destination} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
});

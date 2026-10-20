// SEÇÃO DO TEMPLATE
// One band of the page: the anchor, the live marker that makes everything inside pause off screen (LiveObserver), the
// surface (the page, the soft band or the contact: v2.1, the warm halo in place of the amber field), the spacing class
// and the heading for screen readers. Server markup only.
import type { ReactNode } from "react";
import home from "@/components/onepage/home.module.css";
import shell from "@/components/onepage/shell.module.css";
import type { SectionPad } from "@/lib/site-config";

export function Section({
  id,
  pad,
  srTitle,
  surface,
  children,
}: {
  id: string;
  pad: SectionPad;
  srTitle?: string;
  surface?: "band" | "contact";
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`${shell.band} ${shell.light} ${home[pad]}`}
      data-surface={surface}
      data-live
      data-on="false"
    >
      {srTitle && <h2 className={home.srOnly}>{srTitle}</h2>}
      {children}
    </section>
  );
}

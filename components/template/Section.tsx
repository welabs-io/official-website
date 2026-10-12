// SEÇÃO DO TEMPLATE
// One band of the page: the anchor, the live marker that makes everything inside pause off screen (LiveObserver), the
// tone (graphite or cream), the spacing class and the heading for screen readers. Server markup only.
import type { ReactNode } from "react";
import home from "@/components/onepage/home.module.css";
import shell from "@/components/onepage/shell.module.css";
import type { SectionPad, Tone } from "@/lib/site-config";

export function Section({
  id,
  tone,
  pad,
  srTitle,
  children,
}: {
  id: string;
  tone: Tone;
  pad: SectionPad;
  srTitle?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`${shell.band} ${shell[tone]} ${home[pad]}`}
      data-live
      data-on="false"
    >
      {srTitle && <h2 className={home.srOnly}>{srTitle}</h2>}
      {children}
    </section>
  );
}

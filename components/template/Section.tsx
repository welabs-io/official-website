// SEÇÃO DO TEMPLATE
// One band of the page: the anchor, the live marker that makes everything inside pause off screen (LiveObserver), the
// tone (graphite or cream), the spacing class and the heading for screen readers. Server markup only.
import type { ReactNode } from "react";
import home from "@/components/onepage/home.module.css";
import shell from "@/components/onepage/shell.module.css";
import type { SectionPad, Tone } from "@/lib/site-config";
import { ConnectorRail } from "./ConnectorRail";

export function Section({
  id,
  tone,
  pad,
  srTitle,
  thread = "on",
  rail,
  railDelay,
  children,
}: {
  id: string;
  tone: Tone;
  pad: SectionPad;
  srTitle?: string;
  // "off" hides the hairline of the thread where the drawing of the section crosses the page axis; "none" also hides
  // the dock on its top edge (the closing, whose docks sit on the strip); "tail" keeps only the stretch under the content
  thread?: "on" | "off" | "tail" | "none";
  // Stretch of the thread at the bottom of the section, with the pulse that goes down to the next dock
  rail?: "drop" | "converge";
  railDelay?: number;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`${shell.band} ${shell[tone]} ${home[pad]}`}
      data-live
      data-on="false"
      data-thread={thread}
    >
      {srTitle && <h2 className={home.srOnly}>{srTitle}</h2>}
      {children}
      {rail && <ConnectorRail variant={rail} delay={railDelay} />}
    </section>
  );
}

// CABEÇALHO DA SEÇÃO
// A short title and, at most, one supporting line: the v2 rule (one short title and one line per section; the rest is
// motion and interaction). The title is the h2 of the section.
// v3 (F2, plano.md 4.1): three variants, marked `data-head`, so the sections stop repeating one centred 40 px h2:
// - chapter: a thesis of the page (the message, the Domus). A hairline across the content, the h2 on the left and its
//   line beside it (under it on a phone);
// - showcase: a section that shows the products working. The h2 centred and its line under it;
// - strip: a compact band (details, where we run). The title at the h3 step (24/20), on the left, no line.
import styles from "./v2.module.css";

export type HeadVariant = "chapter" | "showcase" | "strip";

export function SectionHead({
  title,
  lead,
  id,
  variant = "showcase",
  className,
}: {
  title: string;
  lead?: string;
  id?: string;
  variant?: HeadVariant;
  // Placement only (a grid area, a margin), never a colour or a size
  className?: string;
}) {
  return (
    <div
      className={className ? `${styles.head} ${className}` : styles.head}
      data-head={variant}
    >
      <h2 id={id} className={styles.headTitle}>
        {title}
      </h2>
      {lead && <p className={styles.headLead}>{lead}</p>}
    </div>
  );
}

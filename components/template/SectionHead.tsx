// CABEÇALHO DA SEÇÃO
// Centred title and, at most, one supporting line: the v2 rule (one short title and one line per section; the rest is
// motion and interaction). The title is the h2 of the section.
import styles from "./v2.module.css";

export function SectionHead({
  title,
  lead,
  id,
}: {
  title: string;
  lead?: string;
  id?: string;
}) {
  return (
    <div className={styles.head}>
      <h2 id={id} className={styles.headTitle}>
        {title}
      </h2>
      {lead && <p className={styles.headLead}>{lead}</p>}
    </div>
  );
}

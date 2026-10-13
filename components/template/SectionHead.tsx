// CABEÇALHO DA SEÇÃO
// Centred title and one supporting line; the title is the h2 of the section. It has the colour of the band, so the thread
// of the page runs behind it and shows only around it.
import styles from "./reading.module.css";

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

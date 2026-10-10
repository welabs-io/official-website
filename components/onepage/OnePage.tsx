// PÁGINA ÚNICA
// Four sections, no pause between them: the chain (carousel of the montage cuts), the products (carousel with each
// product's opening tail flowing into its film), the connectors (the products as core and rails, with pulses) and the
// closing (clients and platforms in one strip, final button). See PageFrame for the header and the footer; the thread
// that joins the sections is drawn by the band style of shell.module.css.
import { Chain } from "./Chain";
import { Closing } from "./Closing";
import { ConnectorsBand } from "./ConnectorsBand";
import { PageFrame } from "./PageFrame";
import { Products } from "./Products";
import styles from "./home.module.css";

export function OnePage() {
  return (
    <PageFrame home>
      {/* Page heading for screen readers and SEO; the home shows no visible title */}
      <h1 className={styles.srOnly}>Welabs</h1>
      <Chain />
      <Products />
      <ConnectorsBand />
      <Closing />
    </PageFrame>
  );
}

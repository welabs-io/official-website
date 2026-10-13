// AVISO DE CONFIRMAÇÃO
// The notification that lands on Marina's phone, over the top of the chat: a success icon, the confirmation (the key
// element of the closing scene, with no check repeated in the text) and who sent it. Server markup; the action comes
// from the script.
import type { Act } from "@/lib/scenes/types";
import { Glyph, GLYPHS } from "./icons";
import styles from "./scenes.module.css";

export function ConfirmToast({
  act,
  text,
  meta,
  action,
}: {
  act: Act;
  text: string;
  meta: string;
  action: string;
}) {
  return (
    <div className={styles.toast} data-edge="" {...act(action, "pop")}>
      <span className={styles.toastIcon} aria-hidden="true">
        <Glyph d={GLYPHS.check} size={14} />
      </span>
      <span className={styles.toastText}>
        <b className={styles.key} data-key="">
          {text}
        </b>
        <span>{meta}</span>
      </span>
    </div>
  );
}

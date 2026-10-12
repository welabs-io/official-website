// AVISO DE CONFIRMAÇÃO
// The notification that lands on Marina's phone: an amber check, the confirmation and, under it, the line that says it
// arrived. Server markup; the two actions come from the script.
import type { Act } from "@/lib/scenes/types";
import styles from "./scenes.module.css";

export function ConfirmToast({
  act,
  text,
  received,
  action,
  receivedAction,
}: {
  act: Act;
  text: string;
  received: string;
  action: string;
  receivedAction: string;
}) {
  return (
    <div className={styles.toast}>
      <div className={styles.toastBox} {...act(action, "pop")}>
        <span className={styles.toastCheck} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </span>
        <b data-focal="">{text}</b>
      </div>
      <p className={styles.received} {...act(receivedAction, "in")}>
        {received}
      </p>
    </div>
  );
}

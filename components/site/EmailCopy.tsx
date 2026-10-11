"use client";

// CÓPIA DO ENDEREÇO COMERCIAL
// Confirm only a successful clipboard write; unsupported browsers keep the address visible for manual selection.
import { useState } from "react";
import { CONTACT_EMAIL } from "@/components/onepage/contact";
import styles from "./site.module.css";

export function EmailCopy() {
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setStatus("copied");
    } catch {
      setStatus("manual");
    }
  };
  return (
    <button
      type="button"
      className={styles.copyEmail}
      onClick={copy}
      aria-live="polite"
    >
      {status === "copied"
        ? "Endereço copiado"
        : status === "manual"
          ? "Selecione o endereço acima para copiar"
          : "Copiar e-mail"}
    </button>
  );
}

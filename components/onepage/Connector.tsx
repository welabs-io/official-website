"use client";
// CONECTOR ENTRE SEÇÕES
// Sits at the bottom edge of a section and reaches into the next one. It animates only while it is on screen.
import { useEffect, useRef, useState } from "react";
import styles from "./shell.module.css";

export function Connector() {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span
      ref={ref}
      className={styles.connector}
      data-on={on ? "true" : "false"}
      aria-hidden="true"
    >
      <i className={styles.spark} />
    </span>
  );
}

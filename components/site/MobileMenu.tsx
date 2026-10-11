"use client";

// NAVEGAÇÃO COMPACTA
// Native disclosure keeps keyboard behavior; selecting an anchor closes the menu before navigation.
import type { MouseEvent } from "react";
import styles from "./site.module.css";

const closeOnNavigation = (event: MouseEvent<HTMLDetailsElement>) => {
  if (event.target instanceof Element && event.target.closest("a"))
    event.currentTarget.open = false;
};

export function MobileMenu({ home }: { home: boolean }) {
  const anchor = (id: string) => `${home ? "" : "/"}#${id}`;
  return (
    <details className={styles.mobileMenu} onClickCapture={closeOnNavigation}>
      <summary aria-label="Abrir navegação">
        <span />
        <span />
      </summary>
      <nav aria-label="Navegação mobile">
        <a href={anchor("products")}>Produtos</a>
        <a href={anchor("journey")}>Como funciona</a>
        <a href={anchor("platforms")}>Marcas e tecnologia</a>
        <a href={anchor("contact")}>Contato</a>
      </nav>
    </details>
  );
}

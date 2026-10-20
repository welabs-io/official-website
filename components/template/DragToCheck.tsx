"use client";
// ARRASTAR ATÉ O ALVO
// The one client piece of the interactions: something the visitor can drag (the message of the home, the field of the
// Domus) and drop on a target. A drop inside the target checks the checkbox `inputId`, and the CSS of the section plays
// the effect (v2.module.css, `:has(:checked)`). The same checkbox has a visible label that is the keyboard and
// screen-reader way in, so dragging is only a shortcut: without script, or with a keyboard, the button does it all.
// Listeners are attached by a ref callback (cleaned up when it detaches); only transform moves.
import type { ReactNode } from "react";

export function DragToCheck({
  inputId,
  targetId,
  className,
  children,
}: {
  inputId: string;
  targetId: string;
  className?: string;
  children: ReactNode;
}) {
  const attach = (el: HTMLDivElement | null) => {
    if (!el) return;
    let start: { x: number; y: number; id: number } | null = null;
    // A real drag (more than 4 px) must not also count as a click on a label inside the draggable
    let moved = false;
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    // v2.2: the drag is followed on the window, not by capturing the pointer on the element, so a plain tap still
    // reaches the label inside (a capture on pointerdown sent the click to the wrapper and the chip never checked)
    const follow = (on: boolean) => {
      const fn = on ? window.addEventListener : window.removeEventListener;
      fn("pointermove", move);
      fn("pointerup", up);
      fn("pointercancel", up);
    };
    const click = (e: MouseEvent) => {
      if (!moved) return;
      moved = false;
      e.preventDefault();
      e.stopPropagation();
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      start = null;
      follow(false);
      el.removeAttribute("data-dragging");
      el.style.transform = "";
      const target = document.getElementById(targetId)?.getBoundingClientRect();
      const input = document.getElementById(inputId) as HTMLInputElement | null;
      if (
        target &&
        input &&
        !input.checked &&
        e.clientX >= target.left &&
        e.clientX <= target.right &&
        e.clientY >= target.top &&
        e.clientY <= target.bottom
      )
        input.click();
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      moved = false;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      el.setAttribute("data-dragging", "");
      follow(true);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("click", click, true);
      el.removeEventListener("pointerdown", down);
      follow(false);
    };
  };
  return (
    <div ref={attach} className={className} data-drag>
      {children}
    </div>
  );
}

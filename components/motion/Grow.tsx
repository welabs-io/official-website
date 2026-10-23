// CARTÕES QUE GANHAM LARGURA NO HOVER
// GrowRow and GrowItem (brief-v4, khal-map/mapa.md §2.2): in a row of pieces, the one under the pointer (or holding
// the focus) gains width by flex-grow, never by scale, so its text stays crisp; the others give way. ~700 ms on the
// enter curve (--dur-grow). `grow` picks how far it opens: "card" (1 -> 1.4, a card of a row) or "panel" (1 -> 6, a
// panel of a horizontal accordion). `open` marks the piece opened while nothing else is pointed at (the accordion's
// first panel). CSS only (components/motion/motion.module.css): on a phone the row stacks and nothing grows; reduced
// motion keeps the change of width without the transition.
import type { ComponentProps } from "react";
import m from "./motion.module.css";

export function GrowRow({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div data-grow-row="" className={className ? `${m.row} ${className}` : m.row} {...rest}>
      {children}
    </div>
  );
}

export function GrowItem({
  grow = "card",
  open = false,
  className,
  children,
  ...rest
}: ComponentProps<"div"> & {
  grow?: "card" | "panel";
  open?: boolean;
}) {
  return (
    <div
      data-grow={grow}
      data-open={open || undefined}
      className={className ? `${m.item} ${className}` : m.item}
      {...rest}
    >
      {children}
    </div>
  );
}

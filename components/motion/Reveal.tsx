// ENTRADA DE UM BLOCO NA ROLAGEM
// Reveal (brief-v4, measured on the reference, khal-map/mapa.md §2.5): a block comes in once as it enters the view,
// opacity 0 -> 1 and a rise of 12 to 20 px (--rise-enter, 16 px) in 800 ms on the enter curve, never a blur nor a
// scale. `order` staggers the blocks of a group by 80 ms each (--stagger): the eyebrow 0, the title 1, the cards 2, 3…
// It is the lib's RevealOnScroll (its observer, one-shot) with the site's motion in components/motion/motion.module.css;
// reduced motion shows the block at once.
import type { ComponentProps, CSSProperties } from "react";
import { RevealOnScroll } from "@/components/lib/scene";
import m from "./motion.module.css";

export function Reveal({
  order = 0,
  className,
  style,
  children,
  ...rest
}: ComponentProps<typeof RevealOnScroll> & {
  // Place in the stagger of its group (0 enters first, each next one 80 ms later)
  order?: number;
}) {
  return (
    <RevealOnScroll
      data-reveal=""
      className={className ? `${m.reveal} ${className}` : m.reveal}
      style={{ "--reveal-order": order, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </RevealOnScroll>
  );
}

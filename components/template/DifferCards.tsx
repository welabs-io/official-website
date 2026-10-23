"use client";
// CARTÕES QUE SE ABREM: POR QUE É DIFERENTE
// v4 (Cards.dc.html, 2026-10-23): the three differences of a product as three equal cards in a row, each with its
// number, its title and the details that come with it, closed at rest. The card under the pointer (or holding the
// focus) gains width by flex-grow (the foundation's GrowRow/GrowItem, 1 -> 1.4 in ~700 ms, never a scale) and opens
// its sentence; its + turns 45 degrees into an x. A click on the + keeps the card open (GrowItem `open`) until its x
// closes it, which is also the way on a phone, where the row stacks and nothing grows. Every value is a token of
// app/lib.css (components/template/differ-cards.module.css).
import { useState } from "react";
import { Plus } from "lucide-react";
import { GrowItem, GrowRow } from "@/components/motion/Grow";
import { Card, IconButton } from "@/components/lib/ui";
import type { Differ } from "@/lib/content/products";
import c from "./differ-cards.module.css";

export function DifferCards({
  differs,
  details,
}: {
  differs: readonly Differ[];
  // The details of the product; each card lists the ones it names by index
  details: readonly string[];
}) {
  // The card kept open by its +, if any (one at a time)
  const [pinned, setPinned] = useState<number | null>(null);
  return (
    <GrowRow className={c.row} data-differs="">
      {differs.map((d, i) => {
        const open = pinned === i;
        const bodyId = `differ-${i}`;
        return (
          <GrowItem key={d.title} open={open} className={c.item}>
            {/* The surface is the lib's Card; the GrowItem around it only takes the width */}
            <Card
              flush
              className={c.card}
              data-card=""
              data-pinned={open || undefined}
            >
              <div className={c.head}>
                <span className={c.num}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={c.title}>{d.title}</h3>
                <IconButton
                  icon={<Plus />}
                  label={open ? `Fechar: ${d.title}` : `Abrir: ${d.title}`}
                  emphasis="quiet"
                  className={c.toggle}
                  aria-expanded={open}
                  aria-controls={bodyId}
                  onClick={(e) => {
                    setPinned(open ? null : i);
                    // A pointer's x closes the card for good: the focus it leaves would keep it wide (GrowItem grows on
                    // focus-within); a keyboard keeps its place
                    if (open && e.detail > 0) e.currentTarget.blur();
                  }}
                />
              </div>
              {/* The sentence: laid out at rest with no height, it opens on its grid row as the card grows */}
              <div className={c.body} id={bodyId}>
                <p className={c.bodyText}>{d.body}</p>
              </div>
              <ul className={c.rows}>
                {d.details.map((n) => (
                  <li key={n} className={c.detail}>
                    {details[n]}
                  </li>
                ))}
              </ul>
            </Card>
          </GrowItem>
        );
      })}
    </GrowRow>
  );
}

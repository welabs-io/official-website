// CAMPO DE BUSCA DAS CENAS
// v3 (F2 review, F2-07): the search field of a drawn screen is the site's TextField (the search glyph as its icon and
// the question as the value of a read-only field), like the composer of the Tuner scene; it was a paragraph with a
// border drawn by hand. Inert: a drawing, nothing to type or focus. `asKey` makes the question the key element of its
// scene (18/600, `data-key`); `className` and the rest of the props (the action of the script) place and move the field.
import type { HTMLAttributes } from "react";
import { TextField } from "@/components/lib/ui";
import { Glyph, GLYPHS } from "./icons";
import s from "./scenes.module.css";

export function SceneSearch({
  query,
  asKey = false,
  className,
  ...rest
}: {
  query: string;
  asKey?: boolean;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[className, asKey ? s.searchKey : ""].filter(Boolean).join(" ")}
      data-theme="welabs"
      inert
      {...rest}
    >
      <TextField
        size={asKey ? "md" : "sm"}
        icon={<Glyph d={GLYPHS.search} size={16} />}
        readOnly
        tabIndex={-1}
        value={query}
        aria-label={query}
        data-key={asKey ? "" : undefined}
      />
    </div>
  );
}

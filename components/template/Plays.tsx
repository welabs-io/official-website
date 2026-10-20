// UMA INTERAÇÃO POR PRODUTO
// v2.2 (audit A05, section 4): the five plays moved to components/plays, each a short chain the visitor drives (a
// choice, three to five beats, the record of what happened and the effect on the Domus). Native controls and CSS
// (`:has(:checked)`), so they work with no script, with a keyboard and with a screen reader.
import type { ProductSlug } from "@/lib/products";
import { DomusPlay } from "@/components/plays/DomusPlay";
import { KnowlyPlay } from "@/components/plays/KnowlyPlay";
import { MagnetoPlay } from "@/components/plays/MagnetoPlay";
import { RellooPlay } from "@/components/plays/RellooPlay";
import { TunerPlay } from "@/components/plays/TunerPlay";

export const PLAYS: Record<ProductSlug, () => React.JSX.Element> = {
  domus: DomusPlay,
  relloo: RellooPlay,
  magneto: MagnetoPlay,
  tuner: TunerPlay,
  knowly: KnowlyPlay,
};

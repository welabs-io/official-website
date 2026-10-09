// PÁGINA ÚNICA
// Seven sections in one scroll: living hub, Domus, Relloo, rails (Magneto, Tuner, Knowly), chain, Welabs, closing.
// No video and no player: every motion is SVG/CSS drawn on the page. See PageFrame for the header and closing.
import { Hub } from "./Hub";
import { PageFrame } from "./PageFrame";
import { DomusSection, RailsSection, RellooSection } from "./Sections";

export function OnePage() {
  return (
    <PageFrame home>
      <Hub />
      <DomusSection />
      <RellooSection />
      <RailsSection />
    </PageFrame>
  );
}

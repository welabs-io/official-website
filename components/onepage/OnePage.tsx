// PÁGINA ÚNICA
// Three sections, no pause between them: the chain at the top (title, line, button and the ring of the four chain
// films), the products (ring with each product's opening tail flowing into its film), and the closing (clients and
// platforms in one theme, final button). See PageFrame for the header and the footer.
import { Closing } from "./Closing";
import { Hero } from "./Hero";
import { PageFrame } from "./PageFrame";
import { Products } from "./Products";

export function OnePage() {
  return (
    <PageFrame home>
      <Hero />
      <Products />
      <Closing />
    </PageFrame>
  );
}

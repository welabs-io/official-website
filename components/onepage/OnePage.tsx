// PÁGINA ÚNICA
// Three sections, no pause between them: the chain (carousel of the montage cuts), the products (carousel with each
// product's opening tail flowing into its film) and the closing (clients and platforms in one strip, final button).
// See PageFrame for the header and the footer.
import { Chain } from "./Chain";
import { Closing } from "./Closing";
import { PageFrame } from "./PageFrame";
import { Products } from "./Products";

export function OnePage() {
  return (
    <PageFrame home>
      <Chain />
      <Products />
      <Closing />
    </PageFrame>
  );
}

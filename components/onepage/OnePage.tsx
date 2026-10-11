// PÁGINA ÚNICA
// The chain and its architecture share the opening; the product carousel is a separate exploration surface.
// Existing motion assets remain independent of the page layout and its navigation.
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

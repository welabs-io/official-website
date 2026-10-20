import { Descent } from "@/components/onepage/Descent";
import descent from "@/components/onepage/descent.module.css";
import { PageFrame } from "@/components/onepage/PageFrame";
import { Sections } from "@/components/template/SiteTemplate";
import { HOME_HEAD, HOME_TAIL } from "@/lib/site-config";

// PÁGINA ÚNICA COM DESCIDA
// The home and the five products are one page: this layout keeps the head of the home (from the opening to the five
// products) mounted across every route, the page of the route fills the slot under it (nothing on the home, the product
// on /products/<slug>), and the tail of the home gives way while the slot holds a product (descent.module.css). Moving
// between routes never remounts the home, so the products band is really above the product, and the way back is up.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageFrame>
      <Sections config={HOME_HEAD} />
      <div className={descent.slot} data-descent-slot>
        {children}
      </div>
      <div className={descent.tail} data-descent-tail>
        <Sections config={HOME_TAIL} />
      </div>
      <Descent />
    </PageFrame>
  );
}

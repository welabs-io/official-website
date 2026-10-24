import { Descent } from "@/components/onepage/Descent";
import { PageFrame } from "@/components/onepage/PageFrame";

// MOLDURA DAS PÁGINAS DO SITE
// The header, the footer and the move between pages stay mounted across the routes of the site; the page of the route
// (the home, or one product on /products/<slug>) fills the slot between them. v3 (operator, 2026-10-21): a product is
// a page of its own, with no part of the home rendered above it; the way in keeps the brand opening of the product
// (components/onepage/descent-run.ts), and the way back is the menu and the logo.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageFrame>
      <div data-descent-slot>{children}</div>
      <Descent />
    </PageFrame>
  );
}

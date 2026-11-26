import { notFound } from "next/navigation";
import { Descent } from "@/components/onepage/Descent";
import { earlyHoldScript } from "@/components/onepage/early-hold";
import { PageFrame } from "@/components/onepage/PageFrame";
import { isLocale } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/i18n";

// MOLDURA DAS PÁGINAS DO SITE
// The header, the footer and the move between pages stay mounted across the routes of the site; the page of the route
// (the home, or one product on /products/<slug>) fills the slot between them. v3 (operator, 2026-10-21): a product is
// a page of its own, with no part of the home rendered above it; the way in keeps the brand opening of the product
// (components/onepage/descent-run.ts), and the way back is the menu and the logo. The frame is written in the locale of
// the segment (pt-BR with no prefix, /en, /es). An inline script holds a click on a link that comes before the engine of
// the move, from the first parsed byte (components/onepage/early-hold.ts).
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <PageFrame i18n={getI18n(locale)}>
      <script dangerouslySetInnerHTML={{ __html: earlyHoldScript() }} />
      <div data-descent-slot>{children}</div>
      <Descent />
    </PageFrame>
  );
}

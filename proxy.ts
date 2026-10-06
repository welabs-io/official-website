import { NextResponse, type NextRequest } from "next/server";
// RETIRADA DE PACOTES LEGADOS
// Legacy packs that cite a client agency, an internal codename, a retired product name or a retired
// product are not served over HTTP; product pages still read their manifest from disk on the server.
// flow joined on 2026-10-06: its pack names the product "Flow", now Magneto.
const packs =
  "malupe|autoinfracao|sgors|kiosk-brands|sgici|erp|wekb|welabs-crm|flow";
const retired = new RegExp(
  `^/(presentations/(${packs})/|presentation-downloads/(${packs})-\\d|apresentacoes/(${packs})(/|$))`,
);
export function proxy(request: NextRequest) {
  if (retired.test(request.nextUrl.pathname))
    return new NextResponse(null, { status: 404 });
  const headers = new Headers(request.headers);
  headers.set(
    "x-portfolio-language",
    request.nextUrl.searchParams.get("lang") === "en" ? "en" : "pt",
  );
  return NextResponse.next({ request: { headers } });
}
export const config = {
  matcher: [
    "/",
    "/sobre",
    "/servicos",
    "/portfolio/:path*",
    "/welabs/:path*",
    "/apresentacoes/:path*",
    "/portfolio-preview/:path*",
    "/presentations/:path*",
    "/presentation-downloads/:path*",
  ],
};

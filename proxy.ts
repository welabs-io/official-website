import { NextResponse, type NextRequest } from "next/server";
// IDIOMA NA RENDERIZAÇÃO DO SERVIDOR
// Passes ?lang=en to the root layout so the first paint already has the right <html lang>.
// The legacy presentation packs it used to block left the repository with the split of 2026-10-07.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(
    "x-portfolio-language",
    request.nextUrl.searchParams.get("lang") === "en" ? "en" : "pt",
  );
  return NextResponse.next({ request: { headers } });
}
export const config = {
  matcher: ["/", "/sobre", "/solucoes", "/produtos/:path*"],
};

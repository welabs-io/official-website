// ENDEREÇOS ANTIGOS DO SITE
// Routes are in English (/products/<slug>). Every older address (Portuguese routes, the preview /new, the old /welabs
// section of the shared site, internal product ids and former slugs) keeps a permanent redirect that lands on its
// final address in ONE hop. The query string is kept by Next. Pages that became redundant land on a section anchor.
const CURRENT = ["domus", "relloo", "magneto", "tuner", "knowly"];
// Internal ids and former slugs -> current slug (same data as lib/public-slugs.ts; a test keeps them equal)
const FORMER = {
  erp: "domus",
  flow: "magneto",
  wekb: "knowly",
  "welabs-crm": "relloo",
  channels: "tuner",
  rello: "relloo",
  "hub-de-dominio": "domus",
};
// Product hidden for now: its addresses land on the products section (temporary, it may return)
const HIDDEN = ["malupe", "ecossistema-monitoramento", "operacao-seguranca"];

const productRedirects = (prefix) => [
  ...CURRENT.map((slug) => ({
    source: `${prefix}/${slug}`,
    destination: `/products/${slug}`,
    permanent: true,
  })),
  ...Object.entries(FORMER).map(([old, slug]) => ({
    source: `${prefix}/${old}`,
    destination: `/products/${slug}`,
    permanent: true,
  })),
  ...HIDDEN.map((old) => ({
    source: `${prefix}/${old}`,
    destination: "/#products",
    permanent: false,
  })),
];

const redirects = [
  { source: "/new", destination: "/", permanent: true },
  // Portuguese routes of the previous site
  { source: "/produtos", destination: "/#products", permanent: true },
  { source: "/solucoes", destination: "/#products", permanent: true },
  { source: "/sobre", destination: "/#about", permanent: true },
  ...productRedirects("/produtos"),
  // Retired slugs under the English route
  ...productRedirects("/products").filter(
    (r) => !CURRENT.some((slug) => r.source === `/products/${slug}`),
  ),
  // Until 2026-10-07 these pages lived under /welabs in the shared site
  { source: "/welabs", destination: "/", permanent: true },
  { source: "/welabs/produtos", destination: "/#products", permanent: true },
  { source: "/welabs/solucoes", destination: "/#products", permanent: true },
  { source: "/welabs/sobre", destination: "/#about", permanent: true },
  ...productRedirects("/welabs/produtos"),
  { source: "/welabs/:path*", destination: "/", permanent: true },
  { source: "/portfolio-preview/welabs", destination: "/", permanent: true },
  ...productRedirects("/portfolio-preview").filter((r) => r.permanent),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  // Allows a second local build next to a running preview without sharing .next
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  async redirects() {
    return redirects;
  },
};

export default nextConfig;

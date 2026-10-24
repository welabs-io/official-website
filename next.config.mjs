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

// `home` is the locale prefix of the destinations ("" for pt-BR, "/en", "/es"): the same retired slugs redirect inside
// each locale, so /en/products/rello lands on /en/products/relloo
const productRedirects = (prefix, home = "") => [
  ...CURRENT.map((slug) => ({
    source: `${prefix}/${slug}`,
    destination: `${home}/products/${slug}`,
    permanent: true,
  })),
  ...Object.entries(FORMER).map(([old, slug]) => ({
    source: `${prefix}/${old}`,
    destination: `${home}/products/${slug}`,
    permanent: true,
  })),
  ...HIDDEN.map((old) => ({
    source: `${prefix}/${old}`,
    destination: `${home}/#products`,
    permanent: false,
  })),
];

// IDIOMAS
// pt-BR is the default locale and has no prefix: `/` and `/products/<slug>` are served by the locale segment (rewrites
// below) and the explicit `/pt-BR/...` address redirects back, so a page has one address. en and es are prefixed.
const PREFIXED = ["en", "es"];
const localeRedirects = [
  { source: "/pt-BR", destination: "/", permanent: true },
  {
    source: "/pt-BR/products/:slug",
    destination: "/products/:slug",
    permanent: true,
  },
  ...PREFIXED.flatMap((locale) => [
    {
      source: `/${locale}/products`,
      destination: `/${locale}#products`,
      permanent: true,
    },
    // Retired slugs under the prefixed route (the current ones are real pages)
    ...productRedirects(`/${locale}/products`, `/${locale}`).filter(
      (r) =>
        !CURRENT.some((slug) => r.source === `/${locale}/products/${slug}`),
    ),
  ]),
];

const redirects = [
  ...localeRedirects,
  { source: "/new", destination: "/", permanent: true },
  // Portuguese routes of the previous site
  { source: "/produtos", destination: "/#products", permanent: true },
  { source: "/solucoes", destination: "/#products", permanent: true },
  // v2.1: the band #chain left the home; "about" lands on the message that crosses the five products
  { source: "/sobre", destination: "/#message", permanent: true },
  // English routes that have no page of their own: the home already holds that content
  { source: "/products", destination: "/#products", permanent: true },
  { source: "/solutions", destination: "/#products", permanent: true },
  { source: "/about", destination: "/#message", permanent: true },
  ...productRedirects("/produtos"),
  // Retired slugs under the English route
  ...productRedirects("/products").filter(
    (r) => !CURRENT.some((slug) => r.source === `/products/${slug}`),
  ),
  // Until 2026-10-07 these pages lived under /welabs in the shared site
  { source: "/welabs", destination: "/", permanent: true },
  { source: "/welabs/produtos", destination: "/#products", permanent: true },
  { source: "/welabs/solucoes", destination: "/#products", permanent: true },
  { source: "/welabs/sobre", destination: "/#message", permanent: true },
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
  // The dev server serves its chunks and HMR to 127.0.0.1 too (the operator opens the lab there); dev only
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return redirects;
  },
  // pt-BR without a prefix: the two pages of the site are served by the locale segment (app/[locale]) with the default
  // locale. Runs after the redirects above (retired slugs land on their final address first) and before the files.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/pt-BR" },
        { source: "/products/:slug", destination: "/pt-BR/products/:slug" },
      ],
    };
  },
};

export default nextConfig;

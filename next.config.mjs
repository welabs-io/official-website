// ENDEREÇOS ANTIGOS DA SEÇÃO WELABS
// Until 2026-10-07 the Welabs pages lived under /welabs in the shared site; here Welabs is the root,
// so every old address keeps a permanent redirect to its new place (/welabs/produtos/x -> /produtos/x).
const legacyRedirects = [
  { source: "/welabs", destination: "/", permanent: true },
  { source: "/welabs/:path*", destination: "/:path*", permanent: true },
  { source: "/portfolio-preview/welabs", destination: "/", permanent: true },
  // Old preview links of Welabs products land on the product page (which redirects ids to public slugs).
  {
    source:
      "/portfolio-preview/:slug(erp|flow|wekb|welabs-crm|malupe|channels)",
    destination: "/produtos/:slug",
    permanent: true,
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  // Allows a second local build next to a running preview without sharing .next
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;

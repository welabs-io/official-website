/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  // Allows a second local build next to a running preview without sharing .next
  ...(process.env.NEXT_DIST_DIR ? {distDir: process.env.NEXT_DIST_DIR} : {}),
};

export default nextConfig;

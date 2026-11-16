import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Every route on this site is prerendered in full at build time (the catalogue
  // is static data, and all dynamic segments come from generateStaticParams), so
  // links prefetch the finished page rather than a per-route shell that would
  // then have to stream its product content in after navigation.
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

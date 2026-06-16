import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Turbopack is stable: move previous `experimental.turbo` config here.
  turbopack: {
    root: __dirname,
    // Shim problematic Node-only modules pulled in by transitive dev tooling.
    resolveAlias: {
      "stream/consumers": "./lib/shims/stream-consumers",
      nock: "./lib/shims/nock",
    },
    rules: {
      // Allow HTML files (like the one from @mapbox/node-pre-gyp) to be loaded
      "*.html": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
